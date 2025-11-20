# MCP Skill Mapper Agent - Especificação Técnica Completa

**Versão**: 1.0
**Data**: 14 de novembro de 2025
**Status**: Ready for Implementation
**Baseado em**: Anthropic's "Code Execution with MCP" article

---

## 1. Objetivo & Scope

### Objetivo Geral
Automatizar a descoberta, documentação e validação de servidores MCP (Model Context Protocol) em estrutura token-otimizada seguindo o padrão Progressive Tool Discovery do IRIS.

### Scope
- **Entrada**: Nome do servidor MCP ou lista de servidores
- **Saída**: Estrutura `.claude/skills/mcp-servers/{server-name}/` com documentação pronta para uso
- **Escala**: Suporta single-server ou batch processing (10+ servidores)
- **Qualidade**: Target 99%+ accuracy, 100% completeness

### Out of Scope
- Execução de código gerado (apenas geração de documentação)
- Modificação de servidores MCP existentes
- Deployment para produção
- Maintenance contínua (fora de initial mapping)

---

## 2. Arquitetura Técnica Detalhada

### 2.1 Componentes do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR AGENT                        │
│              (mcp-skill-mapper-master)                      │
│                                                              │
│ Input: ["github", "slack", "postgres"] ou URL              │
│ Output: Summary report + completion status                 │
│                                                              │
│ Responsabilidades:                                          │
│  • Parse & normalize input                                  │
│  • Distribute work to specialized agents                    │
│  • Coordinate phase sequence                               │
│  • Handle errors & retries                                 │
│  • Aggregate results & report                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┬─────────────┐
         │             │             │             │
         ▼             ▼             ▼             ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐
   │ DISCOVERY   │ │  SKILL      │ │ VALIDATION  │ │ OUTPUT   │
   │ AGENT       │ │ GENERATOR   │ │ AGENT       │ │ STORAGE  │
   │             │ │ AGENT       │ │             │ │          │
   │ Input:      │ │             │ │ Input:      │ │ Location:│
   │  Server     │ │ Input:      │ │  Generated  │ │ .claude/ │
   │  name/URL   │ │  Discovery  │ │  .md files  │ │ skills/  │
   │             │ │  JSON       │ │             │ │ mcp-     │
   │ Output:     │ │             │ │ Output:     │ │ servers/ │
   │  JSON with  │ │ Output:     │ │  Validation │ │          │
   │  all tools, │ │  Markdown   │ │  report +   │ │ Format:  │
   │  types      │ │  files      │ │  remediat   │ │ MD + JSON│
   │             │ │  <200 tokens│ │  plan       │ │          │
   │ Data:       │ │  each       │ │             │ │          │
   │  • Web      │ │             │ │ Data:       │ │          │
   │    search   │ │ Data:       │ │  • File I/O │ │          │
   │  • GitHub   │ │  • Template │ │  • Token    │ │          │
   │    analysis │ │    rendering│ │    count    │ │          │
   │  • NPM reg  │ │  • Token    │ │  • Test     │ │          │
   │  • Intros   │ │    calc     │ │    execution│ │          │
   │    pection  │ │            │ │             │ │          │
   └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘
         │             │             │             │
         └─────────────┼─────────────┼─────────────┘
                       │
              ┌────────▼───────────┐
              │  PERSISTENT STORE  │
              │                    │
              │ Global INDEX.md    │
              │ Server INDEXs      │
              │ Tool files (.md)   │
              │ Validation reports │
              └────────────────────┘
```

### 2.2 Data Flow

```
USER INPUT
    │
    ▼
┌─────────────────────────────┐
│ INPUT NORMALIZATION         │
│ • Parse format (CSV/JSON)   │
│ • Remove duplicates         │
│ • Validate server names     │
└──────────────┬──────────────┘
               │
    ┌──────────▼──────────┐
    │ PHASE 1: DISCOVERY  │ (Parallel)
    │                     │
    │ For each server:    │
    │ 1. NPM search       │
    │ 2. GitHub fetch     │
    │ 3. Type extraction  │
    │ 4. Tool enumeration │
    │                     │
    │ Output: discovery.json
    └──────────────┬──────┘
                   │
    ┌──────────────▼──────────┐
    │ PHASE 2: GENERATION     │ (Sequential)
    │                         │
    │ For each discovery.json:│
    │ 1. Create folder        │
    │ 2. Generate INDEX.md    │
    │ 3. Generate tool files  │
    │ 4. Update global INDEX  │
    │                         │
    │ Output: .md files
    └──────────────┬──────────┘
                   │
    ┌──────────────▼──────────┐
    │ PHASE 3: VALIDATION     │ (Parallel)
    │                         │
    │ For each output:        │
    │ 1. Completeness check   │
    │ 2. Token counting       │
    │ 3. Execution test (opt) │
    │ 4. Link validation      │
    │                         │
    │ Output: validation.json
    └──────────────┬──────────┘
                   │
    ┌──────────────▼──────────┐
    │ REPORT GENERATION       │
    │                         │
    │ • Summary stats         │
    │ • Errors/warnings       │
    │ • Remediation plan      │
    │ • Completion metrics    │
    └─────────────────────────┘
```

---

## 3. Especificação de Agentes

### 3.1 MCP Discovery Agent

#### Metadados
```yaml
agent_name: "mcp-discovery-agent"
agent_type: "reconnaissance"
model: "claude-sonnet-4-5"
max_tokens: 16000
tools_required:
  - web_search
  - web_fetch
  - bash (for introspection)
personality: "systematic, thorough, detail-oriented"
```

#### Input Schema
```json
{
  "serverName": "github",  // or "@modelcontextprotocol/server-github"
  "serverUrl": "https://...",  // optional
  "includeExecution": true,  // optional: test server if possible
  "timeout": 300  // seconds
}
```

#### Output Schema
```json
{
  "discovered": true,
  "server": {
    "name": "github",
    "package": "@modelcontextprotocol/server-github",
    "version": "1.0.0",
    "purpose": "GitHub repository and pull request management",
    "author": "Anthropic",
    "repository": "https://github.com/modelcontextprotocol/servers"
  },
  "documentation": {
    "source": "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    "lastAccessed": "2025-11-14T10:30:00Z",
    "completeness": 95  // percentage
  },
  "environment": {
    "required": [
      {
        "name": "GITHUB_TOKEN",
        "description": "GitHub personal access token",
        "example": "ghp_xxxxxxxxxxxxxxxxxxxx"
      }
    ],
    "optional": [
      {
        "name": "GITHUB_API_URL",
        "description": "Custom GitHub API endpoint (for GitHub Enterprise)",
        "default": "https://api.github.com"
      }
    ]
  },
  "tools": [
    {
      "name": "create_issue",
      "description": "Creates a new GitHub issue in specified repository",
      "parameters": [
        {
          "name": "owner",
          "type": "string",
          "required": true,
          "description": "Repository owner (user or organization)"
        },
        {
          "name": "repo",
          "type": "string",
          "required": true,
          "description": "Repository name"
        },
        {
          "name": "title",
          "type": "string",
          "required": true,
          "description": "Issue title (max 256 chars)"
        },
        {
          "name": "body",
          "type": "string",
          "required": false,
          "description": "Issue description (markdown supported)"
        },
        {
          "name": "labels",
          "type": "array<string>",
          "required": false,
          "description": "Labels to add to issue"
        }
      ],
      "returns": {
        "type": "object",
        "fields": [
          {
            "name": "issue_number",
            "type": "integer",
            "description": "Created issue number"
          },
          {
            "name": "url",
            "type": "string",
            "description": "Issue URL"
          },
          {
            "name": "created_at",
            "type": "string",
            "description": "Creation timestamp (ISO 8601)"
          }
        ]
      },
      "errors": [
        {
          "condition": "owner/repo not found",
          "message": "Repository not found",
          "statusCode": 404
        },
        {
          "condition": "invalid token",
          "message": "Bad credentials",
          "statusCode": 401
        }
      ],
      "examples": [
        {
          "description": "Create simple issue",
          "code": "github.create_issue(owner='user', repo='repo', title='Bug fix needed')"
        }
      ]
    }
    // ... more tools
  ],
  "warnings": [],
  "errors": []
}
```

#### Algoritmo Detalhado

```
FASE 1: IDENTIFICAÇÃO
┌─ Normalize server name
│  • Remove "@modelcontextprotocol/"
│  • Remove "server-" prefix se presente
│  • E.g., "github" → "@modelcontextprotocol/server-github"
│
├─ Search NPM registry
│  • Query: npm view {package} --json
│  • Extract: version, author, homepage, repository
│  • Detect if official (@modelcontextprotocol scope)
│
└─ If URL provided
   └─ Validate URL structure
      └─ Extract repo owner/name from GitHub URLs

FASE 2: DOCUMENTAÇÃO
├─ Fetch README from GitHub
│  • Priority: /README.md > /docs/API.md > /docs/README.md
│  • Parse markdown for:
│    - Purpose/description
│    - Installation instructions
│    - Environment variables
│    - Tool list
│
├─ Fetch TypeScript definitions (if .ts)
│  • Look for .d.ts files
│  • Parse interface definitions
│  • Extract tool names and parameter types
│
└─ Fetch examples
   └─ Look for /examples or /docs/examples
      └─ Parse tool usage patterns

FASE 3: ENUMERAÇÃO DE FERRAMENTAS
├─ Method A: TypeScript Analysis (preferred)
│  • Parse .ts files for exports
│  • Extract JSDoc comments
│  • Build tool list from type definitions
│
├─ Method B: Runtime Introspection (if execution possible)
│  • npm install -g {package}
│  • Spawn server process
│  • List available tools via MCP protocol
│  • Extract types from tool definitions
│
└─ Method C: Web Search (fallback)
   └─ Search for {package} documentation online
      └─ Extract tools from API docs

FASE 4: LIMPEZA & ESTRUTURAÇÃO
├─ Deduplicate tool descriptions
├─ Standardize parameter names/types
├─ Add missing metadata
└─ Calculate completeness score

OUTPUT: JSON structure com todas informações descobertas
```

---

### 3.2 Skill Generator Agent

#### Metadados
```yaml
agent_name: "skill-generator-agent"
agent_type: "content-creation"
model: "claude-sonnet-4-5"
max_tokens: 8000  # Lower, more focused
tools_required:
  - file_creation
  - template_processing
personality: "precise, concise, optimized"
```

#### Input Schema
```json
{
  "discoveryJson": {...},  // Output from Discovery Agent
  "outputPath": ".claude/skills/mcp-servers",
  "tokenBudget": 200,  // Per tool file
  "globalIndexPath": ".claude/skills/mcp-servers/INDEX.md"
}
```

#### Output Schema
```json
{
  "generated": true,
  "server": "github",
  "files": {
    "global_index": {
      "path": ".claude/skills/mcp-servers/INDEX.md",
      "status": "updated",
      "action": "added_row"
    },
    "server_index": {
      "path": ".claude/skills/mcp-servers/github/INDEX.md",
      "status": "created",
      "size_tokens": 95
    },
    "tool_files": [
      {
        "name": "create_issue.md",
        "path": ".claude/skills/mcp-servers/github/create_issue.md",
        "status": "created",
        "size_tokens": 145,
        "completeness": 100
      }
      // ... more files
    ]
  },
  "statistics": {
    "total_files": 16,
    "total_tokens": 1850,
    "avg_tokens_per_tool": 145,
    "completeness": 100,
    "time_elapsed_seconds": 45
  }
}
```

#### Templates

**Global INDEX.md** (50 tokens target):
```markdown
# MCP Servers Available

Quick reference for progressive tool discovery.

| Server | Purpose | Tools | Folder |
|--------|---------|-------|--------|
| {{server_name}} | {{purpose}} | {{tool_count}} | `/mcp-servers/{{server_name}}/` |

**Last Updated**: {{timestamp}}
**Total Servers**: {{server_count}}
```

**Server INDEX.md** (100 tokens target):
```markdown
# {{server_name}} MCP Server

**Purpose**: {{description}}

**Package**: `{{package_name}}`

**Version**: {{version}}

## Setup

```bash
npm install -g {{package_name}}
{{setup_command}}
```

## Environment Variables

{{#if environment.required}}
**Required**:
{{#each environment.required}}
- `{{name}}`: {{description}}
{{/each}}
{{/if}}

{{#if environment.optional}}
**Optional**:
{{#each environment.optional}}
- `{{name}}`: {{description}} (default: {{default}})
{{/each}}
{{/if}}

## Available Tools ({{tool_count}})

| Tool | Description |
|------|-------------|
{{#each tools}}
| [{{name}}]({{name}}.md) | {{description}} |
{{/each}}

**Last Updated**: {{timestamp}}

**Source**: {{documentation_source}}
```

**Tool File** (<200 tokens target):
```markdown
# {{tool_name}}

{{brief_description}}

**Access**: `{{ServerName}}_Server.{{tool_name}}`

## Parameters

{{#each parameters}}
- **{{name}}** ({{type}}, {{required}}): {{description}}
{{/each}}

## Returns

{{#each returns}}
- **{{name}}** ({{type}}): {{description}}
{{/each}}

## Errors

{{#each errors}}
- **{{condition}}**: {{message}}
{{/each}}

## Example

```python
{{example_code}}
```
```

#### Token Optimization Rules

```
RULE 1: Abbreviations
- "required" → "req"
- "optional" → "opt"
- "string" → "str"
- "integer" → "int"
- "array<string>" → "str[]"

RULE 2: Remove Duplication
- Don't repeat parameter type in description
- Don't explain return field if obvious from name
- Combine multiple 1-liners into table

RULE 3: Example Minimalism
- Use shortest realistic parameters
- Omit optional parameters unless essential
- Show one example per tool (not variations)

RULE 4: Punctuation Efficiency
- No periods after lists
- Abbreviate: "e.g." not "for example"
- Omit articles: "Creates issue" not "Creates an issue"

EXAMPLE (Token Optimization):
❌ ORIGINAL (250 tokens):
The `create_issue` function is a tool that can be used to create
a new GitHub issue in a specified repository. This tool takes
several parameters as input including the repository owner, the
repository name, and the issue title. You can optionally provide
a description for the issue as well as a list of labels...

✅ OPTIMIZED (<150 tokens):
# create_issue
Creates new GitHub issue.

## Parameters
- **owner** (str, req): Repository owner
- **repo** (str, req): Repository name
- **title** (str, req): Issue title
- **body** (str, opt): Description (markdown)
- **labels** (str[], opt): Issue labels

## Returns
- **issue_number** (int): Created issue ID
- **url** (str): Issue URL
- **created_at** (str): Creation timestamp

## Example
```python
github.create_issue(owner='user', repo='repo', title='Bug fix')
```
```

---

### 3.3 Skill Validator Agent

#### Metadados
```yaml
agent_name: "skill-validator-agent"
agent_type: "quality-assurance"
model: "claude-haiku-4-5"  # Fast, cost-efficient
max_tokens: 4000
tools_required:
  - bash
  - file_reader
  - web_fetch  # For optional execution test
personality: "thorough, detail-oriented, systematic"
```

#### Input Schema
```json
{
  "serverName": "github",
  "skillsPath": ".claude/skills/mcp-servers/github",
  "discoveryJson": {...},  // For comparison
  "executeTests": true,  // If env vars available
  "timeout": 60  // seconds
}
```

#### Output Schema
```json
{
  "validated": true,
  "overallStatus": "PASS",  // PASS, PASS_WITH_WARNINGS, FAIL
  "checks": {
    "documentation": {
      "status": "PASS",
      "findings": []
    },
    "token_count": {
      "status": "PASS",
      "findings": []
    },
    "link_validation": {
      "status": "PASS",
      "findings": []
    },
    "execution_test": {
      "status": "SKIPPED",  // PASS, FAIL, SKIPPED
      "findings": []
    }
  },
  "warnings": [
    {
      "severity": "medium",
      "file": "send_message.md",
      "issue": "token_count_high",
      "current": 215,
      "target": 200,
      "suggestion": "Remove optional parameter descriptions"
    }
  ],
  "errors": [],
  "metrics": {
    "files_validated": 16,
    "tools_validated": 15,
    "completeness": 100,
    "avg_tokens_per_file": 145,
    "total_tokens": 2175,
    "time_elapsed_seconds": 15
  }
}
```

#### Checklist de Validação

**Documentation Completeness**:
- [ ] Global INDEX.md existe
- [ ] Server INDEX.md existe
- [ ] Todas ferramentas têm arquivo .md correspondente
- [ ] Contagem de ferramentas bate
- [ ] Todos os arquivos têm seções obrigatórias (Parameters, Returns, Errors, Example)

**Token Counting**:
- [ ] Todos arquivos < 250 tokens (soft limit)
- [ ] Média < 180 tokens/arquivo
- [ ] Global INDEX < 100 tokens
- [ ] Server INDEX < 150 tokens

**Link Validation**:
- [ ] Links relativos funcionam
- [ ] Nomes de arquivo no markdown batem estrutura real
- [ ] Referências cruzadas consistentes
- [ ] Nenhum link quebrado

**Consistency Checks**:
- [ ] Nomes de ferramentas consistent (snake_case em files)
- [ ] Estrutura de pasta correta
- [ ] Nenhum arquivo órfão
- [ ] Formatação uniforme
- [ ] Timestamps atualizados

**Execution Test** (Se possível):
- [ ] Servidor inicializa sem erros
- [ ] Ferramentas descobertas combinam documentação
- [ ] Exemplo de código executável
- [ ] Parâmetros validados
- [ ] Tipos de retorno batem

---

### 3.4 Orchestrator Agent

#### Metadados
```yaml
agent_name: "mcp-skill-mapper"
agent_type: "orchestration"
model: "claude-sonnet-4-5"
max_tokens: 12000
subagents:
  - mcp-discovery-agent
  - skill-generator-agent
  - skill-validator-agent
dependencies:
  - bash (for progress tracking)
personality: "organized, communicative, results-oriented"
```

#### Input Schema
```json
{
  "input": "github, slack, postgres",  // CSV, array, or URL
  "mode": "batch",  // single, batch, batch-url
  "parallelPhase1": true,  // Parallel discovery
  "executeValidation": true,  // Full validation
  "outputFormat": "json"  // json, markdown, html
}
```

#### Output Schema
```json
{
  "status": "success",
  "timestamp": "2025-11-14T10:45:00Z",
  "summary": {
    "servers_requested": 3,
    "servers_successful": 3,
    "servers_partial": 0,
    "servers_failed": 0,
    "total_tools_documented": 35,
    "total_files_created": 27
  },
  "results": [
    {
      "serverName": "github",
      "status": "success",
      "phases": {
        "discovery": {
          "status": "success",
          "time_seconds": 45,
          "tools_found": 15
        },
        "generation": {
          "status": "success",
          "time_seconds": 30,
          "files_created": 16
        },
        "validation": {
          "status": "pass",
          "time_seconds": 15,
          "warnings": 0
        }
      },
      "metrics": {
        "discovery_completeness": 99,
        "avg_tokens_per_tool": 145,
        "total_tokens": 2175,
        "total_time_seconds": 90
      }
    }
  ],
  "globalIndex": {
    "updated": true,
    "servers_total": 3,
    "path": ".claude/skills/mcp-servers/INDEX.md"
  },
  "performance": {
    "total_time_seconds": 150,
    "average_time_per_server": 50,
    "parallelization_efficiency": 0.85
  },
  "nextSteps": [
    "Test discovery accuracy with manual sample check",
    "Optimize send_message.md token count (optional)",
    "Test progressive discovery workflow with agents"
  ]
}
```

#### Workflow Orchestration

```python
async def mcp_skill_mapper(input_list, mode):
    # PHASE 0: INITIALIZATION
    normalized_servers = normalize_input(input_list)
    validate_servers(normalized_servers)

    # PHASE 1: DISCOVERY (Parallel)
    discovery_tasks = []
    for server in normalized_servers:
        task = Task(
            subagent_type="mcp-discovery-agent",
            input={"serverName": server},
            timeout=300
        )
        discovery_tasks.append(task)

    discovery_results = await parallel_execute(discovery_tasks)

    # Error handling for discovery failures
    for result in discovery_results:
        if result.status == "failed":
            log_error(f"Discovery failed for {result.server}")
            discovery_results.remove(result)  # Skip to next phase

    # PHASE 2: SKILL GENERATION (Sequential per server)
    generation_results = []
    for discovery_json in discovery_results:
        result = Task(
            subagent_type="skill-generator-agent",
            input={"discoveryJson": discovery_json},
            timeout=120
        )
        generation_results.append(await execute(result))
        update_global_index(discovery_json)

    # PHASE 3: VALIDATION (Parallel)
    validation_tasks = []
    for i, generation_result in enumerate(generation_results):
        task = Task(
            subagent_type="skill-validator-agent",
            input={
                "serverName": discovery_results[i].server,
                "discoveryJson": discovery_results[i]
            },
            timeout=60
        )
        validation_tasks.append(task)

    validation_results = await parallel_execute(validation_tasks)

    # PHASE 4: REPORTING
    report = generate_report(
        discovery_results,
        generation_results,
        validation_results
    )

    return report
```

---

## 4. Integração com Claude Code

### 4.1 Agent Registration

```yaml
# .claude/agents/mcp-skill-mapper.md

---
name: "mcp-skill-mapper"
type: "orchestration"
model: "sonnet"
tools: [web_search, web_fetch, bash, file_creation]
---

# MCP Skill Mapper Agent

## Purpose
Automatically discover, document, and validate MCP servers into token-optimized skill files.

## Input Modes

### Single Server
```
User: "Map the GitHub MCP server"
```

### Batch Processing
```
User: "Map these MCP servers: github, slack, postgres"
```

### From URL
```
User: "Map this MCP server: https://github.com/modelcontextprotocol/servers/tree/main/src/github"
```

## Expected Output
- Updated `.claude/skills/mcp-servers/` structure
- Global INDEX.md updated
- Validation report
- Completion summary

## Success Criteria
- 99%+ discovery accuracy
- <200 tokens per tool file
- 100% documentation completeness
- <10 minutes per server (batch)
```

### 4.2 Task Integration

```typescript
// Usage example in Claude Code

Task({
  subagent_type: "mcp-skill-mapper",
  model: "sonnet",
  description: "Map GitHub and Slack MCP servers",
  prompt: `
    Map these MCP servers to skills documentation:
    1. @modelcontextprotocol/server-github
    2. @modelcontextprotocol/server-slack

    For each server:
    1. Discover all tools and parameters
    2. Generate token-optimized documentation
    3. Validate completeness
    4. Store in .claude/skills/mcp-servers/

    Return completion report with:
    - Tools documented per server
    - Validation status
    - Files created
    - Recommendations for next batch
  `
})
```

---

## 5. Métricas & Monitoramento

### Key Metrics

| Métrica | Target | Alerta |
|---------|--------|--------|
| Discovery accuracy | 99%+ | <95% |
| Tokens per tool | <200 | >250 |
| Documentation completeness | 100% | <95% |
| Validation pass rate | 100% | <95% |
| Time per server | <10 min | >15 min |
| Execution test pass | 100% | <90% |

### Monitoring Checklist

```
Antes de cada batch:
- [ ] Todos agentes testados com sample input
- [ ] Token counting calibrado
- [ ] Discovery sources (GitHub, NPM) acessíveis
- [ ] Disk space suficiente
- [ ] Network connectivity OK

Depois de cada batch:
- [ ] Relatório de validação revisado
- [ ] Warnings resolvidos
- [ ] Files salvos corretamente
- [ ] Global INDEX atualizado
- [ ] Links validados
```

---

## 6. Error Handling & Recovery

### Error Scenarios

```
DISCOVERY ERRORS:
- Server not found (404 on GitHub/NPM)
  → Retry with web search
  → Fallback: Manual documentation request

- Documentation incomplete
  → Flag as "partial" (70-90% completeness)
  → Add note in INDEX.md
  → Continue to generation with warnings

- Environment variables unclear
  → Document all discovered
  → Add note: "Additional env vars may be required"

GENERATION ERRORS:
- Token budget exceeded
  → Suggest truncation points
  → Reduce example verbosity
  → Remove optional parameter descriptions

VALIDATION ERRORS:
- Execution test fails
  → Log error details
  → Mark validation as "PASS_WITH_WARNINGS"
  → Add remediation suggestion
```

### Retry Logic

```python
MAX_RETRIES = 3
BACKOFF_FACTOR = 2  # seconds

for attempt in range(MAX_RETRIES):
    try:
        result = agent.execute()
        return result
    except TemporaryError as e:
        if attempt < MAX_RETRIES - 1:
            sleep_time = BACKOFF_FACTOR ** attempt
            sleep(sleep_time)
        else:
            log_error(f"Max retries exceeded: {e}")
            return {"status": "failed", "error": str(e)}
```

---

## 7. Roadmap de Implementação

### Week 1-2: Phase 1 (Validation)
- [ ] Setup prototyping environment
- [ ] Manually map 1 server (Postgres)
- [ ] Validate progressive discovery workflow
- [ ] Measure token savings
- [ ] Decision: Go/No-go for Phase 2

### Week 3-6: Phase 2 (Agents)
- [ ] Implement & test Discovery Agent
- [ ] Implement & test Generator Agent
- [ ] Implement & test Validator Agent
- [ ] Implement & test Orchestrator Agent
- [ ] Integration testing

### Week 7-9: Phase 3 (Batch)
- [ ] Execute batch mapping (15+ servers)
- [ ] Validate quality
- [ ] Refine agents based on feedback

### Week 10: Phase 4 (Integration)
- [ ] Documentation finalized
- [ ] Team training
- [ ] Knowledge base established

---

## 8. Success Criteria

### Phase 1 Success
- ✅ 1 server mapped manually < 3 hours
- ✅ Progressive discovery workflow functional
- ✅ 95%+ token savings demonstrated
- ✅ No blocking technical issues

### Phase 2 Success
- ✅ 4 agents implemented and tested
- ✅ 99%+ discovery accuracy
- ✅ <200 tokens per tool file
- ✅ 100% validation pass rate

### Phase 3 Success
- ✅ 15+ servers mapped
- ✅ 150+ tools documented
- ✅ <10 min per server average
- ✅ 90%+ documentation quality

### Phase 4 Success
- ✅ System fully integrated
- ✅ Team trained and confident
- ✅ Documentation complete
- ✅ Positive feedback from users

---

**Especificação preparada por**: Technical Team
**Data**: 14 de novembro de 2025
**Status**: Ready for Implementation
