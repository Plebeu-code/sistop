import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import DashboardView from '../domains/dashboard/DashboardView.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'pt-BR',
  messages: {
    'pt-BR': {
      navigation: { dashboard: 'Dashboard' },
      app: { welcome: 'Bem-vindo' }
    }
  }
})

describe('DashboardView', () => {
  it('renders properly', () => {
    const wrapper = mount(DashboardView, {
      global: {
        plugins: [i18n]
      }
    })
    expect(wrapper.text()).toContain('Dashboard')
  })
})