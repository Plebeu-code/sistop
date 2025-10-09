<template>
  <div class="users-management">
    <!-- Header -->
    <div class="section-header">
      <div class="header-info">
        <h2 class="section-title">
          <i class="pi pi-users" />
          Gerenciamento de Usuários
        </h2>
        <p class="section-description">
          Controle de usuários, roles e permissões do sistema
        </p>
      </div>
      
      <div class="header-actions">
        <Button
          label="Novo Usuário"
          icon="pi pi-plus"
          :disabled="isLoading"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="stats-row">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-users stat-icon total" />
            <div class="stat-info">
              <div class="stat-value">
                {{ users.length }}
              </div>
              <div class="stat-label">
                Total
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-check-circle stat-icon active" />
            <div class="stat-info">
              <div class="stat-value">
                {{ activeUsers.length }}
              </div>
              <div class="stat-label">
                Ativos
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-shield stat-icon admin" />
            <div class="stat-info">
              <div class="stat-value">
                {{ adminUsers.length }}
              </div>
              <div class="stat-label">
                Admins
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <i class="pi pi-ban stat-icon inactive" />
            <div class="stat-info">
              <div class="stat-value">
                {{ inactiveUsers.length }}
              </div>
              <div class="stat-label">
                Inativos
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Filtros -->
    <Card class="filters-card">
      <template #content>
        <div class="filters-row">
          <div class="filter-group">
            <label>Buscar</label>
            <InputText
              v-model="searchTerm"
              placeholder="Nome ou email..."
              icon="pi pi-search"
            />
          </div>
          
          <div class="filter-group">
            <label>Role</label>
            <Dropdown
              v-model="filterRole"
              :options="roleOptions"
              option-label="label"
              option-value="value"
              placeholder="Todas as roles"
              show-clear
            />
          </div>
          
          <div class="filter-group">
            <label>Status</label>
            <Dropdown
              v-model="filterStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos os status"
              show-clear
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Tabela de Usuários -->
    <Card class="users-table-card">
      <template #content>
        <DataTable
          :value="filteredUsers"
          :loading="isLoading"
          paginator
          :rows="10"
          :rows-per-page-options="[5, 10, 25, 50]"
          responsive-layout="scroll"
          current-page-report-template="Exibindo {first} - {last} de {totalRecords} usuários"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          class="users-table"
        >
          <template #empty>
            <div class="empty-state">
              <i class="pi pi-users" />
              <h3>Nenhum usuário encontrado</h3>
              <p>Não há usuários que correspondam aos filtros aplicados.</p>
            </div>
          </template>

          <Column
            field="name"
            header="Usuário"
            sortable
            class="user-column"
          >
            <template #body="slotProps">
              <div class="user-info">
                <div class="user-avatar">
                  <i
                    v-if="!slotProps.data.avatar"
                    class="pi pi-user"
                  />
                  <img
                    v-else
                    :src="slotProps.data.avatar"
                    :alt="slotProps.data.name"
                  >
                </div>
                <div class="user-details">
                  <div class="user-name">
                    {{ slotProps.data.name }}
                  </div>
                  <div class="user-email">
                    {{ slotProps.data.email }}
                  </div>
                </div>
              </div>
            </template>
          </Column>

          <Column
            field="roles"
            header="Roles"
            sortable
          >
            <template #body="slotProps">
              <div class="roles-list">
                <Tag
                  v-for="role in slotProps.data.roles"
                  :key="role"
                  :value="getRoleLabel(role)"
                  :severity="getRoleSeverity(role)"
                  class="role-tag"
                />
              </div>
            </template>
          </Column>

          <Column
            field="ultimoAcesso"
            header="Último Acesso"
            sortable
          >
            <template #body="slotProps">
              <div
                v-if="slotProps.data.ultimoAcesso"
                class="access-info"
              >
                {{ formatDate(slotProps.data.ultimoAcesso) }}
              </div>
              <span
                v-else
                class="no-access"
              >Nunca acessou</span>
            </template>
          </Column>

          <Column
            field="contaAtiva"
            header="Status"
            sortable
          >
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.contaAtiva ? 'Ativo' : 'Inativo'"
                :severity="slotProps.data.contaAtiva ? 'success' : 'danger'"
              />
            </template>
          </Column>

          <Column
            header="Ações"
            class="actions-column"
          >
            <template #body="slotProps">
              <div class="action-buttons">
                <Button
                  v-tooltip.top="'Editar'"
                  icon="pi pi-pencil"
                  severity="info"
                  text
                  rounded
                  @click="editUser(slotProps.data)"
                />
                <Button
                  :icon="slotProps.data.contaAtiva ? 'pi pi-ban' : 'pi pi-check'"
                  :severity="slotProps.data.contaAtiva ? 'warning' : 'success'"
                  text
                  rounded
                  :v-tooltip.top="slotProps.data.contaAtiva ? 'Desativar' : 'Ativar'"
                  @click="toggleUserStatus(slotProps.data.id)"
                />
                <Button
                  v-tooltip.top="'Excluir'"
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  @click="confirmDeleteUser(slotProps.data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog de Criação/Edição -->
    <Dialog
      v-model:visible="showCreateDialog"
      :header="editingUser ? 'Editar Usuário' : 'Novo Usuário'"
      :modal="true"
      :closable="true"
      :draggable="false"
      class="user-dialog"
    >
      <div class="user-form">
        <div class="form-row">
          <div class="form-group">
            <label for="userName">Nome *</label>
            <InputText
              id="userName"
              v-model="userForm.name"
              :class="{ 'p-invalid': formErrors.name }"
              placeholder="Nome completo"
            />
            <small
              v-if="formErrors.name"
              class="p-error"
            >{{ formErrors.name }}</small>
          </div>

          <div class="form-group">
            <label for="userEmail">Email *</label>
            <InputText
              id="userEmail"
              v-model="userForm.email"
              :class="{ 'p-invalid': formErrors.email }"
              placeholder="email@exemplo.com"
            />
            <small
              v-if="formErrors.email"
              class="p-error"
            >{{ formErrors.email }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="userRoles">Roles *</label>
            <MultiSelect
              id="userRoles"
              v-model="userForm.roles"
              :options="availableRoles"
              option-label="label"
              option-value="value"
              placeholder="Selecionar roles"
              :class="{ 'p-invalid': formErrors.roles }"
            />
            <small
              v-if="formErrors.roles"
              class="p-error"
            >{{ formErrors.roles }}</small>
          </div>

          <div class="form-group">
            <label for="userPermissions">Permissões</label>
            <MultiSelect
              id="userPermissions"
              v-model="userForm.permissions"
              :options="availablePermissions"
              option-label="label"
              option-value="value"
              placeholder="Selecionar permissões"
            />
          </div>
        </div>

        <div class="form-group">
          <div class="checkbox-group">
            <Checkbox
              id="userActive"
              v-model="userForm.contaAtiva"
              binary
            />
            <label for="userActive">Conta ativa</label>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            @click="closeDialog"
          />
          <Button
            :label="editingUser ? 'Atualizar' : 'Criar'"
            :loading="isLoading"
            @click="saveUser"
          />
        </div>
      </template>
    </Dialog>

    <!-- Dialog de Confirmação de Exclusão -->
    <Dialog
      v-model:visible="showDeleteDialog"
      header="Confirmar Exclusão"
      :modal="true"
      class="confirmation-dialog"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle confirmation-icon" />
        <div class="confirmation-text">
          <p>Tem certeza que deseja excluir o usuário <strong>{{ userToDelete?.name }}</strong>?</p>
          <p class="warning-text">
            Esta ação não pode ser desfeita.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            @click="showDeleteDialog = false"
          />
          <Button
            label="Excluir"
            severity="danger"
            :loading="isLoading"
            @click="deleteUser"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/app/stores/admin'
import type { AdminUser, UserRole } from '@/shared/types'

// Store
const adminStore = useAdminStore()

// Estado local
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<AdminUser | null>(null)
const userToDelete = ref<AdminUser | null>(null)
const searchTerm = ref('')
const filterRole = ref<UserRole | null>(null)
const filterStatus = ref<boolean | null>(null)

// Form
const userForm = ref({
  name: '',
  email: '',
  roles: [] as UserRole[],
  permissions: [] as string[],
  contaAtiva: true
})

const formErrors = ref({
  name: '',
  email: '',
  roles: ''
})

// Computeds da store
const { users, activeUsers, inactiveUsers, adminUsers, isLoading } = adminStore

// Opções para filtros
const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' }
]

const statusOptions = [
  { label: 'Ativo', value: true },
  { label: 'Inativo', value: false }
]

const availableRoles = roleOptions
const availablePermissions = [
  { label: 'Ver Admin', value: 'view_admin' },
  { label: 'Gerenciar Usuários', value: 'manage_users' },
  { label: 'Gerenciar Projetos', value: 'manage_projects' },
  { label: 'Ver Jobs', value: 'view_jobs' },
  { label: 'Ver Relatórios', value: 'view_reports' },
  { label: 'Gerenciar Conteúdo', value: 'manage_content' },
  { label: 'Ver Conteúdo', value: 'view_content' },
  { label: 'Editar Conteúdo', value: 'edit_content' }
]

// Usuários filtrados
const filteredUsers = computed(() => {
  let filtered = users.value

  // Busca por nome/email
  if (searchTerm.value) {
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  // Filtro por role
  if (filterRole.value) {
    filtered = filtered.filter(user =>
      user.roles.includes(filterRole.value!)
    )
  }

  // Filtro por status
  if (filterStatus.value !== null) {
    filtered = filtered.filter(user =>
      user.contaAtiva === filterStatus.value
    )
  }

  return filtered
})

// Métodos
function editUser(user: AdminUser) {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    roles: [...user.roles],
    permissions: [...user.permissions],
    contaAtiva: user.contaAtiva
  }
  showCreateDialog.value = true
}

function confirmDeleteUser(user: AdminUser) {
  userToDelete.value = user
  showDeleteDialog.value = true
}

async function deleteUser() {
  if (userToDelete.value) {
    await adminStore.deleteUser(userToDelete.value.id)
    showDeleteDialog.value = false
    userToDelete.value = null
  }
}

function toggleUserStatus(userId: string) {
  adminStore.toggleUserStatus(userId)
}

async function saveUser() {
  // Validação
  formErrors.value = { name: '', email: '', roles: '' }
  let hasErrors = false

  if (!userForm.value.name.trim()) {
    formErrors.value.name = 'Nome é obrigatório'
    hasErrors = true
  }

  if (!userForm.value.email.trim()) {
    formErrors.value.email = 'Email é obrigatório'
    hasErrors = true
  } else if (!/\S+@\S+\.\S+/.test(userForm.value.email)) {
    formErrors.value.email = 'Email inválido'
    hasErrors = true
  }

  if (userForm.value.roles.length === 0) {
    formErrors.value.roles = 'Pelo menos uma role é obrigatória'
    hasErrors = true
  }

  if (hasErrors) return

  // Salvar
  if (editingUser.value) {
    await adminStore.updateUser(editingUser.value.id, userForm.value)
  } else {
    await adminStore.createUser(userForm.value)
  }

  closeDialog()
}

function closeDialog() {
  showCreateDialog.value = false
  editingUser.value = null
  userForm.value = {
    name: '',
    email: '',
    roles: [],
    permissions: [],
    contaAtiva: true
  }
  formErrors.value = { name: '', email: '', roles: '' }
}

function getRoleLabel(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    admin: 'Admin',
    manager: 'Manager',
    editor: 'Editor',
    viewer: 'Viewer'
  }
  return roleMap[role] || role
}

function getRoleSeverity(role: UserRole): string {
  const severityMap: Record<UserRole, string> = {
    admin: 'danger',
    manager: 'warning',
    editor: 'info',
    viewer: 'secondary'
  }
  return severityMap[role] || 'secondary'
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  adminStore.fetchUsers()
})
</script>

<style scoped>
.users-management {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  border: 1px solid var(--surface-border);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
}

.stat-icon.total { background: var(--blue-500); }
.stat-icon.active { background: var(--green-500); }
.stat-icon.admin { background: var(--red-500); }
.stat-icon.inactive { background: var(--gray-500); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}

.filters-card {
  border: 1px solid var(--surface-border);
}

.filters-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.users-table-card {
  border: 1px solid var(--surface-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--surface-100);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar i {
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.role-tag {
  font-size: 0.75rem;
}

.access-info {
  font-size: 0.875rem;
  color: var(--text-color);
}

.no-access {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
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

.user-dialog {
  width: 90vw;
  max-width: 600px;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dialog-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.confirmation-dialog {
  width: 90vw;
  max-width: 400px;
}

.confirmation-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
}

.confirmation-icon {
  font-size: 2rem;
  color: var(--orange-500);
  flex-shrink: 0;
}

.confirmation-text {
  flex: 1;
}

.confirmation-text p {
  margin: 0 0 0.5rem 0;
}

.warning-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

