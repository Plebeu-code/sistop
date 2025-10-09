<template>
  <div class="projects-management">
    <div class="section-header">
      <div class="header-info">
        <h2 class="section-title">
          <i class="pi pi-folder" />
          Projetos
        </h2>
        <p class="section-description">
          Em desenvolvimento - Gerenciamento de projetos
        </p>
      </div>
    </div>

    <Card>
      <template #content>
        <div class="empty-state">
          <i class="pi pi-folder" />
          <h3>Gerenciamento de Projetos</h3>
          <p>Esta funcionalidade está sendo desenvolvida.</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
// Componente em desenvolvimento
</script>

<style scoped>
.projects-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-info {
  flex: 1;
}

.section-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-description {
  margin: 0;
  color: var(--text-color-secondary);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  color: var(--text-color-secondary);
}
</style>

