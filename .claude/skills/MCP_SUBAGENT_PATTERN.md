# MCP Sub-agent Pattern: Zero-Memory Loading

## Problema

Como permitir que sub-agentes consumam servidores MCP sem que o agente raiz carregue a documentação completa na memória?

## Solução: Progressive Tool Discovery

O IRIS implementa um padrão de **descoberta progressiva de ferramentas** que permite:
- ✅ Sub-agentes têm acesso a todas as ferramentas MCP
- ✅ Agente raiz NÃO carrega documentação na memória
- ✅ Documentação carregada sob demanda (apenas quando necessária)
- ✅ Economia massiva de tokens (milhares → centenas)

---

## Como Funciona

### 1. **MCP Servers Configurados no Sistema**

Os servidores MCP são configurados **fora** do projeto, via:
- Configuração global do Claude Code (usuário/sistema)
- Arquivo `.mcp.json` no projeto (não commitado)
- Variáveis de ambiente do sistema

**Você NÃO configura servidores MCP em `.claude/settings.local.json`** (não suportado).

### 2. **Ferramentas Pré-aprovadas**

No `.claude/settings.local.json`, liste apenas as ferramentas que devem ser **pré-aprovadas** (não requer confirmação do usuário):

```json
{
  "permissions": {
    "allow": [
      "mcp__playwright__browser_navigate",
      "mcp__playwright__browser_click",
      "mcp__figma-desktop__get_metadata",
      "mcp__figma-desktop__get_screenshot"
    ]
  }
}
```

**Importante**: Isso NÃO carrega documentação - apenas marca como pré-aprovadas.

### 3. **Documentação Progressiva**

A estrutura `.claude/skills/mcp-servers/` organiza a documentação em camadas:

```
.claude/skills/mcp-servers/
├── INDEX.md                          # Nível 1: Lista de servidores (50 tokens)
├── playwright/
│   ├── INDEX.md                     # Nível 2: Lista de tools (100 tokens)
│   ├── browser_navigate.md          # Nível 3: Docs da tool (<200 tokens)
│   ├── browser_click.md
│   └── ... (21 tools total)
└── figma-desktop/
    ├── INDEX.md                      # Nível 2: Lista de tools (100 tokens)
    ├── get_metadata.md               # Nível 3: Docs da tool (<200 tokens)
    ├── get_screenshot.md
    └── ... (7 tools total)
```

### 4. **Sub-agentes Usam Progressive Discovery**

Quando um sub-agente precisa usar ferramentas MCP:

```typescript
// AGENTE RAIZ: NÃO carrega nada
Task({
  subagent_type: "figma-frame-mapper",
  prompt: "Map all frames from Figma page X",
  description: "Map Figma frames"
})

// SUB-AGENTE: Carrega apenas o necessário
1. Read .claude/skills/mcp-servers/INDEX.md
   → Descobre que "figma-desktop" existe (50 tokens)

2. Read .claude/skills/mcp-servers/figma-desktop/INDEX.md
   → Descobre que "get_metadata" existe (100 tokens)

3. Read .claude/skills/mcp-servers/figma-desktop/get_metadata.md
   → Aprende como usar a ferramenta (200 tokens)

4. Invoke mcp__figma-desktop__get_metadata({ nodeId: "123:456" })
   → Usa a ferramenta
```

**Total de tokens carregados**: ~350 tokens (vs. 5000+ se carregasse tudo de uma vez)

---

## Configuração no IRIS

### Verificar Servidores MCP Disponíveis

```bash
# Verificar se Playwright está disponível
npx @executeautomation/playwright-mcp-server --help

# Verificar se Figma está disponível
# (Nota: servidor Figma oficial ainda não publicado no npm)
```

### Adicionar Novas Ferramentas em `settings.local.json`

```json
{
  "permissions": {
    "allow": [
      // Adicione aqui apenas ferramentas que devem ser pré-aprovadas
      "mcp__playwright__browser_navigate",
      "mcp__figma-desktop__get_metadata"
    ]
  }
}
```

### Criar Documentação para Novas Ferramentas

1. **Adicionar ao INDEX global**:
   ```markdown
   # .claude/skills/mcp-servers/INDEX.md
   | novo-server | Purpose | Tools | Folder |
   ```

2. **Criar INDEX do servidor**:
   ```markdown
   # .claude/skills/mcp-servers/novo-server/INDEX.md
   ## Available Tools
   - tool_name_1 - Brief description
   - tool_name_2 - Brief description
   ```

3. **Criar docs de cada tool**:
   ```markdown
   # .claude/skills/mcp-servers/novo-server/tool_name_1.md
   ## Parameters
   ## Returns
   ## Errors
   ## Examples
   ```

**Template**: Use ferramentas existentes como referência (max 200 tokens por arquivo).

---

## Exemplo Completo: Usar Playwright em Sub-agente

### Agente Raiz (Você)

```typescript
// Não precisa carregar nenhuma documentação
Task({
  subagent_type: "general-purpose",
  prompt: `
    Use Playwright to test the login screen at http://localhost:5173.

    Progressive discovery workflow:
    1. Read .claude/skills/mcp-servers/INDEX.md
    2. Read .claude/skills/mcp-servers/playwright/INDEX.md
    3. Read individual tool docs as needed
    4. Use Playwright tools to perform the test
  `,
  description: "Test login screen"
})
```

### Sub-agente (Executa Automaticamente)

```typescript
// 1. Descobre servidores disponíveis
Read(".claude/skills/mcp-servers/INDEX.md")
// → Vê "playwright" disponível (50 tokens)

// 2. Descobre ferramentas do servidor
Read(".claude/skills/mcp-servers/playwright/INDEX.md")
// → Vê "browser_navigate", "browser_click", etc. (100 tokens)

// 3. Carrega docs das ferramentas necessárias
Read(".claude/skills/mcp-servers/playwright/browser_navigate.md")
Read(".claude/skills/mcp-servers/playwright/browser_click.md")
// → Total ~400 tokens

// 4. Usa as ferramentas
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
mcp__playwright__browser_click({ element: "Login Button" })
```

**Tokens carregados no agente raiz**: **0 tokens** ✅
**Tokens carregados no sub-agente**: **~550 tokens** (apenas o necessário)

---

## Benefícios

### Token Efficiency
- **Sem progressive discovery**: ~10,000 tokens (carrega todos os 28 MCP tools)
- **Com progressive discovery**: ~200-500 tokens (carrega apenas o necessário)
- **Economia**: ~95% de tokens

### Memory Efficiency
- Agente raiz mantém memória limpa
- Sub-agentes descartados após conclusão
- Documentação não polui contexto principal

### Scalability
- Adicionar novos servidores MCP não afeta o agente raiz
- Sub-agentes podem usar qualquer ferramenta disponível
- Documentação organizada e searchable

### Developer Experience
- Documentação sucinta e prática (<200 tokens/tool)
- Estrutura consistente e previsível
- Fácil de manter e atualizar

---

## Agentes Especializados no IRIS

O IRIS já inclui agentes especializados que seguem esse padrão:

### figma-frame-mapper
```yaml
# .claude/agents/figma-frame-mapper.md
Tools:
  - mcp__figma-desktop__get_metadata
  - mcp__figma-desktop__get_screenshot
  - mcp__figma-desktop__get_variable_defs
  - mcp__figma-desktop__get_design_context
```

**Uso**:
```typescript
Task({
  subagent_type: "figma-frame-mapper",
  prompt: "Map all frames from Figma page https://figma.com/file/xxx?node-id=123:456",
  description: "Map Figma frames"
})
```

O agente automaticamente:
1. Descobre ferramentas Figma via progressive discovery
2. Extrai hierarquia de frames
3. Captura screenshots
4. Extrai design tokens
5. Gera código React/TypeScript
6. Salva tudo em `docs/figma/`

---

## Padrão de Documentação

### INDEX Global (50 tokens)
```markdown
| Server | Purpose | Tools | Folder |
|--------|---------|-------|--------|
| playwright | Browser automation | 21 | `.claude/skills/mcp-servers/playwright/` |
```

### INDEX do Servidor (100 tokens)
```markdown
## Available Tools
- browser_navigate - Navigate to URLs
- browser_click - Click elements
```

### Documentação da Tool (<200 tokens)
```markdown
## Parameters
- url (required): string - URL to navigate to

## Returns
{ success: boolean, url: string }

## Example
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
```

**Regra de Ouro**: Cada arquivo deve ter <200 tokens para máxima eficiência.

---

## Troubleshooting

### Ferramenta MCP não disponível

**Sintoma**: `Tool not found: mcp__playwright__browser_navigate`

**Causa**: Servidor MCP não configurado no sistema

**Solução**:
1. Verifique se o servidor está instalado: `npx @executeautomation/playwright-mcp-server --help`
2. Configure no Claude Code (Settings → MCP Servers)
3. Adicione em `permissions.allow` no `.claude/settings.local.json`

### Sub-agente não carrega documentação

**Sintoma**: Sub-agente usa ferramentas incorretamente

**Causa**: Não seguiu o padrão de progressive discovery

**Solução**: No prompt do Task, instrua explicitamente:
```typescript
prompt: `
  1. Read .claude/skills/mcp-servers/INDEX.md
  2. Read .claude/skills/mcp-servers/{server}/INDEX.md
  3. Read individual tool docs as needed
  4. Use tools
`
```

### Documentação desatualizada

**Sintoma**: Parâmetros da ferramenta mudaram, mas docs antigas

**Solução**:
1. Teste a ferramenta diretamente: `npx {mcp-server} {tool-name} --help`
2. Atualize `.claude/skills/mcp-servers/{server}/{tool}.md`
3. Mantenha <200 tokens por arquivo

---

## Conclusão

O padrão MCP Sub-agent Pattern permite:
- ✅ **Zero tokens** carregados no agente raiz
- ✅ **Progressive discovery** sob demanda
- ✅ **Sub-agentes autônomos** com acesso completo às ferramentas
- ✅ **Documentação sucinta** e fácil de manter

**Arquivo chave**: `.claude/skills/mcp-servers/INDEX.md` - comece sempre por aqui!
