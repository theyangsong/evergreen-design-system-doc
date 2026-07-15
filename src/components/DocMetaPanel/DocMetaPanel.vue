<script setup lang="ts">
import type { DocMetaField } from '@/config/navigation';
import { PersonAvatar, parsePersonList } from '@/personAvatar';
import styles from './DocMetaPanel.module.css';

const PERSON_META_LABELS = new Set(['维护', '贡献']);

function isPersonMetaField(label: string): boolean {
  return PERSON_META_LABELS.has(label);
}

defineProps<{
  fields: DocMetaField[];
}>();
</script>

<template>
  <section :class="styles.panel" aria-label="Document metadata">
    <div :class="styles.labels">
      <div v-for="field in fields" :key="field.label" :class="styles.label">
        {{ field.label }}
      </div>
    </div>

    <div :class="styles.values">
      <div
        v-for="field in fields"
        :key="`${field.label}-value`"
        :class="[styles.value, isPersonMetaField(field.label) && styles.valuePeople]"
      >
        <template v-if="isPersonMetaField(field.label)">
          <template v-if="parsePersonList(field.value).length === 0">
            {{ field.value }}
          </template>
          <span v-else :class="styles.personList">
            <span v-for="name in parsePersonList(field.value)" :key="name" :class="styles.person">
              <PersonAvatar :name="name" />
              <span>{{ name }}</span>
            </span>
          </span>
        </template>
        <template v-else>
          {{ field.value }}
        </template>
      </div>
    </div>
  </section>
</template>
