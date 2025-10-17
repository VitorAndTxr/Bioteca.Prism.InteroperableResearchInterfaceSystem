# Storybook - IRIS Design System

Este diretório contém a configuração do Storybook para o design system IRIS.

## 📚 O que é o Storybook?

Storybook é uma ferramenta de desenvolvimento para criar, testar e documentar componentes de UI de forma isolada.

**Benefícios:**
- 🎨 **Desenvolvimento isolado** - Teste componentes sem precisar rodar toda a aplicação
- 📖 **Documentação automática** - Gera documentação interativa dos componentes
- ✅ **Testes visuais** - Visualize todos os estados e variantes dos componentes
- 🔄 **Hot reload** - Veja mudanças instantaneamente
- 🎯 **Acessibilidade** - Addon A11y para testar acessibilidade

## 🚀 Como usar

### Iniciar o Storybook

```bash
# Na pasta apps/desktop
npm run storybook
```

O Storybook abrirá automaticamente em [http://localhost:6006](http://localhost:6006)

### Buildar o Storybook

```bash
npm run build-storybook
```

Gera versão estática em `storybook-static/`

## 📁 Estrutura

```
.storybook/
├── main.ts              # Configuração principal do Storybook
├── preview.ts           # Configuração global de preview
├── vitest.setup.ts      # Configuração de testes com Vitest
└── README.md            # Este arquivo
```

## 📖 Stories

As stories dos componentes estão localizadas junto aos próprios componentes:

```
src/design-system/components/
├── button/
│   ├── Button.tsx
│   ├── Button.css
│   ├── Button.types.ts
│   ├── Button.stories.tsx  ← Stories do Button
│   └── README.md
└── input/
    ├── Input.tsx
    ├── Input.css
    ├── Input.types.ts
    ├── Input.stories.tsx   ← Stories do Input
    └── README.md
```

## ✨ Addons Instalados

### Essenciais
- **@storybook/addon-docs** - Documentação automática com MDX
- **@storybook/addon-controls** - Controles interativos para props
- **@storybook/addon-actions** - Log de eventos (clicks, onChange, etc)
- **@storybook/addon-viewport** - Testa diferentes tamanhos de tela

### Qualidade
- **@storybook/addon-a11y** - Testes de acessibilidade
- **@storybook/addon-vitest** - Integração com Vitest para testes
- **@chromatic-com/storybook** - Testes visuais com Chromatic

### Desenvolvimento
- **@storybook/addon-onboarding** - Tutorial interativo
- **@storybook/addon-links** - Navegação entre stories

## 📝 Criando uma Story

### Estrutura básica

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './index';

const meta = {
    title: 'Design System/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'outline'],
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Story básica
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};

// Story interativa
export const Interactive: Story = {
    render: () => {
        const [count, setCount] = React.useState(0);
        return (
            <Button onClick={() => setCount(count + 1)}>
                Clicked {count} times
            </Button>
        );
    },
};
```

### Tipos de Stories

#### 1. Story Simples (args)
```typescript
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Button',
    },
};
```

#### 2. Story com Render Customizado
```typescript
export const ComplexExample: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="primary">Save</Button>
            <Button variant="outline">Cancel</Button>
        </div>
    ),
};
```

#### 3. Story com Estado
```typescript
export const WithState: Story = {
    render: () => {
        const [value, setValue] = useState('');
        return (
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
};
```

## 🎨 Organização das Stories

### Naming Convention
- **Title**: `Design System/ComponentName`
- **Story Names**: Use PascalCase e nomes descritivos

### Exemplos
- ✅ `Design System/Button` → `Primary`, `Secondary`, `Outline`
- ✅ `Design System/Input` → `Default`, `WithLabel`, `ErrorState`
- ❌ `button` → `test1`, `test2` (evite)

### Categorias Recomendadas
```
Design System/
├── Button
├── Input
├── Dropdown
├── Checkbox
└── ...

Forms/
├── LoginForm
├── RegistrationForm
└── ...

Screens/
├── Dashboard
├── UserList
└── ...
```

## 🧪 Testando Acessibilidade

O addon A11y roda automaticamente. Verifique a aba "Accessibility" no painel do Storybook.

### Boas práticas
- ✅ Sempre adicione `aria-label` para ícones
- ✅ Use `required` e `aria-required` para campos obrigatórios
- ✅ Adicione `role` para elementos customizados
- ✅ Teste com navegação por teclado

## 📊 Executando Testes

```bash
# Testes com Vitest (integrado)
npx vitest --project=storybook

# Com watch mode
npx vitest --project=storybook --watch

# Com coverage
npx vitest --project=storybook --coverage
```

## 🚀 Deployment

### Build estático
```bash
npm run build-storybook
```

Resultado em `storybook-static/` pode ser servido por qualquer servidor estático (Netlify, Vercel, GitHub Pages, etc).

### Chromatic (Visual Testing)
```bash
npx chromatic --project-token=<your-token>
```

## 📚 Recursos

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook for React](https://storybook.js.org/docs/react)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories)
- [Essential Addons](https://storybook.js.org/docs/react/essentials)
- [Accessibility Testing](https://storybook.js.org/docs/react/writing-tests/accessibility-testing)

## 🆘 Troubleshooting

### Porta já em uso
```bash
# Use porta diferente
npm run storybook -- --port 6007
```

### Clear cache
```bash
# Limpar cache do Storybook
rm -rf node_modules/.cache/storybook
```

### Rebuild
```bash
# Reinstalar dependências
rm -rf node_modules
npm install
```

## 📝 Changelog

### v1.0.0 (2025-01-17)
- ✅ Configuração inicial do Storybook 9.1.13
- ✅ Integração com Vite
- ✅ Addons: A11y, Docs, Vitest
- ✅ Stories: Button (15+ stories)
- ✅ Stories: Input (20+ stories)
- ✅ Configuração de testes com Vitest
