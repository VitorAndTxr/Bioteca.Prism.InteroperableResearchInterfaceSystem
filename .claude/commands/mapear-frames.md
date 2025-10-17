# Prompt Organizacional: Mapeamento de Frames Figma - Projeto IRIS (PRISM)

## Contexto do Projeto

Você está auxiliando no desenvolvimento do **IRIS** (Interface de Pesquisa Interoperável Segura), a implementação prática do **PRISM - Padrão de Rótulos e Interfaces para Sistemas Médicos**. O PRISM é um trabalho de conclusão de curso (TCC) de Engenharia de Computação da UTFPR que propõe uma solução para fragmentação e falta de interoperabilidade em dados biomédicos.

### Componentes do PRISM

- **NPI (Nó de Pesquisa Integrada)**: Sistema backend que gerencia autenticação, armazenamento, validação e acesso aos dados biomédicos. Atua como middleware/orquestrador da rede.
- **IRIS**: Interface frontend responsável pela gestão de acessos, gestão de pacientes e visualização de dados de pesquisa biomédica.
- **Redução Conceitual**: O PRISM agrupa componentes em dois elementos básicos:
  - **Dispositivo** (losangos): Sistemas embarcados de captura de biossinais
  - **Aplicação** (círculos): Sistemas que adicionam contexto e processamento

### Arquitetura do Sistema

```
Bioteca.Prism.InteroperableResearchNode/  (Backend - ASP.NET Core)
├── Controllers/
│   └── Node/
├── Services/
│   └── Node/
├── Models/
│   └── Node/
└── ...

IRIS/  (Frontend - React/Next.js)
├── components/
├── pages/
├── styles/
└── ...
```

## Sua Missão

Automatizar o processo completo de **documentação, mapeamento e especificação** de interfaces do Figma para desenvolvimento do frontend IRIS, utilizando:

1. **MCP Playwright**: Navegação automatizada, identificação de frames e captura de screenshots
2. **MCP Figma**: Extração de metadata, estrutura de componentes e código UI

## Objetivos

1. **Mapear sistematicamente** todos os frames de uma página Figma do projeto IRIS
2. **Capturar screenshots** de alta qualidade de cada frame identificado
3. **Documentar estruturadamente** em arquivos Markdown seguindo padrões acadêmicos
4. **Extrair links de seleção** (fileKey + nodeId) para posterior recuperação via MCP Figma
5. **Preparar especificações técnicas** completas para implementação frontend

## Ferramentas Disponíveis

### MCP Playwright
- **Navegação web automatizada**: Abrir URLs, interagir com elementos DOM
- **Identificação de frames**: Mapear estrutura do canvas Figma
- **Captura de screenshots**: Imagens de alta qualidade de elementos específicos
- **Extração de dados**: Nomes, dimensões, posições e node-ids de frames

### MCP Figma
- **`Figma:get_metadata`**: Obtém estrutura hierárquica em XML (node IDs, tipos, nomes, posições)
- **`Figma:get_screenshot`**: Gera screenshot oficial de um node específico
- **`Figma:get_design_context`**: Recupera código UI e URLs de assets
- **Parsing de URLs**: Extração automática de fileKey e nodeId

## Estrutura de Diretórios do IRIS

Com base na documentação do projeto, recomendo a seguinte estrutura:

```
docs/
├── architecture/              # Arquitetura e decisões técnicas
│   ├── node-communication.md
│   ├── handshake-protocol.md
│   └── session-management.md
├── development/              # Guias de desenvolvimento
│   ├── ai-assisted-development.md
│   └── implementation-roadmap.md
└── figma/                    # 🆕 Documentação de UI (sua criação)
    ├── frames-map.md         # Índice geral de frames
    ├── screens/              # Screenshots dos frames
    │   ├── frame-001.png
    │   ├── frame-002.png
    │   └── ...
    └── specs/                # Especificações detalhadas
        ├── frame-001-spec.md
        ├── frame-002-spec.md
        └── ...
```

**Localização recomendada**: `docs/figma/` dentro do projeto principal.

## Workflow de Execução

### Fase 1: Descoberta e Mapeamento (Playwright)

**Entrada**: URL do Figma (ex: `https://figma.com/design/{fileKey}/{fileName}?node-id=0:1`)

**Processo**:
1. **Validar URL**: Extrair `fileKey` do formato padrão Figma, caso seja muito grande, acesse pelo Playwright MCP diretamente na página do figma
2. **Navegar com Playwright**: Abrir página (assumir autenticação prévia)
3. **Identificar frames top-level**: Varrer o canvas e localizar todos os frames principais
4. **Extrair metadados** de cada frame:
   - Nome do frame
   - Dimensões (largura x altura)
   - Posição (x, y)
   - `node-id` obtido da URL quando frame está selecionado
5. **Capturar screenshots**:
   - Selecionar frame programaticamente
   - Tirar screenshot em alta resolução (2x para Retina)
   - Salvar como `docs/figma/screens/frame-{id:03d}.png`

**Saída**: Conjunto de screenshots + dados estruturados de cada frame

---

### Fase 2: Documentação Estruturada

#### 2.1 Gerar `frames-map.md`

Criar índice geral seguindo o template:

```markdown
# Mapa de Frames - IRIS (PRISM)

Documentação automática dos frames do Figma para o projeto IRIS - Interface de Pesquisa Interoperável Segura.

**Arquivo Figma**: [IRIS UI Design](URL_completa)  
**Data de Mapeamento**: 2025-10-17 15:30  
**Total de Frames**: 12  
**Status Geral**: 🔴 0% implementado

---

## Índice de Frames

| ID  | Nome do Frame          | Dimensões  | Módulo NPI | Status          | Especificação                    |
|-----|------------------------|------------|------------|-----------------|----------------------------------|
| 001 | Login Screen           | 1440x900   | Auth       | 🔴 Não iniciado | [Ver spec](specs/frame-001-spec.md) |
| 002 | Dashboard Principal    | 1920x1080  | Dashboard  | 🔴 Não iniciado | [Ver spec](specs/frame-002-spec.md) |
| 003 | Cadastro de Pacientes  | 1920x1080  | Patients   | 🔴 Não iniciado | [Ver spec](specs/frame-003-spec.md) |
| 004 | Gestão de Acessos      | 1920x1080  | Auth       | 🔴 Não iniciado | [Ver spec](specs/frame-004-spec.md) |

---

## Frames Detalhados

### Frame 001: Login Screen

![Screenshot](screens/frame-001.png)

**URL Figma**: `https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId}`  
**Módulo PRISM**: Autenticação e Identificação (NPI)  
**Tipo**: Tela de entrada do sistema  
**Prioridade**: 🔴 Alta  
**Tags**: `#auth`, `#login`, `#segurança`, `#NPI`

**Descrição**:  
Interface de autenticação para acesso ao IRIS. Implementa os requisitos de segurança definidos no PRISM para identificação de usuários (pesquisadores, profissionais de saúde) que acessarão o NPI.

---

### Frame 002: Dashboard Principal

![Screenshot](screens/frame-002.png)

**URL Figma**: `https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId}`  
**Módulo PRISM**: Visualização de Dados (Aplicação)  
**Tipo**: Tela principal de visualização  
**Prioridade**: 🔴 Alta  
**Tags**: `#dashboard`, `#overview`, `#biossinais`, `#visualização`

**Descrição**:  
Painel principal do IRIS que apresenta visão geral dos projetos de pesquisa, dados de biossinais capturados e status das integrações com dispositivos.

---

[... continuar para todos os frames ...]
```

#### 2.2 Gerar Especificações Individuais (`frame-{id}-spec.md`)

Para cada frame, criar arquivo detalhado:

```markdown
# Especificação Técnica: [Nome do Frame]

## Informações Básicas

- **ID Frame**: 001
- **Nome**: Login Screen
- **URL Figma**: [Link direto](https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId})
- **Screenshot**: [../screens/frame-001.png](../screens/frame-001.png)
- **Dimensões**: 1440x900px
- **Status**: 🔴 Não iniciado (0%)
- **Prioridade**: Alta
- **Responsável**: A definir

---

## Contexto PRISM

### Módulo do Sistema
Esta interface faz parte do **módulo de Autenticação, Identificação e Liberação** do NPI, conforme documentado no TCC (Capítulo 4, Seção 4.2).

### Função no Ecossistema
O login é o ponto de entrada para pesquisadores e profissionais de saúde acessarem o IRIS. Esta tela implementa:
- Autenticação de usuários do NPI
- Controle de acesso baseado em perfis (pesquisador, médico, admin)
- Integração com o protocolo de handshake entre nós

### Padrões PRISM Aplicáveis
- ✅ Interface padronizada para aplicações PRISM
- ✅ Comunicação segura com NPI backend
- ✅ Registro de auditoria de acessos

---

## Elementos a Extrair

<!-- Esta seção será preenchida automaticamente na Fase 3 com dados do MCP Figma -->

### Estrutura de Componentes
*Aguardando extração via `Figma:get_metadata`*

### Código de Referência
*Aguardando extração via `Figma:get_design_context`*

### Assets Necessários
*URLs de download serão gerados automaticamente*

---

## Requisitos Técnicos

### Frontend
- [ ] **Framework**: React 18+ com Next.js
- [ ] **Estilização**: Tailwind CSS (apenas classes core)
- [ ] **Formulário**: React Hook Form + Zod validation
- [ ] **Estado**: Context API ou Zustand
- [ ] **HTTP Client**: Axios com interceptors

### Responsividade
- [ ] Desktop (≥1440px)
- [ ] Tablet (768px - 1439px)
- [ ] Mobile (320px - 767px)

### Acessibilidade
- [ ] WCAG 2.1 nível AA
- [ ] Navegação por teclado
- [ ] Labels ARIA apropriados
- [ ] Contraste de cores adequado

### Integração Backend
- [ ] Endpoint: `POST /api/v1/auth/login`
- [ ] Autenticação JWT
- [ ] Refresh token automático
- [ ] Tratamento de erros 401/403

### Segurança
- [ ] Sanitização de inputs
- [ ] Proteção contra CSRF
- [ ] Rate limiting (client-side awareness)
- [ ] Armazenamento seguro de tokens (httpOnly cookies)

---

## Requisitos Funcionais

### RF001: Autenticação de Usuário
**Descrição**: O sistema deve permitir que usuários cadastrados façam login utilizando email e senha.

**Critérios de Aceitação**:
- [ ] Validação de formato de email
- [ ] Senha com mínimo 8 caracteres
- [ ] Feedback visual de loading durante autenticação
- [ ] Mensagens de erro claras e específicas
- [ ] Redirecionamento ao dashboard após sucesso

### RF002: Recuperação de Senha
**Descrição**: O sistema deve fornecer link para recuperação de senha.

**Critérios de Aceitação**:
- [ ] Link "Esqueci minha senha" visível
- [ ] Redirecionamento para fluxo de recuperação

### RF003: Persistência de Sessão
**Descrição**: O sistema deve lembrar usuários que optarem por "Manter conectado".

**Critérios de Aceitação**:
- [ ] Checkbox "Manter conectado" funcional
- [ ] Token persistido com expiração adequada

---

## Fluxo de Usuário

```
[Usuário acessa IRIS]
      ↓
[Tela de Login carrega]
      ↓
[Usuário insere email e senha]
      ↓
[Clica em "Entrar"]
      ↓
[Sistema valida no NPI backend]
      ↓
    ┌─────────────────┐
    │                 │
[✅ Sucesso]    [❌ Erro]
    │                 │
    ↓                 ↓
[Dashboard]   [Mensagem de erro]
                      │
                      ↓
              [Usuário corrige]
```

---

## Casos de Teste

### CT001: Login com credenciais válidas
**Pré-condições**: Usuário cadastrado no sistema  
**Passos**:
1. Acessar tela de login
2. Inserir email válido
3. Inserir senha correta
4. Clicar em "Entrar"

**Resultado esperado**: Redirecionamento para dashboard principal

---

### CT002: Login com senha incorreta
**Pré-condições**: Usuário cadastrado no sistema  
**Passos**:
1. Acessar tela de login
2. Inserir email válido
3. Inserir senha incorreta
4. Clicar em "Entrar"

**Resultado esperado**: Mensagem "Email ou senha incorretos" sem especificar qual campo está errado (segurança)

---

## Notas de Implementação

### Considerações de UX
- Foco automático no campo de email ao carregar
- Enter no campo de senha submete o formulário
- Feedback visual de força de senha (se aplicável no design)

### Considerações de Performance
- Debounce em validações assíncronas (ex: verificar se email existe)
- Lazy loading de componentes pesados
- Prefetch de rotas do dashboard

### Integrações
- Verificar disponibilidade do endpoint `/api/v1/auth/login` no NPI
- Confirmar estrutura do payload JWT
- Validar formato de mensagens de erro do backend

---

## Histórico de Alterações

| Data       | Autor         | Descrição                              |
|------------|---------------|----------------------------------------|
| 2025-10-17 | Claude (auto) | Frame mapeado automaticamente          |
| -          | -             | Aguardando revisão manual              |

---

## Próximos Passos

- [ ] Revisar especificação com orientador do TCC
- [ ] Extrair componentes Figma (Fase 3)
- [ ] Implementar componente React
- [ ] Integrar com backend NPI
- [ ] Realizar testes de usabilidade
- [ ] Documentar no TCC (Capítulo 4, Seção "Apresentação do Sistema")

---

## Referências PRISM

- TCC PRISM, Capítulo 4, Seção 4.2: "Nó de Pesquisa Interoperável"
- `docs/architecture/node-communication.md`: Protocolo de comunicação
- `docs/architecture/handshake-protocol.md`: Autenticação entre nós
- Normas ABNT para documentação de interfaces
```

---

### Fase 3: Extração de Design (MCP Figma)

**Entrada**: `frames-map.md` preenchido com fileKeys e nodeIds

**Processo**:
1. **Para cada frame documentado**:
   - Ler `fileKey` e `nodeId` do `frames-map.md`
   - Chamar `Figma:get_metadata` para obter estrutura hierárquica XML
   - Chamar `Figma:get_design_context` para código UI e assets
   
2. **Atualizar especificações**:
   - Preencher seção "Elementos a Extrair" em cada `frame-{id}-spec.md`
   - Adicionar:
     - Hierarquia de componentes identificados
     - Código de referência (HTML/React)
     - Lista de assets com URLs de download
     - Tokens de design (cores, tipografia, espaçamentos)

3. **Validar cobertura**:
   - Verificar que todos os frames têm metadata completa
   - Identificar frames problemáticos (sem nodeId, erros de extração)
   - Gerar relatório de cobertura

**Saída**: Especificações completas prontas para implementação

---

## Formato de Comando

### Comando Principal

```bash
/mapear-frames <URL_FIGMA> [opções]
```

### Parâmetros

- `<URL_FIGMA>`: URL completa da página Figma (obrigatório)
- `--update-existing`: Atualiza mapeamento existente sem sobrescrever
- `--extract-design`: Executa Fase 3 automaticamente após mapeamento
- `--filter-pattern <regex>`: Filtra frames por padrão de nome
- `--output-dir <path>`: Diretório customizado (padrão: `docs/figma/`)

### Exemplos de Uso

```bash
# Mapeamento inicial completo com extração de design
/mapear-frames https://figma.com/design/abc123/IRIS-UI?node-id=0:1 --extract-design

# Atualizar apenas novos frames sem sobrescrever existentes
/mapear-frames https://figma.com/design/abc123/IRIS-UI --update-existing

# Mapear apenas frames de autenticação
/mapear-frames https://figma.com/design/abc123/IRIS-UI --filter-pattern "^(Login|Auth|Signup)"

# Mapear para diretório customizado
/mapear-frames https://figma.com/design/abc123/IRIS-UI --output-dir custom/path/figma
```

---

## Saída Esperada

### Logs Durante Execução

```
🎨 IRIS Frame Mapper - PRISM Project
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Iniciando mapeamento de frames...
📄 Arquivo Figma: IRIS UI Design
🆔 File Key: abc123
🌐 URL: https://figma.com/design/abc123/IRIS-UI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 1: Descoberta e Mapeamento
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Abrindo página com Playwright...
✓ Página carregada com sucesso (2.3s)

📊 Descobrindo frames no canvas...
  ✓ Frame 001: Login Screen (1440x900)
  ✓ Frame 002: Dashboard Principal (1920x1080)
  ✓ Frame 003: Cadastro de Pacientes (1920x1080)
  ✓ Frame 004: Gestão de Acessos (1920x1080)
  ✓ Frame 005: Visualização de Biossinais (1920x1200)
  ✓ Frame 006: Relatórios (1920x1080)
  ...
  
📊 Total descoberto: 12 frames

📸 Capturando screenshots (resolução 2x)...
  ✓ frame-001.png salvo (234 KB)
  ✓ frame-002.png salvo (456 KB)
  ✓ frame-003.png salvo (389 KB)
  ...
  
📸 12/12 screenshots capturados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 2: Documentação Estruturada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Gerando frames-map.md...
✓ Índice geral criado (docs/figma/frames-map.md)

📝 Gerando especificações individuais...
  ✓ frame-001-spec.md criado
  ✓ frame-002-spec.md criado
  ✓ frame-003-spec.md criado
  ...
  
📝 12/12 especificações geradas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 3: Extração de Design (MCP Figma)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 Extraindo metadata e código UI...
  ✓ Frame 001: Metadata extraído (45 componentes)
  ✓ Frame 001: Código React gerado (15 KB)
  ✓ Frame 001: 8 assets identificados
  
  ✓ Frame 002: Metadata extraído (89 componentes)
  ✓ Frame 002: Código React gerado (32 KB)
  ✓ Frame 002: 12 assets identificados
  ...

🎨 12/12 frames processados pelo MCP Figma

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Mapeamento Concluído!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 ESTATÍSTICAS FINAIS
  • Total de frames: 12
  • Screenshots: 12
  • Especificações: 12
  • Design extraído: 12
  • Componentes identificados: 587
  • Assets de imagem: 95
  • Warnings: 0
  • Erros: 0

📂 ARQUIVOS GERADOS
  • Índice: docs/figma/frames-map.md
  • Screenshots: docs/figma/screens/ (12 arquivos, 4.2 MB)
  • Especificações: docs/figma/specs/ (12 arquivos)

📋 PRÓXIMOS PASSOS
  1. Revisar especificações em docs/figma/specs/
  2. Priorizar frames para desenvolvimento
  3. Atualizar status em frames-map.md conforme progresso
  4. Iniciar implementação React dos componentes
  5. Documentar no TCC (Cap. 4, Seção "Apresentação do Sistema")

💡 COMANDOS ÚTEIS
  # Ver mapa geral
  cat docs/figma/frames-map.md
  
  # Ver especificação de um frame
  cat docs/figma/specs/frame-001-spec.md
  
  # Verificar status do projeto
  /status-frames

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tempo total: 45.8 segundos
```

### Relatório Final (`docs/figma/mapping-report.md`)

```markdown
# Relatório de Mapeamento - IRIS UI

**Projeto**: PRISM - Padrão de Rótulos e Interfaces para Sistemas Médicos  
**Componente**: IRIS (Interface de Pesquisa Interoperável Segura)  
**Data**: 2025-10-17 16:45  
**Operador**: Claude CLI (automatizado)  
**Arquivo Figma**: [IRIS UI Design](https://figma.com/design/abc123/IRIS-UI)

---

## Resumo Executivo

Mapeamento automatizado completo de 12 frames da interface IRIS, gerando documentação estruturada conforme padrões do TCC e normas ABNT. Todos os frames foram identificados, capturados e especificados com sucesso, prontos para implementação frontend.

---

## Estatísticas

### Cobertura
- ✅ **Frames mapeados**: 12 de 12 (100%)
- ✅ **Screenshots capturados**: 12 de 12 (100%)
- ✅ **Especificações geradas**: 12 de 12 (100%)
- ✅ **Design extraído**: 12 de 12 (100%)

### Componentes Identificados
- **Total de componentes UI**: 587
- **Botões**: 123
- **Inputs/Forms**: 89
- **Cards/Containers**: 145
- **Ícones**: 78
- **Tabelas**: 34
- **Gráficos**: 18
- **Outros**: 100

### Assets
- **Total de imagens**: 95
- **Ícones SVG**: 67
- **Fotos/Ilustrações**: 28
- **Tamanho total**: 12.4 MB

### Tempo de Execução
- **Fase 1 (Mapeamento)**: 12.3s
- **Fase 2 (Documentação)**: 8.7s
- **Fase 3 (Extração)**: 24.8s
- **Total**: 45.8s

---

## Distribuição por Módulo NPI

| Módulo                        | Frames | Prioridade |
|-------------------------------|--------|------------|
| Autenticação e Identificação  | 2      | Alta       |
| Dashboard/Visualização        | 3      | Alta       |
| Gestão de Pacientes           | 2      | Média      |
| Gestão de Acessos             | 1      | Média      |
| Biossinais/Captura            | 2      | Alta       |
| Relatórios                    | 2      | Baixa      |

---

## Status de Implementação

| Status          | Quantidade | Frames                     |
|-----------------|------------|----------------------------|
| 🔴 Não iniciado | 12         | Todos                      |
| 🟡 Em progresso | 0          | -                          |
| 🟢 Completo     | 0          | -                          |

---

## Warnings e Observações

Nenhum warning ou erro detectado durante o processo de mapeamento.

---

## Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)
1. **Revisão acadêmica**: Validar especificações com orientador do TCC
2. **Priorização**: Definir ordem de implementação dos frames
3. **Setup técnico**: Configurar ambiente React/Next.js do IRIS
4. **Design system**: Extrair tokens de design (cores, tipografia, grid)

### Médio Prazo (3-6 semanas)
5. **Implementação Fase 1**: Frames de alta prioridade (Login, Dashboard)
6. **Integração backend**: Conectar com endpoints do NPI
7. **Testes de usabilidade**: Validar fluxos com usuários piloto
8. **Documentação TCC**: Atualizar Capítulo 4 com telas implementadas

### Longo Prazo (7+ semanas)
9. **Implementação Fase 2**: Frames restantes
10. **Coleta de dados**: Realizar experimentos com sistema completo
11. **Análise de resultados**: Validar hipóteses do TCC
12. **Defesa**: Apresentar sistema funcional na banca

---

## Comandos de Manutenção

```bash
# Verificar status atual do mapeamento
/status-frames

# Atualizar apenas frames modificados no Figma
/mapear-frames <URL> --update-existing --only-modified

# Regenerar specs mantendo anotações manuais
/mapear-frames <URL> --preserve-notes

# Validar consistência da documentação
/validar-frames

# Gerar relatório de progresso de implementação
/progress-report
```

---

## Estrutura de Arquivos Gerada

```
docs/figma/
├── frames-map.md                    # Índice geral (12 frames)
├── mapping-report.md                # Este relatório
├── screens/                         # Screenshots (4.2 MB)
│   ├── frame-001.png
│   ├── frame-002.png
│   └── ...
└── specs/                           # Especificações detalhadas
    ├── frame-001-spec.md
    ├── frame-002-spec.md
    └── ...
```

---

## Integração com TCC

### Referências no Documento
- **Capítulo 4, Seção 4.3**: Detalhar arquitetura do IRIS usando estes frames
- **Capítulo 4, Seção "Apresentação do Sistema"**: Incluir screenshots como figuras
- **Capítulo 5, Experimentos**: Usar sistema implementado para coleta

### Formato de Citação ABNT
```latex
\begin{figure}[htpb]
\captionsetup{width=0.9\textwidth}
\caption{Tela de login do sistema IRIS.}
\label{fig:iris-login}
\includegraphics[width=0.9\textwidth]{figuras/iris/frame-001.png}
\fonte{Autoria própria (2025)}
\end{figure}
```

---

## Observações Finais

- ✅ Mapeamento 100% completo e validado
- ✅ Documentação estruturada seguindo padrões acadêmicos
- ✅ Pronto para revisão e implementação
- ⚠️ Revisar prioridades com orientador antes de iniciar código
- 💡 Considerar criar design system componentizado (Storybook)

---

**Gerado automaticamente por**: Claude CLI - IRIS Frame Mapper  
**Versão**: 1.0.0  
**Contato**: [Inserir contato do desenvolvedor]
```

---

## Tratamento de Erros

### Cenários Comuns

#### 1. URL Figma Inválida
```
❌ ERRO: URL Figma inválida

A URL fornecida não corresponde ao formato esperado do Figma.

Formato esperado:
https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId}

Exemplo válido:
https://figma.com/design/abc123/IRIS-UI?node-id=0:1

Por favor, verifique a URL e tente novamente.
```

#### 2. Autenticação Necessária
```
⚠️ AVISO: Autenticação necessária

Não foi possível acessar a página do Figma.
Você precisa estar logado no Figma no seu navegador.

Passos:
1. Abra https://figma.com no seu navegador
2. Faça login com sua conta
3. Execute o comando novamente

O Playwright usará a sessão ativa do seu navegador.
```

#### 3. Frame Sem Node-ID
```
⚠️ Frame 007 "Settings Panel" não possui node-id detectável
   → Documentado sem link direto ao Figma
   → Screenshot capturado normalmente
   → Marcado para revisão manual

   Possíveis causas:
   - Frame está em componente aninhado
   - Problema de seleção no Playwright
   - Frame não é um top-level frame

   Solução: Selecione manualmente no Figma e use:
   /add-frame-manual <fileKey> <nodeId> "Nome do Frame"
```

#### 4. Timeout Playwright
```
❌ Erro ao capturar screenshot do Frame 012 "Report Dashboard"
   → Timeout após 30 segundos
   → Tentando novamente com timeout estendido (60s)...
   
   ⏳ Aguarde...
   
   ✓ Sucesso na segunda tentativa (43.2s)
```

#### 5. MCP Figma Indisponível
```
⚠️ MCP Figma temporariamente indisponível

   Fase 1 (Mapeamento) e Fase 2 (Documentação): ✅ Concluídas
   Fase 3 (Extração de design): ⏸️ Pendente

   Frames documentados: 12
   Screenshots capturados: 12
   Especificações geradas: 12
   Design extraído: 0 (pendente)

   Você pode:
   1. Executar Fase 3 manualmente depois: /extrair-design
   2. Prosseguir com implementação usando screenshots
   3. Aguardar reconexão do MCP Figma

   Para tentar novamente a Fase 3:
   /mapear-frames <URL> --only-extract-design
```

---

## Integração com Workflow PRISM

### Contexto Acadêmico

Este mapeamento de frames **não é apenas documentação técnica**, mas parte fundamental do TCC:

1. **Rastreabilidade**: Cada interface IRIS implementa requisitos do PRISM
2. **Metodologia**: Processo documentado para seção de Metodologia
3. **Resultados**: Screenshots e specs para Capítulo de Resultados
4. **Validação**: Sistema implementado permite experimentos práticos

### Metadados PRISM nas Specs

Cada especificação inclui contexto do sistema maior:

```markdown
## Contexto PRISM

### Módulo do NPI
Esta interface implementa funcionalidades do módulo de [X] do Nó de Pesquisa Integrada.

### Padrão de Interface PRISM
- ✅ Aplicação (círculo): Sistema de contexto e processamento
- ❌ Dispositivo (losango): Não aplicável

### Tipo de Dado Manipulado
- [ ] Biossinais (sEMG, ECG, etc.)
- [ ] Metadados de pacientes
- [ ] Registros de acesso
- [ ] Dados de auditoria

### Interoperabilidade
- **Comunica-se com**: NPI backend via REST API
- **Protocolo**: HTTPS + JWT authentication
- **Formato de dados**: JSON conforme PRISM Data Schema
- **Outros nós**: Não se comunica diretamente (via NPI)
```

---

## Manutenção e Atualização

### Comandos de Manutenção

```bash
# Verificar status atual de implementação
/status-frames
# Output: Mostra progresso de cada frame (🔴🟡🟢)

# Atualizar apenas frames modificados no Figma
/mapear-frames <URL> --update-existing --only-modified
# Compara timestamps e atualiza apenas o que mudou

# Adicionar frame manualmente (se Playwright falhou)
/add-frame-manual <fileKey> <nodeId> "Nome do Frame" [dimensões]

# Regenerar specs mantendo anotações manuais
/mapear-frames <URL> --preserve-notes
# Preserva seções "Notas de Implementação" customizadas

# Validar consistência da documentação
/validar-frames
# Verifica: links quebrados, screenshots faltantes, specs incompletas

# Gerar relatório de progresso
/progress-report
# Output: Markdown com % de implementação, próximos passos, blockers
```

---

## Considerações Técnicas

### Performance

- **Capturas paralelas**: Máximo 3 screenshots simultâneos para evitar sobrecarga
- **Cache de metadata**: Armazenar resultados do MCP Figma localmente (1h TTL)
- **Compressão de imagens**: PNG otimizado (pngquant) mantendo qualidade visual
- **Retry strategy**: 3 tentativas com backoff exponencial (1s, 2s, 4s)

### Qualidade

- **Screenshots**: Resolução 2x (Retina), formato PNG-24, max 500KB por arquivo
- **Validação de captures**: Verificar dimensões mínimas (não vazio/cortado)
- **Node-IDs únicos**: Validar que cada nodeId aparece apenas uma vez
- **Nomenclatura**: `frame-{id:03d}` para ordenação natural (001, 002, ..., 099)

### Extensibilidade

- **Suporte a variantes**: Estrutura preparada para dark mode, mobile, states
- **Metadata customizada**: Campos extras podem ser adicionados às specs
- **Formato Markdown**: Facilita versionamento Git e colaboração
- **Export formats**: Possibilidade futura de gerar PDF, Confluence, Notion

---

## Considerações de Segurança

- **Credenciais Figma**: Nunca logar ou armazenar credenciais no código
- **URLs públicas**: Avisar se o arquivo Figma for público (possível leak de design)
- **Screenshots**: Verificar se capturas não contêm dados sensíveis (LGPD)
- **Audit log**: Registrar todas as operações de mapeamento com timestamp

---

## Prompt de Inicialização para Claude CLI

Quando o usuário executar o comando `/mapear-frames`, você deve responder com:

```
🎨 IRIS Frame Mapper (PRISM Project)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sistema de mapeamento automatizado de interfaces Figma para o projeto IRIS.

Este processo irá:
✓ Mapear todos os frames da página Figma
✓ Capturar screenshots em alta resolução
✓ Gerar documentação estruturada (ABNT)
✓ Extrair componentes e código UI via MCP Figma

Por favor, forneça a URL completa da página Figma do projeto IRIS.

Formato esperado:
https://figma.com/design/{fileKey}/{fileName}?node-id={nodeId}

Cole a URL abaixo:
```

Após receber a URL, valide o formato e inicie o processo automatizado das 3 fases.

---

## Observação Final

Este prompt está otimizado para **Claude Code Desktop** com os seguintes MCPs:

- ✅ **Playwright MCP**: Para navegação e captura de screenshots
- ✅ **Figma MCP**: Para extração de design context e metadata

**Instalação dos MCPs**: Certifique-se de que ambos estão instalados e configurados corretamente antes de executar o comando.

**Localização recomendada deste arquivo**: `docs/prompts/figma-frame-mapper.md` ou na raiz do projeto IRIS como `FIGMA_MAPPER_PROMPT.md`.

---

**Versão**: 1.0.0  
**Última atualização**: 2025-10-17  
**Compatível com**: Claude CLI v1.0+, Playwright MCP v1.0+, Figma MCP v1.0+  
**Projeto**: PRISM - Padrão de Rótulos e Interfaces para Sistemas Médicos  
**Instituição**: UTFPR - Universidade Tecnológica Federal do Paraná  
**Autoria**: Gerado para TCC de Engenharia de Computação
