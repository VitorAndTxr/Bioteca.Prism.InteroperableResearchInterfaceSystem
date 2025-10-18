# Comando validate-screen - Documentação

## Visão Geral

O comando `/validate-screen` implementa o fluxo de teste **Ultrathink** - uma metodologia abrangente de validação de telas que vai além dos testes básicos, garantindo qualidade em múltiplas dimensões.

## O que é Ultrathink?

Ultrathink é uma metodologia de teste que combina:
- **Ultra-thorough**: Análise completa de todos os elementos
- **Think-through**: Validação de cada caminho de interação
- **Ultra-deep**: Verificação profunda de gerenciamento de estado
- **Think-ahead**: Antecipação de casos extremos e cenários de erro

## Como Usar

### Comando Básico
```bash
/validate-screen [NomeDaTela]
```

### Opções Avançadas
```bash
# Com nó específico do Figma
/validate-screen Login --node 6804-13742

# Com viewport customizado
/validate-screen Dashboard --viewport mobile

# Validação rápida (sem performance)
/validate-screen Settings --quick

# Validação ultrathink completa
/validate-screen CriticalScreen --ultrathink
```

## As 5 Fases de Validação

### Fase 1: Extração e Análise do Design 🎨
- Extração completa do design do Figma
- Inventário de componentes
- Análise de layout e responsividade
- Documentação de tokens de design

### Fase 2: Revisão da Implementação 🔍
- Análise da estrutura de arquivos
- Validação de TypeScript
- Revisão de estilos e temas
- Verificação de cobertura de código

### Fase 3: Testes Interativos 🎮
- Testes de navegação
- Interação com componentes
- Transições de estado
- Fluxos completos do usuário

### Fase 4: Validação de Dados e Estado 📊
- Integração de contextos
- Comunicação com API
- Gerenciamento de estado
- Persistência de dados

### Fase 5: Regressão Visual e Performance 📸
- Testes de regressão visual
- Testes responsivos
- Métricas de performance
- Auditoria de acessibilidade

## Relatório de Validação

Após completar todas as fases, o comando gera um relatório abrangente:

```
═══════════════════════════════════════════════════════
    ULTRATHINK VALIDATION REPORT
═══════════════════════════════════════════════════════

🔬 SCREEN: LoginScreen
📅 DATE: 2025-01-18
⏱️ DURATION: 3m 45s

ULTRATHINK SCORE: 98/100 🏆

CERTIFICATION: ✅ ULTRATHINK VALIDATED
```

## Critérios de Sucesso

Uma tela passa na validação Ultrathink quando atende:

1. **Fidelidade ao Design**: 100% compatível com Figma
2. **Qualidade de Código**: TypeScript strict, sem `any`
3. **Interação**: Todos os fluxos funcionam corretamente
4. **Performance**: LCP < 2.5s, FCP < 1.8s
5. **Acessibilidade**: WCAG 2.1 AA compatível
6. **Responsividade**: Funciona em todos dispositivos-alvo
7. **Tratamento de Erros**: Degradação elegante
8. **Gerenciamento de Estado**: Previsível e testável
9. **Documentação**: README e Storybook stories
10. **Cobertura de Testes**: Testes unitários e integração

## Artefatos Gerados

O comando cria os seguintes artefatos:

- Screenshots de cada estado (`.playwright-mcp/`)
- Relatório de validação JSON
- Log detalhado de testes
- Métricas de performance
- Relatório de acessibilidade

## Exemplos de Uso Prático

### Validar Tela de Login
```bash
/validate-screen Login
```
Valida autenticação, formulários, estados de erro, navegação pós-login.

### Validar Lista de Usuários
```bash
/validate-screen UsersList --node 6804-13670
```
Valida tabela de dados, CRUD, paginação, ordenação, filtros.

### Validar Dashboard Mobile
```bash
/validate-screen Dashboard --viewport mobile
```
Foca em responsividade mobile, touch interactions, performance em dispositivos móveis.

## Integração CI/CD

Para integrar com pipelines de CI/CD:

```yaml
# .github/workflows/ultrathink.yml
name: Ultrathink Validation
on:
  pull_request:
    paths:
      - 'src/screens/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run Ultrathink Validation
        run: npx claude-code /validate-screen ${{ github.event.pull_request.title }}
```

## Filosofia Ultrathink

A abordagem Ultrathink garante:
- **Nenhum detalhe esquecido**: Cada aspecto validado
- **Foco no usuário**: Fluxos reais testados
- **Pronto para produção**: Sem surpresas em produção
- **Qualidade em primeiro lugar**: Padrões rigorosamente aplicados
- **Documentação completa**: Desenvolvedores futuros agradecerão

## Troubleshooting

### Erro: "Browser already in use"
Feche outras instâncias do Playwright ou use modo isolado.

### Erro: "Figma node not found"
Verifique se o nó ID está correto e você tem acesso ao arquivo Figma.

### Performance lenta
Use a flag `--quick` para pular testes de performance em desenvolvimento.

## Suporte

Para problemas ou sugestões sobre o comando validate-screen:
- Abra uma issue no repositório
- Consulte a documentação completa em `/docs/commands/`
- Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: 18 de Janeiro de 2025
**Versão**: 1.0.0
**Status**: Produção