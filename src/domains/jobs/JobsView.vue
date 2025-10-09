<template>
  <div class="jobs-view">
    <JobsDashboard />
  </div>
</template>

<script setup lang="ts">
import JobsDashboard from './components/JobsDashboard.vue'
</script>

<style scoped>
.jobs-view {
  min-height: 100vh;
  background: var(--surface-ground);
}
</style>

