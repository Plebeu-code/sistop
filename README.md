# 🚀 SisTop - Sistema de Produção de Conteúdo

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PrimeVue](https://img.shields.io/badge/PrimeVue-007AD9?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD700?style=for-the-badge&logo=vue.js&logoColor=black)

**Sistema moderno e acessível para gerenciamento de produção de conteúdo audiovisual**

[🌐 Demo](http://localhost:5173) | [📖 Documentação](#-documentação) | [🛠️ Desenvolvimento](#%EF%B8%8F-desenvolvimento)

</div>

---

## 📋 Índice

- [✨ Características](#-características)
- [🏗️ Arquitetura](#%EF%B8%8F-arquitetura)
- [🚀 Início Rápido](#-início-rápido)
- [💻 Desenvolvimento](#-desenvolvimento)
- [🔧 Scripts Disponíveis](#-scripts-disponíveis)
- [📦 Estrutura do Projeto](#-estrutura-do-projeto)
- [🎨 UI/UX e Acessibilidade](#-uiux-e-acessibilidade)
- [🌐 Internacionalização](#-internacionalização)
- [🧪 Testes](#-testes)
- [📈 Performance](#-performance)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## ✨ Características

### 🎯 Funcionalidades Principais
- **Dashboard Analítico**: Visão geral de métricas e KPIs
- **Gerenciamento de Assets**: Upload, organização e preview de mídia
- **Sistema de Clipping**: Edição e corte de conteúdo audiovisual
- **Storyboard Visual**: Criação e edição de roteiros visuais
- **Text-to-Speech**: Conversão de texto em áudio com múltiplas vozes
- **Sistema de Jobs**: Monitoramento de processamento em tempo real
- **Relatórios Avançados**: Analytics e exportação de dados
- **Administração Completa**: Gerenciamento de usuários e permissões

### 🚀 Tecnologias Modernas
- **Vue 3** com Composition API
- **TypeScript** para type safety
- **PrimeVue 4.4.0** para componentes UI modernos
- **Pinia** para gerenciamento de estado
- **Vue Router 4** para roteamento SPA
- **Vue I18n** para internacionalização
- **Vite 7** para build otimizado
- **Vitest** para testes unitários

### ♿ Acessibilidade Primeiro
- **WCAG 2.1 AA** compliant
- **Navegação por teclado** completa
- **Screen reader** otimizado
- **Alto contraste** e modo escuro
- **Focus management** inteligente
- **ARIA labels** e landmarks semânticos

---

## 🏗️ Arquitetura

### 📐 Padrões Arquiteturais
```
src/
├── app/                    # Configuração da aplicação
│   ├── layout/            # Componentes de layout (AppHeader, AppSidebar)
│   ├── router/            # Configuração de rotas
│   ├── stores/            # Stores Pinia globais
│   └── i18n/              # Configuração de idiomas
├── domains/               # Domínios de negócio
│   ├── admin/             # Módulo de administração
│   ├── assets/            # Gerenciamento de assets
│   ├── clipping/          # Sistema de clipping
│   ├── jobs/              # Monitoramento de jobs
│   ├── reports/           # Relatórios e analytics
│   ├── storyboard/        # Criação de storyboards
│   └── tts/               # Text-to-Speech
└── shared/                # Recursos compartilhados
    ├── components/        # Componentes reutilizáveis
    ├── composables/       # Composables Vue
    ├── directives/        # Diretivas customizadas
    ├── services/          # Serviços e APIs
    ├── types/             # Definições TypeScript
    └── utils/             # Utilitários
```

---

## 🚀 Início Rápido

### 📋 Pré-requisitos
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 ou **yarn** >= 1.22.0
- **Git** para controle de versão

### ⚡ Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistop.git

# Entre no diretório
cd sistop

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

🎉 **Pronto!** Acesse [http://localhost:5173](http://localhost:5173)

---

## 💻 Desenvolvimento

### 🛠️ Ambiente de Desenvolvimento

#### Configuração do VS Code
Instale as extensões recomendadas:
- **Volar** - Suporte para Vue 3
- **TypeScript Vue Plugin** - Melhor integração TS
- **Prettier** - Formatação de código
- **ESLint** - Linting
- **Auto Rename Tag** - Produtividade HTML

---

## 🔧 Scripts Disponíveis

### 🏃‍♂️ Desenvolvimento
```bash
# Servidor de desenvolvimento com HMR
npm run dev

# Servidor com host exposto
npm run dev -- --host

# Servidor em porta específica
npm run dev -- --port 3000
```

### 🏗️ Build e Deploy
```bash
# Build de produção
npm run build

# Preview do build de produção
npm run preview

# Type checking
npm run type-check
```

### 🧪 Testes e Qualidade
```bash
# Testes unitários
npm run test:unit

# Linting
npm run lint

# Lint com correção automática
npm run lint -- --fix
```

---

## 📦 Estrutura do Projeto

### 🗂️ Organização por Domínios
```
src/domains/admin/
├── components/           # Componentes específicos do domínio
│   ├── UserList.vue
│   ├── UserForm.vue
│   └── PermissionMatrix.vue
├── composables/          # Lógica de negócio
│   ├── useUsers.ts
│   └── usePermissions.ts
├── stores/               # Estado do domínio
│   ├── userStore.ts
│   └── permissionStore.ts
├── types/                # Tipos específicos
│   └── admin.types.ts
├── views/                # Páginas do domínio
│   ├── AdminDashboard.vue
│   └── UserManagement.vue
└── services/             # Serviços de API
    └── adminApi.ts
```

---

## 🎨 UI/UX e Acessibilidade

### 🎯 Princípios de Design
- **Mobile First**: Design responsivo priorizando dispositivos móveis
- **Consistent**: Sistema de design coeso e previsível
- **Accessible**: Inclusivo para todos os usuários
- **Performance**: Interações fluidas e carregamento rápido

### ♿ Recursos de Acessibilidade

#### Navegação por Teclado
- **Tab**: Navegação entre elementos focáveis
- **Enter/Space**: Ativação de botões e links
- **Escape**: Fechamento de modais e dropdowns
- **Setas**: Navegação em menus e listas
- **Alt + M**: Toggle do menu lateral
- **Alt + N**: Foco na navegação principal
- **Ctrl + /**: Menu de atalhos

#### Tecnologias Assistivas
- **Screen Readers**: Anúncios de navegação e mudanças de estado
- **Voice Control**: Todos os elementos são ativáveis por voz
- **High Contrast**: Suporte a modo de alto contraste

---

## 🌐 Internacionalização

### 🗣️ Idiomas Suportados
- **Português (pt-BR)**: Idioma padrão
- **Inglês (en-US)**: Idioma secundário

### 📝 Estrutura de Traduções
```typescript
// src/app/i18n/locales/pt-BR.ts
export default {
  app: {
    name: 'SisTop',
    welcome: 'Bem-vindo ao SisTop'
  },
  navigation: {
    dashboard: 'Dashboard',
    assets: 'Assets',
    reports: 'Relatórios'
  },
  accessibility: {
    skipToMain: 'Pular para conteúdo principal',
    navigatedTo: 'Navegado para {page}'
  }
}
```

---

## 🧪 Testes

### 🎯 Estratégia de Testes
- **Unit Tests**: Lógica de componentes e composables
- **Integration Tests**: Fluxos entre componentes
- **Accessibility Tests**: Conformidade WCAG

### 🛠️ Ferramentas
- **Vitest**: Framework de testes rápido
- **Vue Test Utils**: Utilitários para testar componentes Vue

---

## 📈 Performance

### ⚡ Otimizações Implementadas
- **Tree Shaking**: Eliminação de código não utilizado
- **Code Splitting**: Carregamento lazy por rotas
- **Bundle Analysis**: Análise de tamanho dos chunks
- **Caching Strategy**: Cache inteligente de recursos

### 📊 Métricas Alvo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 250KB (gzipped)

---

## 🤝 Contribuição

### 🛠️ Como Contribuir

1. **Fork** o repositório
2. **Clone** seu fork: `git clone https://github.com/seu-usuario/sistop.git`
3. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
4. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
5. **Push** para a branch: `git push origin feature/nova-funcionalidade`
6. **Abra** um Pull Request

### 📝 Padrões de Commit
Seguimos o [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adiciona nova funcionalidade
fix: corrige bug na navegação
docs: atualiza documentação
style: ajustes de formatação
refactor: refatora componente de usuário
test: adiciona testes para Asset API
chore: atualiza dependências
```

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

<div align="center">

**🌟 Feito com ❤️ pela equipe SisTop**

[⬆️ Voltar ao topo](#-sistop---sistema-de-produção-de-conteúdo)

</div>
