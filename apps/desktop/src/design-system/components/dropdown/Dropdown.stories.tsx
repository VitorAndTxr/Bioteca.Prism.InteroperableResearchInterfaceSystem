/**
 * Dropdown Component Stories
 *
 * Comprehensive Storybook stories demonstrating all Dropdown variants,
 * states, and functionality based on Figma design (node 2803-2339)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown } from './Dropdown';
import type { DropdownProps, DropdownOption, DropdownGroup } from './Dropdown.types';

// ============================================================================
// Story Configuration
// ============================================================================

const meta: Meta<typeof Dropdown> = {
  title: 'Design System/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A comprehensive dropdown/select component with support for single selection,
multiple selection, search, grouped options, and full keyboard navigation.

**Features:**
- Single and multiple selection modes
- Searchable options with custom filter
- Grouped options with section headers
- Tags display for multiple selection
- Custom "Add new item" button
- Full keyboard navigation
- Accessibility support

**Figma Design:** node 2803-2339
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'big'],
      description: 'Size variant of the dropdown',
    },
    mode: {
      control: 'radio',
      options: ['single', 'multiple'],
      description: 'Selection mode',
    },
    validation: {
      control: 'select',
      options: ['none', 'error', 'success', 'warning'],
      description: 'Validation state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    searchable: {
      control: 'boolean',
      description: 'Enable search functionality',
    },
    showTags: {
      control: 'boolean',
      description: 'Show selected items as tags (multiple mode)',
    },
    showAddButton: {
      control: 'boolean',
      description: 'Show "Add new item" button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

// ============================================================================
// Sample Data
// ============================================================================

const simpleOptions: DropdownOption[] = [
  { value: '1', label: 'Item 1' },
  { value: '2', label: 'Item 2' },
  { value: '3', label: 'Item 3' },
  { value: '4', label: 'Item 4' },
  { value: '5', label: 'Item 5' },
];

const fruitOptions: DropdownOption[] = [
  { value: 'apple', label: 'Apples' },
  { value: 'apricot', label: 'Apricots' },
  { value: 'banana', label: 'Bananas' },
  { value: 'kiwi', label: 'Kiwis' },
  { value: 'mango', label: 'Mangos' },
  { value: 'orange', label: 'Oranges' },
  { value: 'peach', label: 'Peaches' },
];

const groupedFruitOptions: DropdownGroup[] = [
  {
    label: 'Popular',
    options: [
      { value: 'apple', label: 'Apples' },
      { value: 'banana', label: 'Bananas' },
      { value: 'orange', label: 'Oranges' },
    ],
  },
  {
    label: 'Other',
    options: [
      { value: 'apricot', label: 'Apricot' },
      { value: 'kiwi', label: 'Kiwis' },
      { value: 'mango', label: 'Mangos' },
      { value: 'peach', label: 'Peaches' },
    ],
  },
];

// ============================================================================
// Interactive Template
// ============================================================================

const InteractiveTemplate = (args: DropdownProps) => {
  const [value, setValue] = useState<string | string[]>(args.mode === 'multiple' ? [] : '');

  return (
    <div style={{ padding: '20px', minHeight: '400px' }}>
      <Dropdown
        {...args}
        value={value}
        onChange={setValue}
      />
      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Selected Value:</strong>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    </div>
  );
};

// ============================================================================
// Stories: Basic Usage
// ============================================================================

export const Default: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    placeholder: 'Choose value',
    label: 'Default Dropdown',
  },
};

export const WithLabel: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    label: 'Fruit preferences',
    placeholder: 'Choose fruits',
    helperText: 'Select your favorite fruit',
  },
};

export const Required: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    label: 'Required Field',
    placeholder: 'Choose value',
    required: true,
  },
};

// ============================================================================
// Stories: Size Variants
// ============================================================================

export const SizeSmall: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    size: 'small',
    label: 'Small Dropdown',
    placeholder: 'Choose value',
  },
};

export const SizeMedium: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    size: 'medium',
    label: 'Medium Dropdown (Default)',
    placeholder: 'Choose value',
  },
};

export const SizeBig: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    size: 'big',
    label: 'Big Dropdown',
    placeholder: 'Choose value',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px' }}>
      <Dropdown
        options={simpleOptions}
        size="small"
        label="Small"
        placeholder="Choose value"
      />
      <Dropdown
        options={simpleOptions}
        size="medium"
        label="Medium (Default)"
        placeholder="Choose value"
      />
      <Dropdown
        options={simpleOptions}
        size="big"
        label="Big"
        placeholder="Choose value"
      />
    </div>
  ),
};

// ============================================================================
// Stories: States
// ============================================================================

export const Disabled: Story = {
  args: {
    options: simpleOptions,
    label: 'Disabled Dropdown',
    placeholder: 'Choose value',
    disabled: true,
  },
};

export const ValidationError: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    label: 'Error State',
    placeholder: 'Choose value',
    errorMessage: 'Please select a valid option',
  },
};

export const ValidationSuccess: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    label: 'Success State',
    placeholder: 'Choose value',
    validation: 'success',
  },
};

export const ValidationWarning: Story = {
  render: InteractiveTemplate,
  args: {
    options: simpleOptions,
    label: 'Warning State',
    placeholder: 'Choose value',
    validation: 'warning',
    helperText: 'This selection may have consequences',
  },
};

export const AllValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px' }}>
      <Dropdown
        options={simpleOptions}
        label="Default"
        placeholder="Choose value"
      />
      <Dropdown
        options={simpleOptions}
        label="Error"
        placeholder="Choose value"
        validation="error"
        errorMessage="This field is required"
      />
      <Dropdown
        options={simpleOptions}
        label="Success"
        placeholder="Choose value"
        validation="success"
      />
      <Dropdown
        options={simpleOptions}
        label="Warning"
        placeholder="Choose value"
        validation="warning"
        helperText="Please verify your selection"
      />
    </div>
  ),
};

// ============================================================================
// Stories: Multiple Selection
// ============================================================================

export const MultipleSelection: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    mode: 'multiple',
    label: 'Multiple Selection',
    placeholder: 'Choose fruits',
  },
};

export const MultipleWithTags: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    mode: 'multiple',
    showTags: true,
    label: 'Multiple Selection with Tags',
    placeholder: 'Choose fruits',
  },
};

export const MultipleWithTagsLimit: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    mode: 'multiple',
    showTags: true,
    maxTagsVisible: 2,
    label: 'Multiple Selection (Max 2 Tags)',
    placeholder: 'Choose fruits',
    helperText: 'Select multiple fruits. After 2, count will be shown.',
  },
};

export const MultipleNoTags: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    mode: 'multiple',
    showTags: false,
    label: 'Multiple Selection (No Tags)',
    placeholder: 'Choose fruits',
    helperText: 'Shows count instead of tags',
  },
};

// ============================================================================
// Stories: Search Functionality
// ============================================================================

export const Searchable: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    searchable: true,
    searchPlaceholder: 'Search fruits...',
    label: 'Searchable Dropdown',
    placeholder: 'Choose fruits',
  },
};

export const SearchableMultiple: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    mode: 'multiple',
    searchable: true,
    showTags: true,
    searchPlaceholder: 'Type to filter...',
    label: 'Searchable Multiple Selection',
    placeholder: 'Choose fruits',
  },
};

// ============================================================================
// Stories: Grouped Options
// ============================================================================

export const GroupedOptions: Story = {
  render: InteractiveTemplate,
  args: {
    options: groupedFruitOptions,
    label: 'Grouped Options',
    placeholder: 'Choose fruits',
  },
};

export const GroupedMultiple: Story = {
  render: InteractiveTemplate,
  args: {
    options: groupedFruitOptions,
    mode: 'multiple',
    showTags: false,
    label: 'Grouped Multiple Selection',
    placeholder: 'Choose fruits',
  },
};

export const GroupedWithSearch: Story = {
  render: InteractiveTemplate,
  args: {
    options: groupedFruitOptions,
    mode: 'multiple',
    searchable: true,
    showTags: true,
    label: 'Grouped with Search',
    placeholder: 'Choose fruits',
  },
};

// ============================================================================
// Stories: Advanced Features
// ============================================================================

export const WithAddButton: Story = {
  render: () => {
    const [options, setOptions] = useState(fruitOptions);
    const [value, setValue] = useState<string>('');

    return (
      <div style={{ padding: '20px', minHeight: '400px' }}>
        <Dropdown
          options={options}
          value={value}
          onChange={setValue}
          label="Fruits"
          placeholder="Choose fruit"
          showAddButton={true}
          addButtonText="Add new fruit"
          onAddClick={() => {
            const newFruit = prompt('Enter fruit name:');
            if (newFruit) {
              setOptions([...options, {
                value: newFruit.toLowerCase(),
                label: newFruit,
              }]);
            }
          }}
        />
      </div>
    );
  },
};

export const CustomRendering: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions.map(opt => ({
      ...opt,
      icon: '🍎',
    })),
    label: 'Custom Rendering',
    placeholder: 'Choose fruit',
    renderOption: (option, selected) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{option.icon}</span>
        <span>{option.label}</span>
        {selected && <span style={{ marginLeft: 'auto', color: '#49A2A8' }}>✓</span>}
      </div>
    ),
  },
};

export const ControlledOpen: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div style={{ padding: '20px', minHeight: '400px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Close' : 'Open'} Dropdown
          </button>
        </div>
        <Dropdown
          options={simpleOptions}
          value={value}
          onChange={setValue}
          open={isOpen}
          onOpenChange={setIsOpen}
          label="Controlled Open State"
          placeholder="Choose value"
        />
      </div>
    );
  },
};

export const MaxMenuHeight: Story = {
  render: InteractiveTemplate,
  args: {
    options: fruitOptions,
    label: 'Limited Menu Height',
    placeholder: 'Choose fruit',
    maxMenuHeight: 200,
    helperText: 'Menu height limited to 200px',
  },
};

// ============================================================================
// Stories: Complex Examples
// ============================================================================

export const CompleteForm: Story = {
  render: () => {
    const [country, setCountry] = useState('');
    const [languages, setLanguages] = useState<string[]>([]);
    const [experience, setExperience] = useState('');

    const countries = [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
    ];

    const languageOptions = [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'pt', label: 'Portuguese' },
    ];

    const experienceLevels = [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' },
    ];

    return (
      <div style={{ padding: '20px', maxWidth: '500px' }}>
        <h2>User Profile Form</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
          <Dropdown
            options={countries}
            value={country}
            onChange={setCountry}
            label="Country"
            placeholder="Select your country"
            required={true}
            searchable={true}
          />

          <Dropdown
            options={languageOptions}
            value={languages}
            onChange={setLanguages}
            mode="multiple"
            showTags={true}
            label="Languages"
            placeholder="Select languages"
            helperText="Select all languages you speak"
          />

          <Dropdown
            options={experienceLevels}
            value={experience}
            onChange={setExperience}
            label="Experience Level"
            placeholder="Choose your level"
            required={true}
          />

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#49A2A8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Submit
          </button>
        </div>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
      <div>
        <h3>Simple Dropdown</h3>
        <Dropdown
          options={simpleOptions}
          placeholder="Choose value"
        />
      </div>

      <div>
        <h3>With Label</h3>
        <Dropdown
          options={fruitOptions}
          label="Fruit preferences"
          placeholder="Choose fruits"
        />
      </div>

      <div>
        <h3>Multiple Selection</h3>
        <Dropdown
          options={fruitOptions}
          mode="multiple"
          showTags={true}
          label="Multiple fruits"
          placeholder="Choose fruits"
        />
      </div>

      <div>
        <h3>Searchable</h3>
        <Dropdown
          options={fruitOptions}
          searchable={true}
          label="Search fruits"
          placeholder="Choose fruit"
        />
      </div>

      <div>
        <h3>Grouped Options</h3>
        <Dropdown
          options={groupedFruitOptions}
          label="Grouped fruits"
          placeholder="Choose fruit"
        />
      </div>

      <div>
        <h3>With Error</h3>
        <Dropdown
          options={simpleOptions}
          label="Required field"
          placeholder="Choose value"
          errorMessage="This field is required"
        />
      </div>

      <div>
        <h3>Disabled</h3>
        <Dropdown
          options={simpleOptions}
          label="Disabled"
          placeholder="Choose value"
          disabled={true}
        />
      </div>

      <div>
        <h3>Small Size</h3>
        <Dropdown
          options={simpleOptions}
          size="small"
          label="Small dropdown"
          placeholder="Choose value"
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Stories: Accessibility
// ============================================================================

export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Keyboard Navigation Guide:</h3>
        <ul>
          <li><kbd>Enter</kbd> / <kbd>Space</kbd> - Open menu or select focused option</li>
          <li><kbd>Escape</kbd> - Close menu</li>
          <li><kbd>ArrowDown</kbd> - Move focus to next option</li>
          <li><kbd>ArrowUp</kbd> - Move focus to previous option</li>
          <li><kbd>Home</kbd> - Focus first option</li>
          <li><kbd>End</kbd> - Focus last option</li>
          <li><kbd>Tab</kbd> - Close menu and move to next element</li>
        </ul>
      </div>
      <Dropdown
        options={fruitOptions}
        label="Try keyboard navigation"
        placeholder="Focus and press Enter"
        helperText="Use keyboard to navigate"
      />
    </div>
  ),
};
