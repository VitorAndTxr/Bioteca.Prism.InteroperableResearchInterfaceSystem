# Prompts Hands-on para Desenvolvimento de Telas Pendentes

Este documento contém prompts detalhados para serem utilizados por agentes de IA (ou desenvolvedores) para implementar as funcionalidades pendentes do projeto IRIS, focando nas prioridades definidas na documentação.

---

## 1. Gestão de Projetos de Pesquisa (Research Projects)
**Prioridade:** Alta (Core Feature)
**Plataforma:** Desktop
**Status Atual:** `ResearchService` implementado com mock. Nenhuma tela criada.

### Prompt para o Agente:

```markdown
# Contexto
O projeto IRIS (Desktop) necessita da interface para gerenciamento de Projetos de Pesquisa.
O serviço `ResearchService` (`apps/desktop/src/services/research/ResearchService.ts`) já está implementado e configurado com `USE_MOCK = true`, retornando dados fictícios.
O Design System já possui componentes como `DataTable`, `Button`, `Input`, `Modal`.

# Objetivo
Implementar o módulo de **Gestão de Pesquisas** no Desktop.

# Tarefas (Step-by-Step)

1.  **Configuração de Rotas e Menu**:
    -   Adicione a rota `/research` no `apps/desktop/src/App.tsx`.
    -   Adicione o item "Projetos" (ícone de pasta ou similar) na Sidebar (`apps/desktop/src/design-system/organisms/Sidebar/Sidebar.tsx`).

2.  **Tela de Listagem (`ResearchListScreen`)**:
    -   Crie `apps/desktop/src/screens/Research/ResearchListScreen.tsx`.
    -   Utilize o `ResearchService.getResearchPaginated` para buscar os dados.
    -   Exiba os dados em um `DataTable` com as colunas:
        -   Título
        -   Status (use `Badge` ou texto colorido)
        -   Nó de Pesquisa (Nome)
        -   Data de Criação
        -   Ações (Botão de Editar/Detalhes)
    -   Adicione um botão "Novo Projeto" no topo que abre o modal de criação.

3.  **Formulário de Criação (`CreateResearchForm`)**:
    -   Crie o componente `apps/desktop/src/screens/Research/components/CreateResearchForm.tsx`.
    -   Campos necessários:
        -   Título (Input texto, obrigatório)
        -   Descrição (TextArea, obrigatório)
        -   Nó de Pesquisa (Select - por enquanto pode ser um mock estático ou input de texto se não houver serviço de nós pronto para listar).
    -   Ao submeter, chame `ResearchService.createResearch`.
    -   Exiba notificação de sucesso (`useToast`) e atualize a lista.

4.  **Detalhes do Projeto (Opcional/Placeholder)**:
    -   Ao clicar em um item da lista, navegue para `/research/:id` (crie uma tela placeholder `ResearchDetailsScreen` exibindo o ID e dados básicos).

# Requisitos Técnicos
-   Use Hooks do React (`useEffect`, `useState`) para gerenciar o estado de carregamento e dados.
-   Trate erros de API exibindo Toasts.
-   Mantenha a consistência visual com a tela `NodeConnections`.
```

---

## 2. Gestão de Voluntários (Volunteers)
**Prioridade:** Média (Próximo passo após Pesquisas)
**Plataforma:** Desktop
**Status Atual:** Provável ausência de `VolunteerService`. Nenhuma tela criada.

### Prompt para o Agente:

```markdown
# Contexto
O sistema precisa gerenciar os Voluntários (Pacientes) que participam das pesquisas.
Atualmente não existe `VolunteerService` nem telas associadas.

# Objetivo
Criar a infraestrutura de serviço e as telas de **Gestão de Voluntários**.

# Tarefas (Step-by-Step)

1.  **Criar `VolunteerService`**:
    -   Crie `apps/desktop/src/services/volunteer/VolunteerService.ts`.
    -   Estenda de `BaseService`.
    -   Implemente `USE_MOCK = true`.
    -   Métodos necessários:
        -   `getVolunteersPaginated(page, pageSize)`: Retorna lista mockada de voluntários (ID, Nome, Email, Data Nascimento, Status).
        -   `createVolunteer(data)`: Recebe dados e retorna sucesso mockado.
    -   Registre o serviço no `ServiceContext`.

2.  **Tela de Listagem (`VolunteersListScreen`)**:
    -   Crie `apps/desktop/src/screens/Volunteers/VolunteersListScreen.tsx`.
    -   Rota: `/volunteers`.
    -   Adicione item "Voluntários" na Sidebar.
    -   Use `DataTable` para listar: Nome, Email, Idade (calculada), Status.

3.  **Formulário de Cadastro (`CreateVolunteerForm`)**:
    -   Campos: Nome Completo, Email, Data de Nascimento, Gênero, Telefone.
    -   Validação básica de campos obrigatórios.
    -   Integração com o método `createVolunteer`.

# Requisitos Técnicos
-   Siga estritamente o padrão de injeção de dependência usado em `UserService` e `ResearchService`.
-   Use os tipos definidos em `@iris/domain` (crie a interface `Volunteer` se não existir).
```

---

## 3. Autenticação Mobile (Login)
**Prioridade:** Média (Necessário para app real)
**Plataforma:** Mobile (React Native)
**Status Atual:** App abre direto na Home. Sem autenticação.

### Prompt para o Agente:

```markdown
# Contexto
O aplicativo móvel atualmente não possui tela de login, acessando diretamente as funcionalidades de Bluetooth. Para integração com a plataforma PRISM, é necessário autenticar o pesquisador.

# Objetivo
Implementar a tela de **Login** no Mobile App.

# Tarefas (Step-by-Step)

1.  **Setup de Navegação**:
    -   Refatore a navegação em `apps/mobile/App.tsx` para suportar um fluxo de Auth (Login) vs App (Home).
    -   Crie um `AuthStack` e um `AppStack` (ou similar).

2.  **Tela de Login (`LoginScreen`)**:
    -   Crie `apps/mobile/src/screens/LoginScreen.tsx`.
    -   Layout simples e limpo: Logo IRIS, Input Email, Input Senha, Botão Entrar.
    -   Use componentes nativos (`TextInput`, `TouchableOpacity`) ou adapte do design system se houver UI kit mobile.

3.  **Integração com Serviço (Mock Inicial)**:
    -   Como o middleware de criptografia pode ser complexo de portar agora, crie um `MobileAuthService` simples em `apps/mobile/src/services/`.
    -   Método `login(email, password)`:
        -   Se `USE_MOCK = true`, aceite `admin@admin.com` / `prismadmin`.
        -   Retorne um token fake e armazene no `AsyncStorage`.

4.  **Contexto de Autenticação**:
    -   Adapte ou crie um `AuthContext` para o Mobile que verifica se existe token no boot e direciona para Home ou Login.

# Requisitos Técnicos
-   React Native + Expo.
-   Use `AsyncStorage` para persistência de sessão.
-   Feedback visual de "Carregando" durante o login.
```
