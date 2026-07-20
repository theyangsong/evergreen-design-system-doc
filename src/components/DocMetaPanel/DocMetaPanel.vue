<script setup lang="ts">
import type { DocMetaField } from '@/config/navigation';
import { PersonAvatar, parsePersonList } from '@/personAvatar';
import styles from './DocMetaPanel.module.css';

const PERSON_META_LABELS = new Set(['维护', '贡献']);

function isPersonMetaField(label: string): boolean {
  return PERSON_META_LABELS.has(label);
}

function isIdMetaField(label: string): boolean {
  return label === 'ID';
}

defineProps<{
  fields: DocMetaField[];
}>();
</script>

<template>
  <section :class="styles.panel" aria-label="Document metadata">
    <template v-for="field in fields" :key="field.label">
      <div :class="styles.label">
        {{ field.label }}
      </div>

      <div :class="styles.value">
        <template v-if="isPersonMetaField(field.label)">
          <template v-if="parsePersonList(field.value).length === 0">
            {{ field.value }}
          </template>
          <span v-else :class="styles.personList">
            <span
              v-for="(name, index) in parsePersonList(field.value)"
              :key="name"
              :class="styles.person"
            >
              <PersonAvatar :name="name" :palette-offset="index" />
              <span>{{ name }}</span>
            </span>
          </span>
        </template>
        <template v-else-if="isIdMetaField(field.label)">
          <code :class="styles.idCode">{{ field.value }}</code>
        </template>
        <template v-else>
          {{ field.value }}
        </template>
      </div>
    </template>
  </section>
</template>
