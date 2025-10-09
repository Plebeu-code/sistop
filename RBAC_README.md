# SisTop - RBAC Implementation

## TAREFA 02 - RBAC & Sessão (Frontend)

Este projeto implementa um sistema completo de RBAC (Role-Based Access Control) com Vue 3, TypeScript e Pinia.

## Funcionalidades Implementadas

### 1. Sistema de Login com Roles Simuladas

- **Página de Login**: `/login`
- **4 tipos de usuário para teste**:
  - **Admin**: Acesso total ao sistema
  - **Produtor**: Vê Pautas e Admin
  - **Roteirista**: Vê Storyboard
  - **Pesquisador**: Vê Upload/Curadoria

### 2. Composable useRBAC()

Localizado em `src/shared/composables/useRBAC.ts`

**Métodos disponíveis**:
- `can(permission)` - Verifica se o usuário tem uma permissão específica
- `canAny(permissions[])` - Verifica se o usuário tem pelo menos uma das permissões
- `canAll(permissions[])` - Verifica se o usuário tem todas as permissões
- `hasRole(role)` - Verifica se o usuário tem um role específico
- `hasAnyRole(roles[])` - Verifica se o usuário tem pelo menos um dos roles
- `isAdmin`, `isProdutor`, `isRoteirista`, `isPesquisador` - Shortcuts para roles

### 3. Diretiva v-can

Localizada em `src/shared/directives/vCan.ts`

**Formas de uso**:

```vue
<!-- Por permissão -->
<div v-can="'view_admin'">Conteúdo admin</div>

<!-- Por role -->
<div v-can="{ role: 'admin' }">Conteúdo admin</div>

<!-- Múltiplas permissões (OR) -->
<div v-can="{ permissions: ['upload_assets', 'curadoria_assets'] }">
  Conteúdo para upload OU curadoria
</div>

<!-- Múltiplos roles (OR) -->
<div v-can="{ roles: ['admin', 'manager'] }">
  Conteúdo para admin OU manager
</div>

<!-- Múltiplas permissões (AND) -->
<div v-can="{ permissions: ['upload_assets', 'curadoria_assets'], requireAll: true }">
  Conteúdo para upload E curadoria
</div>
```

### 4. Proteção de Rotas

- **Guard de autenticação** em `src/app/guards/auth.ts`
- Rotas protegidas por permissões específicas
- Redirecionamento automático para `/unauthorized` se não tiver permissão
- Redirecionamento para `/login` se não estiver autenticado

### 5. Menu Dinâmico por Role

- Sidebar em `src/app/layout/AppSidebar.vue`
- Itens do menu aparecem/desaparecem baseado nas permissões do usuário
- Cada item tem uma permissão específica associada

### 6. Roles e Permissões

#### Roles disponíveis:
- `admin` - Administrador do sistema
- `produtor` - Produtor de conteúdo
- `roteirista` - Roteirista
- `pesquisador` - Pesquisador de conteúdo
- `editor` - Editor
- `viewer` - Visualizador
- `manager` - Gerente

#### Permissões por Role:

**Admin** (acesso total):
- Todas as permissões do sistema

**Produtor**:
- `view_dashboard`, `view_admin`, `view_pauta`, `create_pauta`, `edit_pauta`, `view_jobs`

**Roteirista**:
- `view_dashboard`, `view_storyboard`, `create_storyboard`, `edit_storyboard`, `view_pauta`

**Pesquisador**:
- `view_dashboard`, `view_assets`, `upload_assets`, `curadoria_assets`, `view_clipping`

### 7. Stores do Pinia

#### useUserStore
- Gestão do usuário logado, roles e permissões
- Método `simulateLogin()` para diferentes tipos de usuário
- Geração automática de permissões baseada nos roles

#### useSettingsStore
- Gestão de tema, idioma e configurações do sidebar
- Persistência no localStorage

#### useToastStore
- Sistema de notificações toast
- Tipos: success, error, warning, info

### 8. Demonstração Visual do RBAC

Cada página mostra seções específicas baseadas no role:

- **Dashboard**: Cards de acesso rápido por role
- **Admin**: Funcionalidades administrativas + info do usuário
- **Assets**: Upload/Curadoria para pesquisador
- **Storyboard**: Criar/Editar para roteirista
- **Pauta**: Criar/Editar para produtor

## Como Testar

1. Acesse `/login`
2. Escolha um tipo de usuário (Admin, Produtor, Roteirista, Pesquisador)
3. Faça login (email e senha são preenchidos automaticamente)
4. Navegue pelas páginas para ver as diferenças no acesso
5. Observe o menu lateral - itens aparecem/desaparecem conforme o role
6. Teste funcionalidades específicas em cada página

## Critérios de Aceite ✅

- ✅ **Usuário "Produtor" vê Pautas e Admin** - Implementado
- ✅ **"Roteirista" vê Storyboard** - Implementado  
- ✅ **"Pesquisador" vê Upload/Curadoria** - Implementado
- ✅ **Página /login que seta usuário e roles no store** - Implementado
- ✅ **Composable useRBAC() com can(perm|role)** - Implementado
- ✅ **Diretiva v-can** - Implementado
- ✅ **Proteção de rotas por papel** - Implementado
- ✅ **Menu dinâmico por role** - Implementado

## Estrutura de Arquivos

```
src/
├── app/
│   ├── guards/
│   │   └── auth.ts                 # Guard de autenticação
│   ├── layout/
│   │   ├── AppLayout.vue          # Layout principal
│   │   ├── AppSidebar.vue         # Menu lateral dinâmico
│   │   └── AppHeader.vue          # Header com controles
│   ├── router/
│   │   └── index.ts               # Configuração de rotas
│   └── stores/
│       ├── user.ts                # Store do usuário
│       ├── settings.ts            # Store de configurações
│       └── toast.ts               # Store de notificações
├── shared/
│   ├── composables/
│   │   └── useRBAC.ts             # Composable principal de RBAC
│   ├── directives/
│   │   └── vCan.ts                # Diretiva v-can
│   ├── types/
│   │   └── index.ts               # Tipos TypeScript
│   └── constants/
│       └── index.ts               # Constantes e mapeamentos
└── domains/
    ├── auth/
    │   └── LoginView.vue          # Página de login
    ├── admin/
    │   └── AdminView.vue          # Página admin
    ├── assets/
    │   └── AssetsView.vue         # Página assets
    ├── storyboard/
    │   └── StoryboardView.vue     # Página storyboard
    └── pauta/
        └── PautaView.vue          # Página pauta
```

## Tecnologias Utilizadas

- Vue 3 (Composition API)
- TypeScript
- Pinia (State Management)
- Vue Router
- Tailwind CSS
- PrimeVue + PrimeIcons
- Vue I18n
- Vite