# Mapa de Frames - IRIS (PRISM)

Documentação completa dos frames do Figma para o projeto IRIS - **Interface de Pesquisa Interoperável Segura**.

**Arquivo Figma**: [I.R.I.S. Prototype](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype)
**Data de Mapeamento**: 2025-11-20
**Total de Frames**: 44
**Status Geral**: Atualizado

---

## Histórico de Atualizações

### 2025-11-20 - Revalidação
- **Mudança de nome**: Frame 002 "Usuários e Pesquisadores" → "Usuários"
- **9 novos frames adicionados**: 038-046
- **Frames duplicados identificados**: 036/041 (Dispositivos) e 037/042 (Sensores) - form vs list views
- **Total atualizado**: 35 → 44 frames

---

## Índice Rápido

| Módulo | Frames | Prioridade |
|--------|--------|------------|
| **Autenticação** | 1 | Alta |
| **Gestão de Usuários** | 7 | Alta / Média |
| **Gestão de Pesquisas** | 10 | Alta / Média |
| **Gestão de Conexões** | 4 | Alta / Média |
| **Gestão de Voluntários** | 6 | Alta / Média |
| **SNOMED CT** | 14 | Média |

---

## Índice de Frames

| ID  | Nome do Frame                             | Dimensões  | Módulo           | Prioridade | Tipo      | Node ID       |
|-----|-------------------------------------------|------------|------------------|------------|-----------|---------------|
| 001 | Login                                     | 1280x720   | Auth             | Alta       | Screen    | 6804-13742    |
| 002 | Usuários                                  | 1280x720   | User Mgmt        | Alta       | Screen    | 6804-13670    |
| 003 | Pesquisas                                 | 1280x720   | Research Mgmt    | Alta       | Screen    | 6910-3378     |
| 004 | Novo usuário                              | 1280x720   | User Mgmt        | Média      | Screen    | 6804-12778    |
| 005 | Novo pesquisador                          | 1280x720   | User Mgmt        | Média      | Screen    | 6804-12812    |
| 006 | Informações do usuário                    | 617x350    | User Mgmt        | Média      | Modal     | 6835-991      |
| 007 | Informações do pesquisador                | 617x350    | User Mgmt        | Média      | Modal     | 6835-1017     |
| 008 | Novo usuário adicionado com sucesso!      | 353x42     | User Mgmt        | Baixa      | Toast     | 6816-2701     |
| 009 | Novo pesquisador adicionado com sucesso!  | 391x42     | User Mgmt        | Baixa      | Toast     | 6816-2702     |
| 010 | Conexões - Solicitações                   | 1280x720   | Connection Mgmt  | Alta       | Screen    | 6804-13591    |
| 011 | Conexões - Conexões ativas                | 1280x720   | Connection Mgmt  | Alta       | Screen    | 6804-13512    |
| 012 | SNOMED - Região do corpo                  | 1280x720   | SNOMED           | Média      | Screen    | 6804-12924    |
| 013 | SNOMED - Estrutura do corpo               | 1280x720   | SNOMED           | Média      | Screen    | 6804-13008    |
| 014 | SNOMED - Modificador topográfico          | 1280x720   | SNOMED           | Média      | Screen    | 6804-13092    |
| 015 | SNOMED - Condição clínica                 | 1280x720   | SNOMED           | Média      | Screen    | 6804-13176    |
| 016 | SNOMED - Evento clínico                   | 1280x720   | SNOMED           | Média      | Screen    | 6804-13260    |
| 017 | SNOMED - Medicação                        | 1280x720   | SNOMED           | Média      | Screen    | 6804-13344    |
| 018 | SNOMED - Alergia/Intolerância             | 1280x720   | SNOMED           | Média      | Screen    | 6804-13428    |
| 020 | Pesquisa específica - Voluntários         | 1280x720   | Research Mgmt    | Média      | Screen    | 6910-4190     |
| 021 | Pesquisa específica - Pesquisadores       | 1280x720   | Research Mgmt    | Média      | Screen    | 6910-3745     |
| 023 | Novo evento clínico                       | 1280x720   | SNOMED           | Média      | Screen    | 6910-2905     |
| 024 | Nova condição clínica                     | 1280x720   | SNOMED           | Média      | Screen    | 6910-2825     |
| 025 | Pesquisas - Incluir pesquisador           | 1280x720   | Research Mgmt    | Média      | Screen    | 6910-4029     |
| 026 | Novo modificador topográfico              | 1280x720   | SNOMED           | Média      | Screen    | 6910-2719     |
| 027 | Nova alergia/Intolerância                 | 1280x720   | SNOMED           | Média      | Screen    | 6910-3177     |
| 028 | Nova medicação                            | 1280x720   | SNOMED           | Média      | Screen    | 6910-3052     |
| 029 | Nova estrutura do corpo                   | 1280x720   | SNOMED           | Média      | Screen    | 6910-2612     |
| 030 | Nova conexão                              | 1280x720   | Connection Mgmt  | Média      | Screen    | 6910-3543     |
| 031 | Nova região do corpo                      | 1280x720   | SNOMED           | Média      | Screen    | 6910-2488     |
| 032 | Pesquisas do voluntário open              | 672x146    | Research Mgmt    | Média      | Component | 6998-3774     |
| 033 | Novo voluntário                           | 1280x765   | Volunteer Mgmt   | Média      | Screen    | 6998-918      |
| 034 | Pesquisa específica - Nova Aplicação      | 1280x720   | Research Mgmt    | Média      | Screen    | 6998-4356     |
| 035 | Pesquisa específica - Novo voluntário     | 1280x720   | Research Mgmt    | Média      | Screen    | 6998-4751     |
| 036 | Pesquisa específica - Dispositivos        | 1280x720   | Research Mgmt    | Média      | Screen    | 6998-4555     |
| 037 | Pesquisa específica - Sensores            | 1280x720   | Research Mgmt    | Média      | Screen    | 6998-4642     |
| 038 | Pesquisadores                             | 1280x720   | User Mgmt        | Alta       | Screen    | 6804-12845    |
| 039 | Voluntários                               | 1280x720   | Volunteer Mgmt   | Alta       | Screen    | 6998-847      |
| 040 | Pesquisa específica - Aplicações          | 1280x720   | Research Mgmt    | Média      | Screen    | 6998-4090     |
| 041 | Pesquisa específica - Dispositivos        | 1280x720   | Research Mgmt    | Média      | Screen    | 6998-4179     |
| 042 | Pesquisa específica - Sensores            | 1280x720   | Research Mgmt    | Média      | Screen    | 6998-4266     |
| 043 | Aceite Solicitações                       | 405x230    | Connection Mgmt  | Média      | Modal     | 6998-800      |
| 044 | Adicionar voluntário existente            | 405x302    | Volunteer Mgmt   | Média      | Modal     | 6998-5170     |
| 045 | Confirmar remoção de voluntário           | 482x230    | Volunteer Mgmt   | Média      | Modal     | 6998-3929     |
| 046 | Condições clínicas open                   | 672x266    | Volunteer Mgmt   | Média      | Component | 6998-3586     |

---

## Frames Detalhados

### Frame 001: Login
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13742)
**Módulo PRISM**: Autenticação
**Status**: Verificado

### Frame 002: Usuários
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13670)
**Módulo PRISM**: Gestão de Usuários
**Status**: Verificado
**Notas**: Renomeado de "Usuários e Pesquisadores" para "Usuários"

### Frame 003: Pesquisas
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6910-3378)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Verificado

### Frame 010: Conexões - Solicitações
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13591)
**Módulo PRISM**: Gestão de Conexões
**Status**: Verificado

### Frame 011: Conexões - Conexões ativas
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13512)
**Módulo PRISM**: Gestão de Conexões
**Status**: Verificado

### Frame 032: Pesquisas do voluntário open
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-3774)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Verificado
**Descrição**: Componente de acordeão expandido mostrando pesquisas associadas a um voluntário.

### Frame 033: Novo voluntário
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-918)
**Módulo PRISM**: Gestão de Voluntários
**Status**: Verificado
**Descrição**: Formulário para cadastro de novo voluntário com campos de dados pessoais, condições clínicas e pesquisas associadas.

### Frame 034: Pesquisa específica - Nova Aplicação
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-4356)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Verificado
**Descrição**: Formulário para adicionar nova aplicação a uma pesquisa específica.

### Frame 035: Pesquisa específica - Novo voluntário
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-4751)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Verificado
**Descrição**: Formulário para adicionar novo voluntário a uma pesquisa específica.

### Frame 036: Pesquisa específica - Dispositivos (Form)
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-4555)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Verificado
**Descrição**: Formulário para adicionar novo dispositivo a uma pesquisa específica.
**Nota**: Ver também frame 041 para lista de dispositivos.

### Frame 037: Pesquisa específica - Sensores (Form)
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-4642)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Verificado
**Descrição**: Formulário para adicionar novo sensor a uma pesquisa específica.
**Nota**: Ver também frame 042 para lista de sensores.

---

## Novos Frames (Adicionados em 2025-11-20)

### Frame 038: Pesquisadores
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12845)
**Módulo PRISM**: Gestão de Usuários
**Status**: Pendente
**Descrição**: Tela de listagem de pesquisadores.

### Frame 039: Voluntários
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-847)
**Módulo PRISM**: Gestão de Voluntários
**Status**: Pendente
**Descrição**: Tela de listagem de voluntários.

### Frame 040: Pesquisa específica - Aplicações
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-4090)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Pendente
**Descrição**: Lista de aplicações para uma pesquisa específica.

### Frame 041: Pesquisa específica - Dispositivos (List)
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-4179)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Pendente
**Descrição**: Lista de dispositivos para uma pesquisa específica.
**Nota**: Ver também frame 036 para formulário de adição de dispositivo.

### Frame 042: Pesquisa específica - Sensores (List)
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-4266)
**Módulo PRISM**: Gestão de Pesquisas
**Status**: Pendente
**Descrição**: Lista de sensores para uma pesquisa específica.
**Nota**: Ver também frame 037 para formulário de adição de sensor.

### Frame 043: Aceite Solicitações
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-800)
**Módulo PRISM**: Gestão de Conexões
**Status**: Pendente
**Descrição**: Modal para aceitar solicitação de conexão.

### Frame 044: Adicionar voluntário existente
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-5170)
**Módulo PRISM**: Gestão de Voluntários
**Status**: Pendente
**Descrição**: Modal para adicionar voluntário existente a uma pesquisa.

### Frame 045: Confirmar remoção de voluntário
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-3929)
**Módulo PRISM**: Gestão de Voluntários
**Status**: Pendente
**Descrição**: Modal de confirmação para remoção de voluntário.

### Frame 046: Condições clínicas open
**URL Figma**: [Ver no Figma](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6998-3586)
**Módulo PRISM**: Gestão de Voluntários
**Status**: Pendente
**Descrição**: Componente de acordeão expandido mostrando condições clínicas de um voluntário.

---

## Notas sobre Frames Duplicados

Os seguintes frames têm o mesmo nome no Figma mas são telas diferentes (formulário vs lista):

| Nome | Frame Form | Frame List | Descrição |
|------|-----------|-----------|-----------|
| Pesquisa específica - Dispositivos | 036 (6998-4555) | 041 (6998-4179) | Form para adicionar vs Lista de dispositivos |
| Pesquisa específica - Sensores | 037 (6998-4642) | 042 (6998-4266) | Form para adicionar vs Lista de sensores |

---

**Gerado automaticamente por**: Claude Code
**Data**: 2025-11-20
