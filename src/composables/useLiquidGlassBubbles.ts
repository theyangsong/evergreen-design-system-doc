import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  type Ref,
} from 'vue';
import * as THREE from 'three';
import { DOC_FONT_FAMILY_TEXT } from '@/styles/fontStack';

const MAX_DROPLETS = 40;
const FIXED_DT_MS = 8;
const MAX_FRAME_DT_MS = 100;
const MAX_CATCHUP = 6;
const MAX_ENTRIES = MAX_DROPLETS * 2;
const RESIZE_DEBOUNCE_MS = 200;

const DAMP = 0.993;
const MOUSE_R = 0.18;
const MOUSE_F = 0.004;
const TENSION_RANGE = 0.12;
const TENSION_F = 0.0004;
const MERGE_RATIO = 0.62;
const SPLIT_SPEED = 0.013;
const SPLIT_MIN_R = 0.04;
const MAX_SPEED = 0.015;
const BOUNCE = 0.4;
const WANDER_F = 0.00004;
const CENTER_PULL = 0.000008;
const SOFT_STIFFNESS = 0.22;
const SOFT_DAMPING = 0.6;

const CURSOR_BUBBLE_R = 0.1;
const CURSOR_SPRING = 0.32;
const CURSOR_DAMP = 0.68;
const CURSOR_MAX_SPEED = 0.045;

const TITLE_FONT = DOC_FONT_FAMILY_TEXT;
const SUBTITLE_FONT = DOC_FONT_FAMILY_TEXT;

type Droplet = {
  id: number;
  x: number;
  y: number;
  r: number;
  area: number;
  vx: number;
  vy: number;
  alive: boolean;
  wanderAngle: number;
  wanderSpeed: number;
  softPrevX: number;
  softPrevY: number;
  softOffX: number;
  softOffY: number;
  softVelX: number;
  softVelY: number;
  followsCursor?: boolean;
};

export type LiquidGlassBubblesOptions = {
  title?: string;
  subtitle?: string;
};

const DEFAULT_OPTIONS: Required<LiquidGlassBubblesOptions> = {
  title: 'EDS.',
  subtitle: 'EverGreen Ecosystem Builder',
};

const TITLE_SUBTITLE_GAP = 0;
const SUBTITLE_SIZE = 56;

function buildFragmentShader(maxEntries: number) {
  return /* glsl */ `
precision highp float;
#define MAX_N ${maxEntries}

uniform vec2 uRes;
uniform sampler2D uData;
uniform sampler2D uBg;
uniform int uCount;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);

  float field = 0.0;
  vec2 grad = vec2(0.0);
  vec2 lens = vec2(0.0);
  float lensW = 0.0;

  for (int i = 0; i < MAX_N; i++) {
    if (i >= uCount) break;
    vec4 d = texture2D(uData, vec2((float(i) + 0.5) / float(MAX_N), 0.5));
    vec2 c = d.xy;
    float r = d.z;
    if (r < 0.001) continue;
    vec2 delta = p - c;
    float dSq = dot(delta, delta) + 1e-5;
    float contrib = r * r / dSq;
    field += contrib;
    grad += -2.0 * contrib / dSq * delta;
    float w = r * r / (dSq + r * r);
    lens += (c - p) * w;
    lensW += w;
  }

  lens /= (lensW + 0.001);
  float lensLen = length(lens);

  float thr = 1.0;
  float edge = smoothstep(thr - 0.08, thr + 0.03, field);

  float mappedLens = atan(lensLen * 6.0) * 0.035;
  vec2 refractDir = (lensLen > 1e-5) ? lens / lensLen : vec2(0.0);
  float refractMask = smoothstep(thr - 0.2, thr + 1.5, field);
  vec2 refractedUV = clamp(uv + refractDir * mappedLens * refractMask, 0.001, 0.999);

  vec3 bgClean = texture2D(uBg, uv).rgb;

  float gradLen = length(grad);
  float nScale = atan(gradLen * 0.5) * 0.3;
  vec2 nGrad = (gradLen > 1e-4) ? (grad / gradLen) * nScale : vec2(0.0);
  vec3 N = normalize(vec3(-nGrad, 1.0));
  vec3 L = normalize(vec3(0.3, 0.6, 1.0));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float diff = max(dot(N, L), 0.0);
  float spec = pow(max(dot(N, H), 0.0), 180.0);
  float cosTheta = max(dot(N, V), 0.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - cosTheta, 4.0);
  float rim = smoothstep(thr + 0.6, thr, field) * edge;

  float caStr = 0.0018 * edge;
  vec3 bgCA;
  bgCA.r = texture2D(uBg, refractedUV + vec2(caStr, caStr * 0.5)).r;
  bgCA.g = texture2D(uBg, refractedUV).g;
  bgCA.b = texture2D(uBg, refractedUV - vec2(caStr, caStr * 0.5)).b;

  float depth = smoothstep(thr, thr + 3.0, field);
  vec3 tint = mix(vec3(1.0), vec3(0.93, 0.96, 1.0), depth * 0.45);
  vec3 glassColor = bgCA * tint * (0.92 + 0.08 * diff)
    + vec3(1.0) * spec * 0.85
    + vec3(0.9, 0.95, 1.0) * rim * 0.22
    + vec3(1.0) * fresnel * 0.10;

  float shadowField = smoothstep(thr - 0.35, thr - 0.05, field);
  vec3 bg = bgClean * (1.0 - shadowField * 0.06);

  float borderOuter = smoothstep(thr - 0.10, thr - 0.01, field);
  float borderInner = smoothstep(thr + 0.0, thr + 0.06, field);
  float border = borderOuter * (1.0 - borderInner) * 0.28;

  vec3 col = mix(bg, glassColor, edge);
  col += vec3(1.0) * border;

  gl_FragColor = vec4(col, 1.0);
}
`;
}

function readContainerSize(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  return {
    width: Math.max(1, rect.width, container.clientWidth),
    height: Math.max(1, rect.height, container.clientHeight),
  };
}

type StarParticle = {
  nx: number;
  ny: number;
  depth: number;
  radius: number;
  twinkleSpeed: number;
  phase: number;
  baseAlpha: number;
  accent: boolean;
};

let starfieldParticles: StarParticle[] | null = null;
let starfieldKey = '';

const GRID_SPACING = 380;
const GRID_SPACING_SECONDARY = Math.round(GRID_SPACING * 1.5);
const GRID_TILE_CELLS = 2;
const GRID_ALPHA = 0.08;
const GRID_ALPHA_SECONDARY = 0.1;

type GridTileEntry = {
  spacing: number;
  strokeAlpha: number;
  dotAlpha: number;
  canvas: HTMLCanvasElement;
};

const gridTileCache: GridTileEntry[] = [];

function ensureGridTile(
  spacing: number,
  strokeAlpha: number,
  dotAlpha: number,
): HTMLCanvasElement | null {
  const cached = gridTileCache.find(
    (entry) =>
      entry.spacing === spacing &&
      entry.strokeAlpha === strokeAlpha &&
      entry.dotAlpha === dotAlpha,
  );
  if (cached) return cached.canvas;

  const size = spacing * GRID_TILE_CELLS;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.strokeStyle = `rgba(0, 230, 135, ${strokeAlpha})`;
  ctx.fillStyle = `rgba(235, 250, 242, ${dotAlpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= GRID_TILE_CELLS; i++) {
    const p = i * spacing + 0.5;
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
  }
  ctx.stroke();

  for (let x = 0; x <= size; x += spacing) {
    for (let y = 0; y <= size; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, 0.75, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  gridTileCache.push({ spacing, strokeAlpha, dotAlpha, canvas });
  return canvas;
}

function tileGridLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tile: HTMLCanvasElement,
  alpha: number,
  offsetX = 0,
  offsetY = 0,
) {
  const tileSize = tile.width;
  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;

  for (let y = offsetY; y < height + tileSize; y += tileSize) {
    for (let x = offsetX; x < width + tileSize; x += tileSize) {
      ctx.drawImage(tile, x, y);
    }
  }

  ctx.restore();
}

function ensureStarfield(width: number, height: number) {
  const key = `${Math.round(width / 200)}x${Math.round(height / 200)}`;
  if (starfieldParticles && starfieldKey === key) return;

  const count = Math.min(160, Math.max(64, Math.round((width * height) / 16000)));
  starfieldParticles = Array.from({ length: count }, () => ({
    nx: Math.random(),
    ny: Math.random(),
    depth: Math.random(),
    radius: Math.random() < 0.1 ? 1.1 + Math.random() * 1.6 : 0.35 + Math.random() * 0.85,
    twinkleSpeed: 0.7 + Math.random() * 2.4,
    phase: Math.random() * Math.PI * 2,
    baseAlpha: 0.12 + Math.random() * 0.5,
    accent: Math.random() < 0.24,
  }));
  starfieldKey = key;
}

function paintStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  ensureStarfield(width, height);
  if (!starfieldParticles) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (const star of starfieldParticles) {
    const drift = 0.25 + star.depth * 0.75;
    const nx = (star.nx + time * 0.012 * drift) % 1;
    const ny = (star.ny + time * 0.006 * drift + Math.sin(time * 0.35 + star.phase) * 0.004) % 1;
    const x = nx * width;
    const y = ny * height;
    const twinkle = 0.55 + Math.sin(time * star.twinkleSpeed + star.phase) * 0.45;
    const alpha = star.baseAlpha * twinkle * (0.65 + star.depth * 0.35);
    const radius = star.radius * (0.75 + star.depth * 0.55);

    if (star.accent) {
      ctx.fillStyle = `rgba(0, 230, 135, ${alpha * 0.75})`;
    } else {
      ctx.fillStyle = `rgba(235, 250, 242, ${alpha * 0.6})`;
    }

    if (radius > 1.1) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = star.accent
        ? `rgba(0, 230, 135, ${alpha * 0.18})`
        : `rgba(255, 255, 255, ${alpha * 0.14})`;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const size = Math.max(1, radius * 2);
      ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
    }
  }

  ctx.restore();
}

let staticGridCanvas: HTMLCanvasElement | null = null;
let staticGridKey = '';

function bakeStaticGrid(width: number, height: number) {
  const key = `${width}x${height}@${GRID_ALPHA}@${GRID_ALPHA_SECONDARY}@${GRID_SPACING}@${GRID_SPACING_SECONDARY}`;
  if (staticGridCanvas && staticGridKey === key) return;

  const primaryTile = ensureGridTile(GRID_SPACING, 0.99, 0.45);
  const secondaryTile = ensureGridTile(GRID_SPACING_SECONDARY, 0.42, 0.28);
  if (!primaryTile || !secondaryTile) return;

  staticGridCanvas = document.createElement('canvas');
  staticGridCanvas.width = width;
  staticGridCanvas.height = height;
  const ctx = staticGridCanvas.getContext('2d');
  if (!ctx) return;

  const secondaryOffset = Math.round(GRID_SPACING_SECONDARY / 2);
  tileGridLayer(ctx, width, height, secondaryTile, GRID_ALPHA_SECONDARY, secondaryOffset, secondaryOffset);
  tileGridLayer(ctx, width, height, primaryTile, GRID_ALPHA);

  staticGridKey = key;
}

function paintDotGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  bakeStaticGrid(width, height);
  if (!staticGridCanvas) return;
  ctx.drawImage(staticGridCanvas, 0, 0);
}

export function useLiquidGlassBubbles(
  containerRef: Ref<HTMLElement | null>,
  options: LiquidGlassBubblesOptions = {},
) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  let disposed = false;
  let rafId = 0;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let intersectionObserver: IntersectionObserver | undefined;

  let renderer: THREE.WebGLRenderer | undefined;
  let scene: THREE.Scene | undefined;
  let camera: THREE.OrthographicCamera | undefined;
  let mat: THREE.ShaderMaterial | undefined;
  let bgCanvas: HTMLCanvasElement | undefined;
  let bgCtx: CanvasRenderingContext2D | null = null;
  let bgBaseCanvas: HTMLCanvasElement | undefined;
  let bgBaseCtx: CanvasRenderingContext2D | null = null;
  let overlayCanvas: HTMLCanvasElement | undefined;
  let overlayCtx: CanvasRenderingContext2D | null = null;
  let bgTexture: THREE.CanvasTexture | undefined;
  let dropletBuf = new Float32Array(MAX_ENTRIES * 4);
  let dropletTex: THREE.DataTexture | undefined;
  let drops: Droplet[] = [];
  let uid = 0;
  let aspect = 1;
  let paused = false;
  let inView = true;
  let last = performance.now();
  let acc = 0;
  let spawnCD = 0;
  let autoTimer = 0;
  let simTime = 0;

  const mouse = { x: 999, y: 999, active: false, down: false };

  function regularDrops() {
    return drops.filter((d) => !d.followsCursor && d.alive);
  }

  function spawn(x: number, y: number, r: number, vx = 0, vy = 0) {
    if (regularDrops().length >= MAX_DROPLETS) return null;
    const area = Math.PI * r * r;
    const angle = Math.random() * Math.PI * 2;
    const spd = 0.0003 + Math.random() * 0.0008;
    const d: Droplet = {
      id: uid++,
      x,
      y,
      r,
      area,
      vx: vx || Math.cos(angle) * spd,
      vy: vy || Math.sin(angle) * spd,
      alive: true,
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: 0.3 + Math.random() * 0.5,
      softPrevX: x,
      softPrevY: y,
      softOffX: 0,
      softOffY: 0,
      softVelX: 0,
      softVelY: 0,
    };
    drops.push(d);
    return d;
  }

  function spawnCursorBubble() {
    const r = CURSOR_BUBBLE_R;
    const area = Math.PI * r * r;
    const d: Droplet = {
      id: uid++,
      x: 0,
      y: 0,
      r,
      area,
      vx: 0,
      vy: 0,
      alive: true,
      wanderAngle: 0,
      wanderSpeed: 0,
      softPrevX: 0,
      softPrevY: 0,
      softOffX: 0,
      softOffY: 0,
      softVelX: 0,
      softVelY: 0,
      followsCursor: true,
    };
    drops.unshift(d);
    return d;
  }

  const OVERLAY_SCALE = 0.5;
  const TITLE_DOT_BLINK_PERIOD = 0.85;
  let titleDotLayout: {
    x: number;
    y: number;
    font: string;
    char: string;
  } | null = null;

  function drawBlinkingTitleDot(time: number) {
    if (!bgCtx || !titleDotLayout) return;
    const visible =
      Math.floor(time * (2 / TITLE_DOT_BLINK_PERIOD)) % 2 === 0;
    if (!visible) return;

    bgCtx.save();
    bgCtx.font = titleDotLayout.font;
    bgCtx.textAlign = 'left';
    bgCtx.textBaseline = 'middle';
    bgCtx.fillStyle = '#ffffff';
    bgCtx.fillText(titleDotLayout.char, titleDotLayout.x, titleDotLayout.y);
    bgCtx.restore();
  }

  function composeBackground(time: number) {
    if (!bgCtx || !bgCanvas || !bgBaseCanvas || !bgTexture) return;

    const w = bgCanvas.width;
    const h = bgCanvas.height;
    const ow = Math.max(1, Math.round(w * OVERLAY_SCALE));
    const oh = Math.max(1, Math.round(h * OVERLAY_SCALE));

    if (!overlayCanvas) {
      overlayCanvas = document.createElement('canvas');
      overlayCtx = overlayCanvas.getContext('2d');
    }

    if (overlayCanvas.width !== ow || overlayCanvas.height !== oh) {
      overlayCanvas.width = ow;
      overlayCanvas.height = oh;
    }

    if (overlayCtx) {
      overlayCtx.clearRect(0, 0, ow, oh);
      paintStarfield(overlayCtx, ow, oh, time);
    }

    bgCtx.drawImage(bgBaseCanvas, 0, 0, w, h);
    if (overlayCanvas) {
      bgCtx.imageSmoothingEnabled = true;
      bgCtx.drawImage(overlayCanvas, 0, 0, w, h);
    }
    drawBlinkingTitleDot(time);
    bgTexture.needsUpdate = true;
  }

  function drawBackground() {
    if (!bgCtx || !renderer || !bgCanvas || !bgTexture) return;

    const w = renderer.domElement.width;
    const h = renderer.domElement.height;

    if (!bgBaseCanvas) {
      bgBaseCanvas = document.createElement('canvas');
      bgBaseCtx = bgBaseCanvas.getContext('2d');
    }

    bgCanvas.width = w;
    bgCanvas.height = h;
    bgBaseCanvas.width = w;
    bgBaseCanvas.height = h;

    const ctx = bgBaseCtx;
    if (!ctx) return;

    const base = ctx.createLinearGradient(0, 0, w * 0.55, h);
    base.addColorStop(0, '#0d5a3a');
    base.addColorStop(0.45, '#106B45');
    base.addColorStop(1, '#0a4f34');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    const topLeftDark = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.28);
    topLeftDark.addColorStop(0, 'rgba(8, 48, 32, 0.28)');
    topLeftDark.addColorStop(1, 'rgba(10, 79, 52, 0)');
    ctx.fillStyle = topLeftDark;
    ctx.fillRect(0, 0, w, h);

    const bottomRightLight = ctx.createRadialGradient(w, h, 0, w, h, w * 0.4);
    bottomRightLight.addColorStop(0, 'rgba(0, 230, 135, 0.24)');
    bottomRightLight.addColorStop(1, 'rgba(10, 107, 69, 0)');
    ctx.fillStyle = bottomRightLight;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.22;
    const glows = [
      { cx: w * 0.18, cy: h * 0.22, r: w * 0.42, color: 'rgba(0, 230, 135, 0.55)' },
      { cx: w * 0.82, cy: h * 0.68, r: w * 0.38, color: 'rgba(0, 230, 135, 0.35)' },
      { cx: w * 0.55, cy: h * 0.88, r: w * 0.5, color: 'rgba(16, 107, 69, 0.8)' },
    ];
    for (const glow of glows) {
      const rg = ctx.createRadialGradient(
        glow.cx,
        glow.cy,
        0,
        glow.cx,
        glow.cy,
        glow.r,
      );
      rg.addColorStop(0, glow.color);
      rg.addColorStop(1, 'rgba(10, 79, 52, 0)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    paintDotGrid(ctx, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pixelRatio = renderer.getPixelRatio();
    const titleSize = Math.round(w * 0.13);
    const subSize = Math.round(SUBTITLE_SIZE * pixelRatio);
    const titleY = h * 0.38;

    ctx.font = `900 ${titleSize}px ${TITLE_FONT}`;
    const titleBase = config.title.endsWith('.')
      ? config.title.slice(0, -1)
      : config.title;
    const titleSuffix = config.title.endsWith('.') ? '.' : '';

    if (titleSuffix) {
      const fullWidth = ctx.measureText(config.title).width;
      const baseWidth = ctx.measureText(titleBase).width;
      const titleStartX = w * 0.5 - fullWidth / 2;
      ctx.textAlign = 'left';
      ctx.fillText(titleBase, titleStartX, titleY);
      titleDotLayout = {
        x: titleStartX + baseWidth,
        y: titleY,
        font: `900 ${titleSize}px ${TITLE_FONT}`,
        char: titleSuffix,
      };
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(titleBase, w * 0.5, titleY);
      titleDotLayout = null;
    }

    ctx.textAlign = 'center';
    const subtitleY =
      titleY + titleSize * 0.5 + TITLE_SUBTITLE_GAP * pixelRatio + subSize * 0.5;
    ctx.font = `500 ${subSize}px ${SUBTITLE_FONT}`;
    ctx.globalAlpha = 0.85;
    ctx.fillText(config.subtitle, w * 0.5, subtitleY);
    ctx.globalAlpha = 1;

    composeBackground(0);
  }

  function applyForces(time: number) {
    for (const d of drops) {
      if (d.followsCursor) {
        const tx = mouse.active ? mouse.x : 0;
        const ty = mouse.active ? mouse.y : 0;
        d.vx += (tx - d.x) * CURSOR_SPRING;
        d.vy += (ty - d.y) * CURSOR_SPRING;
        d.vx *= CURSOR_DAMP;
        d.vy *= CURSOR_DAMP;
        continue;
      }

      d.wanderAngle += (Math.random() - 0.5) * d.wanderSpeed;
      d.vx += Math.cos(d.wanderAngle) * WANDER_F;
      d.vy += Math.sin(d.wanderAngle) * WANDER_F;
      d.vx -= d.x * CENTER_PULL;
      d.vy -= d.y * CENTER_PULL;

      if (mouse.active) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dSq = dx * dx + dy * dy;
        const rr = MOUSE_R + d.r;
        if (dSq < rr * rr && dSq > 1e-5) {
          const dist = Math.sqrt(dSq);
          const s = 1 - dist / rr;
          const f = s * s * MOUSE_F;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
        }
      }
    }

    for (let i = 0; i < drops.length; i++) {
      const a = drops[i];
      if (a.followsCursor) continue;
      for (let j = i + 1; j < drops.length; j++) {
        const b = drops[j];
        if (b.followsCursor) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dSq = dx * dx + dy * dy;
        const rng = TENSION_RANGE + a.r + b.r;
        if (dSq < rng * rng && dSq > 1e-5) {
          const dist = Math.sqrt(dSq);
          const s = 1 - dist / rng;
          const f = s * TENSION_F;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }
    }
    void time;
  }

  function integrate() {
    for (const d of drops) {
      const maxSpeed = d.followsCursor ? CURSOR_MAX_SPEED : MAX_SPEED;
      const sp = Math.hypot(d.vx, d.vy);
      if (sp > maxSpeed) {
        const s = maxSpeed / sp;
        d.vx *= s;
        d.vy *= s;
      }
      d.x += d.vx;
      d.y += d.vy;
      if (!d.followsCursor) {
        d.vx *= DAMP;
        d.vy *= DAMP;
      }

      const wx = aspect * 0.5;
      const wy = 0.5;
      if (d.x - d.r < -wx) {
        d.x = -wx + d.r;
        d.vx = Math.abs(d.vx) * BOUNCE;
      }
      if (d.x + d.r > wx) {
        d.x = wx - d.r;
        d.vx = -Math.abs(d.vx) * BOUNCE;
      }
      if (d.y - d.r < -wy) {
        d.y = -wy + d.r;
        d.vy = Math.abs(d.vy) * BOUNCE;
      }
      if (d.y + d.r > wy) {
        d.y = wy - d.r;
        d.vy = -Math.abs(d.vy) * BOUNCE;
      }
    }
  }

  function mergeDroplets() {
    for (let i = 0; i < drops.length; i++) {
      const a = drops[i];
      if (!a.alive || a.followsCursor) continue;
      for (let j = i + 1; j < drops.length; j++) {
        const b = drops[j];
        if (!b.alive || b.followsCursor) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist < (a.r + b.r) * MERGE_RATIO) {
          const na = a.area + b.area;
          a.x = (a.x * a.area + b.x * b.area) / na;
          a.y = (a.y * a.area + b.y * b.area) / na;
          a.vx = (a.vx * a.area + b.vx * b.area) / na;
          a.vy = (a.vy * a.area + b.vy * b.area) / na;
          a.r = Math.sqrt(na / Math.PI);
          a.area = na;
          b.alive = false;
        }
      }
    }
    drops = drops.filter((d) => d.alive);
  }

  function splitDroplets() {
    const add: Droplet[] = [];
    for (const d of drops) {
      if (d.followsCursor) continue;
      if (d.r < SPLIT_MIN_R) continue;
      const sp = Math.hypot(d.vx, d.vy);
      if (sp < SPLIT_SPEED) continue;

      const ha = d.area * 0.5;
      const nr = Math.sqrt(ha / Math.PI);
      const nx = -d.vy / sp;
      const ny = d.vx / sp;
      const off = nr * 0.7;

      d.r = nr;
      d.area = ha;
      d.x -= nx * off;
      d.y -= ny * off;

      add.push({
        id: uid++,
        x: d.x + nx * off * 2,
        y: d.y + ny * off * 2,
        r: nr,
        area: ha,
        vx: d.vx + nx * sp * 0.35,
        vy: d.vy + ny * sp * 0.35,
        alive: true,
        wanderAngle: Math.random() * Math.PI * 2,
        wanderSpeed: 0.3 + Math.random() * 0.5,
        softPrevX: d.x + nx * off * 2,
        softPrevY: d.y + ny * off * 2,
        softOffX: 0,
        softOffY: 0,
        softVelX: 0,
        softVelY: 0,
      });
    }
    for (const d of add) {
      if (regularDrops().length < MAX_DROPLETS) drops.push(d);
    }
  }

  function updateSoftBodies() {
    for (const d of drops) {
      const dx = d.x - d.softPrevX;
      const dy = d.y - d.softPrevY;
      d.softVelX += (dx - d.softOffX) * SOFT_STIFFNESS;
      d.softVelY += (dy - d.softOffY) * SOFT_STIFFNESS;
      d.softVelX *= SOFT_DAMPING;
      d.softVelY *= SOFT_DAMPING;
      d.softOffX += d.softVelX;
      d.softOffY += d.softVelY;
      d.softPrevX = d.x;
      d.softPrevY = d.y;
    }
  }

  function autoSpawn() {
    autoTimer += FIXED_DT_MS;
    if (autoTimer > 2000 && regularDrops().length < 10) {
      autoTimer = 0;
      spawn(
        (Math.random() - 0.5) * aspect * 0.6,
        (Math.random() - 0.5) * 0.6,
        0.025 + Math.random() * 0.03,
      );
    }
  }

  function mouseSpawn() {
    if (!mouse.down || !mouse.active) return;
    spawnCD -= FIXED_DT_MS;
    if (spawnCD <= 0 && regularDrops().length < MAX_DROPLETS) {
      spawnCD = 120;
      spawn(
        mouse.x + (Math.random() - 0.5) * 0.02,
        mouse.y + (Math.random() - 0.5) * 0.02,
        0.02 + Math.random() * 0.015,
      );
    }
  }

  function fixedUpdate() {
    simTime += FIXED_DT_MS;
    applyForces(simTime);
    integrate();
    mergeDroplets();
    splitDroplets();
    updateSoftBodies();
    autoSpawn();
    mouseSpawn();
  }

  function writeDroplet(index: number, d: Droplet, radiusScale = 1) {
    const i = index * 4;
    dropletBuf[i] = d.x;
    dropletBuf[i + 1] = d.y;
    dropletBuf[i + 2] = d.r * radiusScale;
    dropletBuf[i + 3] = 1;
  }

  function syncDroplets() {
    if (!dropletTex || !mat) return;
    dropletBuf.fill(0);

    const cursor = drops.find((d) => d.followsCursor && d.alive);
    const regular = regularDrops();
    const maxRegular = cursor ? MAX_DROPLETS - 1 : MAX_DROPLETS;
    const n = Math.min(regular.length, maxRegular);
    const mainCount = n + (cursor ? 1 : 0);

    let mainIndex = 0;
    if (cursor) {
      writeDroplet(mainIndex, cursor);
      mainIndex++;
    }
    for (let i = 0; i < n; i++) {
      writeDroplet(mainIndex, regular[i]);
      mainIndex++;
    }

    let ghostIndex = mainCount;
    if (cursor) {
      dropletBuf[ghostIndex * 4] = cursor.x - cursor.softOffX * 4.5;
      dropletBuf[ghostIndex * 4 + 1] = cursor.y - cursor.softOffY * 4.5;
      dropletBuf[ghostIndex * 4 + 2] = cursor.r * 0.75;
      dropletBuf[ghostIndex * 4 + 3] = 1;
      ghostIndex++;
    }
    for (let i = 0; i < n; i++) {
      const d = regular[i];
      dropletBuf[ghostIndex * 4] = d.x - d.softOffX * 3.5;
      dropletBuf[ghostIndex * 4 + 1] = d.y - d.softOffY * 3.5;
      dropletBuf[ghostIndex * 4 + 2] = d.r * 0.7;
      dropletBuf[ghostIndex * 4 + 3] = 1;
      ghostIndex++;
    }

    dropletTex.needsUpdate = true;
    mat.uniforms.uCount.value = mainCount * 2;
  }

  function loop() {
    if (disposed) return;
    rafId = requestAnimationFrame(loop);

    if (paused || !renderer || !mat) return;

    const now = performance.now();
    const dt = Math.min(now - last, MAX_FRAME_DT_MS);
    last = now;
    acc += dt;

    let steps = 0;
    while (acc >= FIXED_DT_MS && steps < MAX_CATCHUP) {
      fixedUpdate();
      acc -= FIXED_DT_MS;
      steps++;
    }
    if (steps >= MAX_CATCHUP) acc = 0;

    mat.uniforms.uTime.value = now * 0.001;
    composeBackground(now * 0.001);
    syncDroplets();
    renderer.render(scene!, camera!);
  }

  function onPointerMove(event: PointerEvent) {
    if (!renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * aspect;
    mouse.y = 0.5 - (event.clientY - rect.top) / rect.height;
    mouse.active = true;
  }

  function onPointerDown() {
    mouse.down = true;
  }

  function onPointerUp() {
    mouse.down = false;
  }

  function onPointerLeave() {
    mouse.active = false;
    mouse.down = false;
  }

  function updatePausedState() {
    paused = document.hidden || !inView;
    if (!paused) {
      last = performance.now();
      acc = 0;
    }
  }

  function onVisibilityChange() {
    updatePausedState();
  }

  function resize(width: number, height: number) {
    if (!renderer || !mat) return;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    aspect = width / height;
    mat.uniforms.uRes.value.set(renderer.domElement.width, renderer.domElement.height);
    drawBackground();
  }

  function scheduleResize(width: number, height: number) {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize(width, height);
      resizeTimer = undefined;
    }, RESIZE_DEBOUNCE_MS);
  }

  function init(container: HTMLElement) {
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    bgCanvas = document.createElement('canvas');
    bgCtx = bgCanvas.getContext('2d');
    bgTexture = new THREE.CanvasTexture(bgCanvas);
    bgTexture.minFilter = THREE.LinearFilter;
    bgTexture.magFilter = THREE.LinearFilter;
    bgTexture.colorSpace = THREE.SRGBColorSpace;

    dropletTex = new THREE.DataTexture(
      dropletBuf,
      MAX_ENTRIES,
      1,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    dropletTex.minFilter = THREE.NearestFilter;
    dropletTex.magFilter = THREE.NearestFilter;
    dropletTex.needsUpdate = true;

    mat = new THREE.ShaderMaterial({
      vertexShader: 'void main(){ gl_Position = vec4(position, 1.0); }',
      fragmentShader: buildFragmentShader(MAX_ENTRIES),
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uData: { value: dropletTex },
        uBg: { value: bgTexture },
        uCount: { value: 0 },
        uTime: { value: 0 },
      },
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

    spawnCursorBubble();

    for (let i = 0; i < 12; i++) {
      spawn(
        (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 0.5,
        0.03 + Math.random() * 0.05,
      );
    }

    const { width, height } = readContainerSize(container);
    resize(width, height);

    drawBackground();
    void Promise.all([
      document.fonts.load(`900 ${Math.round(renderer.domElement.width * 0.13)}px ${TITLE_FONT}`),
      document.fonts.load(`500 ${Math.round(SUBTITLE_SIZE * renderer.getPixelRatio())}px ${SUBTITLE_FONT}`),
      document.fonts.ready,
    ]).then(() => {
      if (!disposed) drawBackground();
    });

    const canvas = renderer.domElement;
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        updatePausedState();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(container);

    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      scheduleResize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(container);

    paused = document.hidden;
    last = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    if (resizeTimer) clearTimeout(resizeTimer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();

    const canvas = renderer?.domElement;
    canvas?.removeEventListener('pointermove', onPointerMove);
    canvas?.removeEventListener('pointerdown', onPointerDown);
    canvas?.removeEventListener('pointerup', onPointerUp);
    canvas?.removeEventListener('pointerleave', onPointerLeave);

    mat?.dispose();
    dropletTex?.dispose();
    bgTexture?.dispose();
    renderer?.dispose();
    canvas?.remove();
  }

  onMounted(() => {
    void nextTick(() => {
      if (containerRef.value) init(containerRef.value);
    });
  });

  onBeforeUnmount(dispose);
}
