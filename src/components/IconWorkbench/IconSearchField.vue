<script setup lang="ts">
import styles from './IconSearchField.module.css';

const searchQuery = defineModel<string>('searchQuery', { required: true });
</script>

<template>
  <div :class="styles.searchRow">
    <label :class="styles.searchField">
      <svg
        :class="styles.searchIcon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="11"
          cy="11"
          r="6.5"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <path
          d="M16 16L20 20"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      <input
        v-model="searchQuery"
        type="search"
        :class="styles.searchInput"
        placeholder="搜索"
        aria-label="搜索图标"
      />
    </label>
  </div>
</template>
