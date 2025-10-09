import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '../guards/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../../domains/dashboard/DashboardView.vue')
        },
        {
          path: '/admin',
          name: 'admin',
          component: () => import('../../domains/admin/AdminView.vue'),
          meta: { permissions: ['view_admin'] }
        },
        {
          path: '/assets',
          name: 'assets',
          component: () => import('../../domains/assets/views/AssetsView.vue'),
        },
        {
          path: '/clipping',
          name: 'clipping',
          component: () => import('../../domains/clipping/views/ClippingView.vue'),
        },
        {
          path: '/storyboard',
          name: 'storyboard',
          component: () => import('../../domains/storyboard/StoryboardView.vue'),
        },
        {
          path: '/tts',
          name: 'tts',
          component: () => import('../../domains/tts/TtsView.vue'),
        },
        {
          path: '/jobs',
          name: 'jobs',
          component: () => import('../../domains/jobs/JobsView.vue'),
          // meta: { permissions: ['view_jobs'] }
        },
        {
          path: '/pauta',
          name: 'pauta',
          component: () => import('../../domains/pauta/PautaView.vue'),
        },
        {
          path: '/roteiro',
          name: 'roteiro',
          component: () => import('../../domains/roteiro/RoteiroView.vue'),
        },
        {
          path: '/reports',
          name: 'reports',
          component: () => import('../../domains/reports/ReportsView.vue'),
          meta: { permissions: ['view_reports'] }
        },
        {
          path: '/demo',
          name: 'demo',
          component: () => import('../../components/PrimeVueDemo.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../../domains/auth/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('../../shared/components/UnauthorizedView.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

router.beforeEach(authGuard)

export default router