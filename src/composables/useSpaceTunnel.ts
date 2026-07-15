import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  type Ref,
} from 'vue';
import fragmentShader from '@/shaders/space-tunnel.frag.glsl?raw';

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec4 position;
void main() {
  gl_Position = position;
}`;

const VERTICES = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);

const RESOLUTION_SCALE = 0.5;
const MAX_RENDER_DIMENSION = 1920;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function resolvePixelRatio(cssWidth: number, cssHeight: number): number {
  const dpr = window.devicePixelRatio || 1;
  let ratio = Math.max(1, RESOLUTION_SCALE * dpr);
  const maxSide = Math.max(cssWidth * ratio, cssHeight * ratio);
  if (maxSide > MAX_RENDER_DIMENSION) {
    ratio *= MAX_RENDER_DIMENSION / maxSide;
  }
  return Math.max(1, ratio);
}

function readContainerSize(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  return {
    width: Math.max(1, rect.width, container.clientWidth, window.innerWidth),
    height: Math.max(1, rect.height, container.clientHeight, window.innerHeight),
  };
}

class TunnelRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private resolutionLoc: WebGLUniformLocation | null = null;
  private timeLoc: WebGLUniformLocation | null = null;
  private wheelLoc: WebGLUniformLocation | null = null;
  private wheel: [number, number] = [0, 0];
  private wheelDelta = 0;
  private wheelOffset = 0;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      throw new Error('WebGL2 is not supported');
    }
    this.gl = gl;
    this.initProgram();
  }

  private compileShader(type: number, source: string) {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error('Failed to create shader');
    }
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log = this.gl.getShaderInfoLog(shader) ?? 'Shader compile failed';
      this.gl.deleteShader(shader);
      throw new Error(log);
    }
    return shader;
  }

  private initProgram() {
    const vs = this.compileShader(this.gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShader);
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error('Failed to create program');
    }

    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);
    this.gl.deleteShader(vs);
    this.gl.deleteShader(fs);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const log = this.gl.getProgramInfoLog(program) ?? 'Program link failed';
      this.gl.deleteProgram(program);
      throw new Error(log);
    }

    this.program = program;
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, VERTICES, this.gl.STATIC_DRAW);

    const position = this.gl.getAttribLocation(program, 'position');
    this.gl.enableVertexAttribArray(position);
    this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0);

    this.resolutionLoc = this.gl.getUniformLocation(program, 'resolution');
    this.timeLoc = this.gl.getUniformLocation(program, 'time');
    this.wheelLoc = this.gl.getUniformLocation(program, 'wheel');
  }

  resize(cssWidth: number, cssHeight: number) {
    const width = Math.max(1, cssWidth);
    const height = Math.max(1, cssHeight);
    const ratio = resolvePixelRatio(width, height);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  updateWheel(deltaY: number) {
    if (this.wheelDelta * deltaY < 0) {
      this.wheelDelta = deltaY;
    } else {
      this.wheelDelta = lerp(this.wheelDelta, deltaY, 0.05);
    }
    this.wheelOffset += this.wheelDelta;
    this.wheel = [this.wheelDelta, this.wheelOffset];
  }

  render(timeMs: number) {
    if (!this.program || !this.buffer) {
      return;
    }

    const gl = this.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    gl.uniform2f(this.resolutionLoc, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.timeLoc, timeMs * 1e-3);
    gl.uniform2f(this.wheelLoc, this.wheel[0], this.wheel[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    if (this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    if (this.buffer) {
      this.gl.deleteBuffer(this.buffer);
      this.buffer = null;
    }
  }
}

export function useSpaceTunnel(containerRef: Ref<HTMLElement | null>) {
  let disposed = false;
  let rafId = 0;
  let resizeObserver: ResizeObserver | undefined;
  let renderer: TunnelRenderer | undefined;
  let canvas: HTMLCanvasElement | undefined;
  let container: HTMLElement | undefined;
  let paused = false;
  let startTime = 0;
  let elapsedTime = 0;

  function loop(now: number) {
    if (disposed) {
      return;
    }
    rafId = requestAnimationFrame(loop);
    if (paused || !renderer) {
      return;
    }
    elapsedTime = now - startTime;
    renderer.render(elapsedTime);
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault();
    renderer?.updateWheel(event.deltaY);
  }

  function onVisibilityChange() {
    const wasPaused = paused;
    paused = document.hidden;
    if (wasPaused && !paused) {
      startTime = performance.now() - elapsedTime;
    }
  }

  function resizeFromContainer() {
    if (!container || !renderer) {
      return;
    }
    const { width, height } = readContainerSize(container);
    renderer.resize(width, height);
  }

  function init(host: HTMLElement) {
    disposeResources();
    disposed = false;
    container = host;

    canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    host.appendChild(canvas);

    try {
      renderer = new TunnelRenderer(canvas);
    } catch (error) {
      console.error('[useSpaceTunnel] WebGL init failed:', error);
      canvas.remove();
      canvas = undefined;
      container = undefined;
      return;
    }

    resizeFromContainer();

    canvas.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', resizeFromContainer);

    resizeObserver = new ResizeObserver(() => {
      resizeFromContainer();
    });
    resizeObserver.observe(host);

    paused = document.hidden;
    startTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function disposeResources() {
    cancelAnimationFrame(rafId);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('resize', resizeFromContainer);
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    canvas?.removeEventListener('wheel', onWheel);
    renderer?.dispose();
    canvas?.remove();
    renderer = undefined;
    canvas = undefined;
    container = undefined;
  }

  function dispose() {
    disposed = true;
    disposeResources();
  }

  onMounted(() => {
    void nextTick(() => {
      if (containerRef.value) {
        init(containerRef.value);
      }
    });
  });

  onBeforeUnmount(dispose);

  return {
    updateWheel(deltaY: number) {
      renderer?.updateWheel(deltaY);
    },
  };
}
