#!/usr/bin/env node

/**
 * 🚀 SisTop - Script de CI Local
 * 
 * Script para executar todas as verificações de qualidade localmente
 * antes de fazer commit ou push.
 */

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'
import chalk from 'chalk'

// Configurações
const SCRIPTS = [
  {
    name: '🔍 Type Check',
    command: 'npm run type-check',
    description: 'Verificação de tipos TypeScript'
  },
  {
    name: '🧹 Lint Check',
    command: 'npm run lint',
    description: 'Verificação de padrões de código'
  },
  {
    name: '🏗️ Build Test',
    command: 'npm run build',
    description: 'Teste de build de produção'
  },
  {
    name: '🧪 Unit Tests',
    command: 'npm run test:unit',
    description: 'Execução de testes unitários'
  }
]

class CIRunner {
  constructor() {
    this.results = []
    this.startTime = performance.now()
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = `[${timestamp}]`
    
    switch (type) {
      case 'success':
        console.log(chalk.gray(prefix), chalk.green(message))
        break
      case 'error':
        console.log(chalk.gray(prefix), chalk.red(message))
        break
      case 'warning':
        console.log(chalk.gray(prefix), chalk.yellow(message))
        break
      case 'info':
      default:
        console.log(chalk.gray(prefix), chalk.blue(message))
        break
    }
  }

  async runScript(script) {
    const startTime = performance.now()
    
    try {
      this.log(`Executando: ${script.name}`, 'info')
      this.log(`Comando: ${script.command}`, 'info')
      
      execSync(script.command, {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 300000 // 5 minutos timeout
      })
      
      const duration = Math.round(performance.now() - startTime)
      this.log(`✅ ${script.name} - Concluído em ${duration}ms`, 'success')
      
      return {
        name: script.name,
        success: true,
        duration,
        error: null
      }
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      this.log(`❌ ${script.name} - Falhou em ${duration}ms`, 'error')
      
      if (error.stdout) {
        this.log(`Saída: ${error.stdout}`, 'warning')
      }
      
      if (error.stderr) {
        this.log(`Erro: ${error.stderr}`, 'error')
      }
      
      return {
        name: script.name,
        success: false,
        duration,
        error: error.message
      }
    }
  }

  async run() {
    console.clear()
    
    // Header
    console.log(chalk.cyan.bold('🚀 SisTop - CI Local'))
    console.log(chalk.gray('Sistema de Produção de Conteúdo'))
    console.log(chalk.gray('─'.repeat(50)))
    console.log()
    
    this.log('🏁 Iniciando verificações de qualidade...', 'info')
    console.log()
    
    // Executar scripts
    for (const script of SCRIPTS) {
      const result = await this.runScript(script)
      this.results.push(result)
      console.log()
    }
    
    // Relatório final
    this.generateReport()
  }

  generateReport() {
    const totalTime = Math.round(performance.now() - this.startTime)
    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    
    console.log(chalk.cyan.bold('📊 Relatório Final'))
    console.log(chalk.gray('─'.repeat(50)))
    
    // Estatísticas
    console.log(`⏱️  Tempo total: ${chalk.bold(totalTime + 'ms')}`)
    console.log(`✅ Sucessos: ${chalk.green.bold(successful)}`)
    console.log(`❌ Falhas: ${chalk.red.bold(failed)}`)
    console.log()
    
    // Detalhes dos resultados
    this.results.forEach(result => {
      const status = result.success ? chalk.green('✅') : chalk.red('❌')
      const duration = chalk.gray(`(${result.duration}ms)`)
      
      console.log(`${status} ${result.name} ${duration}`)
      
      if (!result.success && result.error) {
        console.log(`   ${chalk.red('↳')} ${result.error}`)
      }
    })
    
    console.log()
    
    // Status final
    if (failed === 0) {
      console.log(chalk.green.bold('🎉 Todas as verificações passaram!'))
      console.log(chalk.green('✨ Projeto pronto para commit/deploy'))
      process.exit(0)
    } else {
      console.log(chalk.red.bold('💥 Algumas verificações falharam!'))
      console.log(chalk.yellow('🔧 Corrija os problemas antes de continuar'))
      
      // Sugestões de correção
      console.log()
      console.log(chalk.cyan.bold('💡 Sugestões:'))
      
      this.results.forEach(result => {
        if (!result.success) {
          console.log(chalk.yellow(`• Para ${result.name}:`))
          
          if (result.name.includes('Type Check')) {
            console.log(chalk.gray('  - Verifique erros de TypeScript no código'))
            console.log(chalk.gray('  - Execute: npm run type-check'))
          }
          
          if (result.name.includes('Lint')) {
            console.log(chalk.gray('  - Corrija problemas de linting'))
            console.log(chalk.gray('  - Execute: npm run lint -- --fix'))
          }
          
          if (result.name.includes('Build')) {
            console.log(chalk.gray('  - Verifique erros de compilação'))
            console.log(chalk.gray('  - Revise imports e dependências'))
          }
          
          if (result.name.includes('Tests')) {
            console.log(chalk.gray('  - Corrija testes que falharam'))
            console.log(chalk.gray('  - Execute: npm run test:unit -- --watch'))
          }
        }
      })
      
      process.exit(1)
    }
  }
}

// Verificar se está sendo executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new CIRunner()
  runner.run().catch(error => {
    console.error(chalk.red('❌ Erro crítico:'), error)
    process.exit(1)
  })
}

export default CIRunner