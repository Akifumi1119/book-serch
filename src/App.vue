<script setup lang="ts"></script>

<template>
  <RouterView v-slot="{ Component }">
    <keep-alive include="BookSearchView">
      <component :is="Component" />
    </keep-alive>
  </RouterView>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  background-color: #f7fafc;
  color: #1a202c;
}
</style>
