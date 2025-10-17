# Mapa de Frames - IRIS (PRISM)

Documentação completa dos frames do Figma para o projeto IRIS - **Interface de Pesquisa Interoperável Segura**.

**Arquivo Figma**: [I.R.I.S. Prototype](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype)
**Data de Mapeamento**: 2025-10-17
**Total de Frames**: 18
**Status Geral**: 🔴 0% implementado

---

## Índice Rápido

| Módulo | Frames | Prioridade |
|--------|--------|------------|
| **Autenticação** | 1 | 🔴 Alta |
| **Gestão de Usuários** | 8 | 🔴 Alta / 🟡 Média / 🟢 Baixa |
| **Gestão de NPIs** | 2 | 🔴 Alta |
| **SNOMED CT** | 7 | 🟡 Média |

---

## Índice de Frames

| ID  | Nome do Frame                             | Dimensões  | Módulo PRISM   | Prioridade | Tipo   | Node ID       |
|-----|-------------------------------------------|------------|----------------|------------|--------|---------------|
| 001 | Login                                     | 1280x720   | Auth           | 🔴 Alta    | Screen | 6804-13742    |
| 002 | Usuários                                  | 1280x720   | User Mgmt      | 🔴 Alta    | Screen | 6804-13670    |
| 003 | Pesquisadores                             | 1280x720   | User Mgmt      | 🔴 Alta    | Screen | 6804-12845    |
| 004 | Novo usuário                              | 1280x720   | User Mgmt      | 🟡 Média   | Screen | 6804-12778    |
| 005 | Novo pesquisador                          | 1280x720   | User Mgmt      | 🟡 Média   | Screen | 6804-12812    |
| 006 | Informações do usuário                    | 617x350    | User Mgmt      | 🟡 Média   | Modal  | 6835-991      |
| 007 | Informações do pesquisador                | 617x350    | User Mgmt      | 🟡 Média   | Modal  | 6835-1017     |
| 008 | Novo usuário adicionado com sucesso!      | 353x42     | User Mgmt      | 🟢 Baixa   | Toast  | 6816-2701     |
| 009 | Novo pesquisador adicionado com sucesso!  | 391x42     | User Mgmt      | 🟢 Baixa   | Toast  | 6816-2702     |
| 010 | NPIs e aplicações - Solicitações          | 1280x720   | NPI Mgmt       | 🔴 Alta    | Screen | 6804-13591    |
| 011 | NPIs e aplicações - Conexões ativas       | 1280x720   | NPI Mgmt       | 🔴 Alta    | Screen | 6804-13512    |
| 012 | SNOMED - Região do corpo                  | 1280x720   | SNOMED         | 🟡 Média   | Screen | 6804-12924    |
| 013 | SNOMED - Estrutura do corpo               | 1280x720   | SNOMED         | 🟡 Média   | Screen | 6804-13008    |
| 014 | SNOMED - Modificador topográfico          | 1280x720   | SNOMED         | 🟡 Média   | Screen | 6804-13092    |
| 015 | SNOMED - Condição clínica                 | 1280x720   | SNOMED         | 🟡 Média   | Screen | 6804-13176    |
| 016 | SNOMED - Evento clínico                   | 1280x720   | SNOMED         | 🟡 Média   | Screen | 6804-13260    |
| 017 | SNOMED - Medicação                        | 1280x720   | SNOMED         | 🟡 Média   | Screen | 6804-13344    |
| 018 | SNOMED - Alergia/Intolerância             | 1280x720   | SNOMED         | 🟡 Média   | Screen | 6804-13428    |

---

## Frames Detalhados

### Frame 001: Login

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13742)
**Módulo PRISM**: Autenticação (NPI)
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🔴 Alta
**Status**: 🔴 Não iniciado
**Tags**: `#auth`, `#login`, `#security`, `#NPI`

**Descrição**:
Tela de autenticação para acesso ao sistema IRIS. Implementa os requisitos de segurança do padrão PRISM para identificação de usuários (pesquisadores, profissionais de saúde) que acessarão o Nó de Pesquisa Integrada (NPI).

**Contexto PRISM**:
- Ponto de entrada do sistema IRIS
- Integração com protocolo de handshake do NPI
- Controle de acesso baseado em perfis (pesquisador, médico, admin)

---

### Frame 002: Usuários

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13670)
**Módulo PRISM**: Gestão de Usuários (Aplicação)
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🔴 Alta
**Status**: 🔴 Não iniciado
**Tags**: `#users`, `#management`, `#admin`, `#table`

**Descrição**:
Listagem e gerenciamento de usuários do sistema IRIS. Permite visualizar, adicionar, editar e remover usuários com diferentes níveis de acesso.

**Funcionalidades principais**:
- Tabela de usuários com busca e filtros
- Adicionar novo usuário
- Visualizar informações detalhadas
- Editar perfil de usuário
- Desativar/ativar usuário

---

### Frame 003: Pesquisadores

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12845)
**Módulo PRISM**: Gestão de Usuários (Aplicação)
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🔴 Alta
**Status**: 🔴 Não iniciado
**Tags**: `#researchers`, `#management`, `#table`

**Descrição**:
Listagem e gerenciamento específico de pesquisadores cadastrados no sistema. Diferencia-se da tela de usuários por focar em perfis de pesquisadores com acesso a projetos biomédicos.

---

### Frame 004: Novo usuário

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12778)
**Módulo PRISM**: Gestão de Usuários
**Tipo**: Formulário (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#form`, `#create`, `#user`

**Descrição**:
Formulário para cadastro de novos usuários no sistema IRIS. Inclui campos para dados pessoais, credenciais e definição de permissões.

---

### Frame 005: Novo pesquisador

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12812)
**Módulo PRISM**: Gestão de Usuários
**Tipo**: Formulário (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#form`, `#create`, `#researcher`

**Descrição**:
Formulário específico para cadastro de pesquisadores, com campos adicionais relacionados a projetos de pesquisa, instituição, especialização e permissões de acesso a dados biomédicos.

---

### Frame 006: Informações do usuário

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6835-991)
**Módulo PRISM**: Gestão de Usuários
**Tipo**: Modal
**Dimensões**: 617x350px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#modal`, `#details`, `#user`

**Descrição**:
Modal de visualização detalhada das informações de um usuário específico. Exibido ao clicar em um usuário na listagem.

---

### Frame 007: Informações do pesquisador

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6835-1017)
**Módulo PRISM**: Gestão de Usuários
**Tipo**: Modal
**Dimensões**: 617x350px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#modal`, `#details`, `#researcher`

**Descrição**:
Modal de visualização detalhada das informações de um pesquisador específico, incluindo projetos associados e histórico de acesso a dados.

---

### Frame 008: Novo usuário adicionado com sucesso!

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6816-2701)
**Módulo PRISM**: Gestão de Usuários
**Tipo**: Toast notification
**Dimensões**: 353x42px
**Prioridade**: 🟢 Baixa
**Status**: 🔴 Não iniciado
**Tags**: `#toast`, `#notification`, `#success`

**Descrição**:
Notificação de sucesso exibida após a criação de um novo usuário.

---

### Frame 009: Novo pesquisador adicionado com sucesso!

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6816-2702)
**Módulo PRISM**: Gestão de Usuários
**Tipo**: Toast notification
**Dimensões**: 391x42px
**Prioridade**: 🟢 Baixa
**Status**: 🔴 Não iniciado
**Tags**: `#toast`, `#notification`, `#success`

**Descrição**:
Notificação de sucesso exibida após a criação de um novo pesquisador.

---

### Frame 010: NPIs e aplicações - Solicitações

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13591)
**Módulo PRISM**: Gestão de NPIs (NPI Management)
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🔴 Alta
**Status**: 🔴 Não iniciado
**Tags**: `#npi`, `#requests`, `#handshake`, `#federation`

**Descrição**:
Gerenciamento de solicitações de conexão de outros Nós de Pesquisa Integrada (NPIs) e aplicações. Implementa a interface para aprovar/rejeitar solicitações de handshake conforme o protocolo PRISM de 4 fases.

**Contexto PRISM**:
- Gestão do protocolo de handshake entre nós
- Aprovação de conexões federadas
- Controle de acesso de aplicações externas
- Visualização de certificados X.509

---

### Frame 011: NPIs e aplicações - Conexões ativas

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13512)
**Módulo PRISM**: Gestão de NPIs
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🔴 Alta
**Status**: 🔴 Não iniciado
**Tags**: `#npi`, `#active`, `#federation`, `#monitoring`

**Descrição**:
Visualização e monitoramento de conexões ativas com outros NPIs e aplicações. Exibe status de sessões, tokens ativos, últimas atividades e permite revogar acessos.

---

### Frame 012: SNOMED - Região do corpo

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12924)
**Módulo PRISM**: SNOMED CT
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#snomed`, `#body-region`, `#terminology`

**Descrição**:
Interface para busca e seleção de códigos SNOMED CT referentes a regiões do corpo. Utilizado para padronização de terminologia em dados biomédicos.

---

### Frame 013: SNOMED - Estrutura do corpo

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13008)
**Módulo PRISM**: SNOMED CT
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#snomed`, `#body-structure`, `#terminology`

**Descrição**:
Interface para busca e seleção de códigos SNOMED CT referentes a estruturas do corpo.

---

### Frame 014: SNOMED - Modificador topográfico

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13092)
**Módulo PRISM**: SNOMED CT
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#snomed`, `#topographic-modifier`, `#terminology`

**Descrição**:
Interface para busca e seleção de modificadores topográficos SNOMED CT (lateralidade, localização específica).

---

### Frame 015: SNOMED - Condição clínica

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13176)
**Módulo PRISM**: SNOMED CT
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#snomed`, `#clinical-condition`, `#terminology`

**Descrição**:
Interface para busca e seleção de condições clínicas padronizadas SNOMED CT.

---

### Frame 016: SNOMED - Evento clínico

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13260)
**Módulo PRISM**: SNOMED CT
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#snomed`, `#clinical-event`, `#terminology`

**Descrição**:
Interface para busca e seleção de eventos clínicos padronizados SNOMED CT.

---

### Frame 017: SNOMED - Medicação

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13344)
**Módulo PRISM**: SNOMED CT
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#snomed`, `#medication`, `#terminology`

**Descrição**:
Interface para busca e seleção de medicações padronizadas SNOMED CT.

---

### Frame 018: SNOMED - Alergia/Intolerância

**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13428)
**Módulo PRISM**: SNOMED CT
**Tipo**: Tela completa (Screen)
**Dimensões**: 1280x720px
**Prioridade**: 🟡 Média
**Status**: 🔴 Não iniciado
**Tags**: `#snomed`, `#allergy`, `#intolerance`, `#terminology`

**Descrição**:
Interface para busca e seleção de alergias e intolerâncias padronizadas SNOMED CT.

---

## Próximos Passos

### Fase 1: Revisão e Priorização (Atual)
- [ ] Revisar especificações com orientador do TCC
- [ ] Validar alinhamento com arquitetura do NPI backend
- [ ] Definir ordem de implementação
- [ ] Criar design system componentizado

### Fase 2: Implementação Alta Prioridade
- [ ] Frame 001: Login (Auth)
- [ ] Frame 002: Usuários
- [ ] Frame 003: Pesquisadores
- [ ] Frame 010-011: Gestão de NPIs

### Fase 3: Implementação Média Prioridade
- [ ] Frames 004-007: Formulários e modais de usuários
- [ ] Frames 012-018: Interfaces SNOMED CT

### Fase 4: Refinamento
- [ ] Frames 008-009: Notificações toast
- [ ] Testes de usabilidade
- [ ] Integração completa com backend
- [ ] Documentação no TCC

---

## Comandos Úteis

```bash
# Visualizar este mapeamento
cat docs/figma/frames-map.md

# Verificar mapeamento de node IDs
cat docs/figma/frame-node-mapping.json

# Acessar frame específico no Figma
# Substituir {nodeId} pelo Node ID da tabela
https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id={nodeId}
```

---

## Referências

- **TCC PRISM**: Padrão de Rótulos e Interfaces para Sistemas Médicos
- **NPI Backend**: `../InteroperableResearchNode/` (ASP.NET Core 8.0)
- **Protocolo de Handshake**: 4 fases (ECDH, X.509, Challenge-Response, Session Management)
- **SNOMED CT**: Sistema padronizado de terminologia clínica
- **HL7 FHIR**: Padrão de interoperabilidade para dados de saúde

---

**Gerado automaticamente por**: Claude CLI - IRIS Frame Mapper
**Versão**: 1.0.0
**Data**: 2025-10-17
