<template>
  <aside 
    id="main-sidebar"
    class="modern-sidebar"
    role="navigation"
    aria-label="Menu principal"
    :class="{
      'modern-sidebar--collapsed': collapsed,
      'modern-sidebar--expanded': !collapsed
    }"
  >

    <!-- Navigation Menu -->
    <nav class="sidebar-nav" role="menubar">
      <div class="menu-sections">
        <!-- Quick Actions (Always visible) -->
        <div class="quick-section">
          <router-link
            to="/"
            v-slot="{ isActive }"
            custom
          >
            <button
              @click="$router.push('/')"
              :class="['quick-item', { 'quick-item--active': isActive }]"
              v-tooltip.right="collapsed ? 'Dashboard' : ''"
            >
              <i class="pi pi-home"></i>
              <span v-if="!collapsed">Dashboard</span>
              <div class="quick-item-indicator"></div>
            </button>
          </router-link>
          
          <router-link
            to="/jobs"
            v-slot="{ isActive }"
            custom
          >
            <button
              @click="$router.push('/jobs')"
              :class="['quick-item', { 'quick-item--active': isActive }]"
              v-tooltip.right="collapsed ? 'Jobs' : ''"
            >
              <i class="pi pi-briefcase"></i>
              <span v-if="!collapsed">Jobs</span>
              <Badge v-if="jobsCount > 0 && !collapsed" :value="jobsCount" class="item-badge" />
              <div class="quick-item-indicator"></div>
            </button>
          </router-link>
        </div>

        <!-- Menu Groups -->
        <div class="menu-groups">
          <div 
            v-for="group in menuGroups" 
            :key="group.key"
            class="menu-group"
          >
            <!-- Group Header -->
            <div 
              v-if="!collapsed"
              class="group-header"
              @click="toggleGroup(group.key)"
            >
              <div class="group-title">
                <i :class="group.icon" class="group-icon"></i>
                <span class="group-label">{{ group.label }}</span>
              </div>
              <i 
                class="pi pi-chevron-down group-chevron"
                :class="{ 'group-chevron--open': expandedGroups.includes(group.key) }"
              ></i>
            </div>
            
            <!-- Collapsed Group Icon -->
            <div 
              v-else 
              class="group-collapsed"
              v-tooltip.right="group.label"
            >
              <i :class="group.icon"></i>
            </div>

            <!-- Group Items -->
            <div 
              class="group-items"
              :class="{ 
                'group-items--expanded': expandedGroups.includes(group.key),
                'group-items--collapsed': collapsed 
              }"
            >
              <router-link
                v-for="item in group.items"
                :key="item.key"
                :to="item.route"
                v-slot="{ isActive }"
                custom
              >
                <button
                  @click="$router.push(item.route)"
                  :class="['menu-item', { 'menu-item--active': isActive }]"
                  v-tooltip.right="collapsed ? item.label : ''"
                >
                  <i :class="item.icon" class="menu-item-icon"></i>
                  <span v-if="!collapsed" class="menu-item-label">{{ item.label }}</span>
                  <Badge 
                    v-if="item.badge && !collapsed" 
                    :value="item.badge" 
                    class="item-badge"
                    severity="info" 
                  />
                  <div class="menu-item-indicator"></div>
                </button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <div class="footer-actions">
        <!-- Settings -->
        <Button
          icon="pi pi-cog"
          :label="collapsed ? undefined : 'Configurações'"
          class="footer-btn"
          text
          @click="$router.push('/settings')"
          v-tooltip.right="collapsed ? 'Configurações' : ''"
        />
        
        <!-- Help -->
        <Button
          icon="pi pi-question-circle"
          :label="collapsed ? undefined : 'Ajuda'"
          class="footer-btn"
          text
          @click="openHelp"
          v-tooltip.right="collapsed ? 'Ajuda' : ''"
        />
      </div>
      
      <!-- Status Indicator -->
      <div class="status-indicator" v-if="!collapsed">
        <div class="status-dot"></div>
        <span class="status-text">Sistema Online</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Badge from 'primevue/badge'

// Props
defineProps<{
  collapsed: boolean
}>()

// Composables
const router = useRouter()

// Reactive state
const expandedGroups = ref(['main', 'content']) // Start with main groups expanded
const jobsCount = ref(3) // Mock job count

// Methods
const toggleGroup = (groupKey: string) => {
  const index = expandedGroups.value.indexOf(groupKey)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(groupKey)
  }
}

// Menu structure with groups
const menuGroups = computed(() => [
  {
    key: 'content',
    label: 'Conteúdo',
    icon: 'pi pi-folder',
    items: [
      {
        key: 'assets',
        label: 'Assets',
        icon: 'pi pi-images',
        route: '/assets',
        command: () => router.push('/assets')
      },
      {
        key: 'clipping',
        label: 'Clipping',
        icon: 'pi pi-file-edit',
        route: '/clipping',
        badge: '2',
        command: () => router.push('/clipping')
      },
      {
        key: 'storyboard',
        label: 'Storyboard',
        icon: 'pi pi-video',
        route: '/storyboard',
        command: () => router.push('/storyboard')
      },
      {
        key: 'tts',
        label: 'Text-to-Speech',
        icon: 'pi pi-volume-up',
        route: '/tts',
        command: () => router.push('/tts')
      }
    ]
  },
  {
    key: 'production',
    label: 'Produção',
    icon: 'pi pi-video',
    items: [
      {
        key: 'pauta',
        label: 'Pauta',
        icon: 'pi pi-calendar',
        route: '/pauta',
        command: () => router.push('/pauta')
      },
      {
        key: 'roteiro',
        label: 'Roteiro',
        icon: 'pi pi-file',
        route: '/roteiro',
        command: () => router.push('/roteiro')
      }
    ]
  },
  {
    key: 'management',
    label: 'Gerenciamento',
    icon: 'pi pi-cog',
    items: [
      {
        key: 'reports',
        label: 'Relatórios',
        icon: 'pi pi-chart-bar',
        route: '/reports',
        command: () => router.push('/reports')
      },
      {
        key: 'admin',
        label: 'Administração',
        icon: 'pi pi-cog',
        route: '/admin',
        command: () => router.push('/admin')
      }
    ]
  }
])

// Methods
const openHelp = () => {
  // Open help modal or navigate to help page
  router.push({ name: 'help' })
}
</script>

<style scoped>
/* Modern Sidebar Layout */
.modern-sidebar {
  position: fixed;
  left: 0;
  top: 4.5rem;
  bottom: 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.06);
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
}

.modern-sidebar--expanded {
  width: 17rem;
}

.modern-sidebar--collapsed {
  width: 4.5rem;
}

/* Sidebar Brand */
.sidebar-brand {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(147, 197, 253, 0.02) 100%);
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.brand-icon {
  width: 2.25rem;
  height: 2.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.brand-version {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  width: fit-content;
}

/* Sidebar Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 0;
}

.menu-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Quick Section */
.quick-section {
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.quick-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.quick-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.quick-item:hover::before {
  opacity: 1;
}

.quick-item:hover {
  color: #3b82f6;
  transform: translateX(2px);
}

.quick-item--active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 197, 253, 0.04) 100%);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.quick-item--active .quick-item-indicator {
  opacity: 1;
}

.quick-item-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 1.5rem;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.quick-item i {
  font-size: 1rem;
  width: 1.25rem;
  flex-shrink: 0;
}

.item-badge {
  margin-left: auto;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
  min-width: 1.25rem !important;
  height: 1.25rem !important;
  border-radius: 6px !important;
}

/* Menu Groups */
.menu-groups {
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-group {
  display: flex;
  flex-direction: column;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  user-select: none;
}

.group-header:hover {
  background: rgba(59, 130, 246, 0.04);
}

.group-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.group-icon {
  font-size: 0.875rem;
  color: #64748b;
  width: 1rem;
}

.group-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.group-chevron {
  font-size: 0.75rem;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.group-chevron--open {
  transform: rotate(180deg);
}

.group-collapsed {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  color: #64748b;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.group-collapsed:hover {
  background: rgba(59, 130, 246, 0.06);
  color: #3b82f6;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.group-items--expanded {
  max-height: 20rem;
}

.group-items--collapsed {
  position: absolute;
  left: 5rem;
  top: 0;
  background: white;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 0.5rem;
  z-index: 1001;
  min-width: 12rem;
  max-height: none;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
}

.group-collapsed:hover + .group-items--collapsed,
.group-items--collapsed:hover {
  opacity: 1;
  pointer-events: auto;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.75rem;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.04);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.menu-item:hover::before {
  opacity: 1;
}

.menu-item:hover {
  color: #3b82f6;
  transform: translateX(2px);
}

.menu-item--active {
  background: rgba(59, 130, 246, 0.06);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.menu-item--active .menu-item-indicator {
  opacity: 1;
}

.menu-item-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 1rem;
  background: #3b82f6;
  border-radius: 0 1px 1px 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.menu-item-icon {
  font-size: 0.875rem;
  width: 1rem;
  flex-shrink: 0;
}

.menu-item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(59, 130, 246, 0.08);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 197, 253, 0.01) 100%);
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.footer-btn {
  justify-content: flex-start !important;
  padding: 0.625rem 0.75rem !important;
  color: #64748b !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.footer-btn:hover {
  background: rgba(59, 130, 246, 0.05) !important;
  color: #3b82f6 !important;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 6px;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse-green 2s infinite;
}

.status-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: #16a34a;
}

@keyframes pulse-green {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Scrollbar Styling */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .modern-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .modern-sidebar--expanded {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .modern-sidebar--expanded {
    width: 100vw;
    max-width: 20rem;
  }
  
  .sidebar-brand {
    padding: 1rem 1.25rem;
  }
  
  .brand-name {
    font-size: 0.9375rem;
  }
  
  .quick-item,
  .menu-item {
    padding: 0.75rem 0.875rem;
  }
}

@media (max-width: 480px) {
  .modern-sidebar {
    top: 4rem;
  }
  
  .modern-sidebar--expanded {
    width: 100vw;
  }
  
  .brand-wrapper {
    gap: 0.75rem;
  }
  
  .brand-icon {
    width: 2rem;
    height: 2rem;
  }
}

/* Accessibility and Focus States */
.quick-item:focus-visible,
.menu-item:focus-visible,
.group-header:focus-visible,
.footer-btn:focus-visible {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .modern-sidebar {
    border-right-width: 2px;
  }
  
  .quick-item--active,
  .menu-item--active {
    border-width: 2px;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .status-dot {
    animation: none !important;
  }
  
  .group-items {
    transition: none !important;
  }
}

/* Print Styles */
@media print {
  .modern-sidebar {
    display: none;
  }
}
</style>

