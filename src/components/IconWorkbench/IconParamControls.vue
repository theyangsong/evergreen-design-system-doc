<script setup lang="ts">
import { computed } from 'vue';
import type { IconDisplayParams } from '@/icons/types';
import styles from './IconParamControls.module.css';

const params = defineModel<IconDisplayParams>('params', { required: true });

const SIZE_MIN = 12;
const SIZE_MAX = 128;
const STROKE_MIN = 0.5;
const STROKE_MAX = 4;
const STROKE_STEP = 0.25;

const strokeDisplay = computed(() =>
  Number(params.value.strokeWidth.toFixed(2)).toString(),
);

const colorPickerValue = computed(() => resolvePickerColor(params.value.color));

const colorSwatchStyle = computed(() => ({
  background:
    params.value.color === 'currentColor'
      ? 'var(--text-base-primary)'
      : params.value.color,
}));

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function adjustSize(delta: number) {
  params.value = {
    ...params.value,
    size: clamp(params.value.size + delta, SIZE_MIN, SIZE_MAX),
  };
}

function adjustStroke(delta: number) {
  const next = Number(
    (params.value.strokeWidth + delta).toFixed(2),
  );

  params.value = {
    ...params.value,
    strokeWidth: clamp(next, STROKE_MIN, STROKE_MAX),
  };
}

function resolvePickerColor(color: string) {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    return color;
  }

  return '#000000';
}

function onColorPickerInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;

  params.value = {
    ...params.value,
    color: value,
  };
}
</script>

<template>
  <div :class="styles.params">
    <div :class="styles.paramControl">
      <span :class="styles.paramLabel">尺寸</span>
      <div :class="styles.stepper">
        <button
          type="button"
          :class="styles.stepperButton"
          aria-label="减小尺寸"
          :disabled="params.size <= SIZE_MIN"
          @click="adjustSize(-1)"
        >
          −
        </button>
        <span :class="styles.stepperValue">{{ params.size }}</span>
        <button
          type="button"
          :class="styles.stepperButton"
          aria-label="增大尺寸"
          :disabled="params.size >= SIZE_MAX"
          @click="adjustSize(1)"
        >
          +
        </button>
      </div>
    </div>

    <div :class="styles.paramControl">
      <span :class="styles.paramLabel">描边</span>
      <div :class="styles.stepper">
        <button
          type="button"
          :class="styles.stepperButton"
          aria-label="减小描边"
          :disabled="params.strokeWidth <= STROKE_MIN"
          @click="adjustStroke(-STROKE_STEP)"
        >
          −
        </button>
        <span :class="styles.stepperValue">{{ strokeDisplay }}</span>
        <button
          type="button"
          :class="styles.stepperButton"
          aria-label="增大描边"
          :disabled="params.strokeWidth >= STROKE_MAX"
          @click="adjustStroke(STROKE_STEP)"
        >
          +
        </button>
      </div>
    </div>

    <div :class="styles.paramControl">
      <span :class="styles.paramLabel">颜色</span>
      <div :class="styles.colorField">
        <label :class="styles.colorPickerTrigger">
          <svg
            :class="styles.colorPickerIcon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 18.5C5 19.88 6.12 21 7.5 21H16.5C18.43 21 20 19.43 20 17.5C20 15.84 18.98 14.4 17.45 13.93L14.5 13V8.5C14.5 6.57 12.93 5 11 5C9.07 5 7.5 6.57 7.5 8.5V13.4L5.52 14.4C5.2 14.56 5 14.89 5 15.25V18.5Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <path
              d="M9 3H13"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span
            :class="styles.colorSwatch"
            :style="colorSwatchStyle"
            aria-hidden="true"
          />
          <input
            type="color"
            :class="styles.colorPickerInput"
            :value="colorPickerValue"
            aria-label="选择颜色"
            @input="onColorPickerInput"
          />
        </label>
        <input
          v-model="params.color"
          type="text"
          :class="styles.colorHexInput"
          aria-label="颜色值"
        />
      </div>
    </div>
  </div>
</template>
