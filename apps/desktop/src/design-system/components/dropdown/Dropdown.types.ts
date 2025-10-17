/**
 * Dropdown Component Type Definitions
 *
 * Based on Figma design: node 2803-2339
 * Design system component for IRIS desktop application
 */

// ============================================================================
// Option Types
// ============================================================================

/**
 * Base option structure for dropdown items
 */
export interface DropdownOption {
  /** Unique identifier for the option */
  value: string;
  /** Display label for the option */
  label: string;
  /** Optional icon component or icon name */
  icon?: React.ReactNode | string;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Optional group this option belongs to */
  group?: string;
}

/**
 * Grouped options structure
 */
export interface DropdownGroup {
  /** Group label */
  label: string;
  /** Options in this group */
  options: DropdownOption[];
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Size variants for the dropdown
 */
export type DropdownSize = 'small' | 'medium' | 'big';

/**
 * Selection mode for the dropdown
 */
export type DropdownMode = 'single' | 'multiple';

/**
 * Validation states
 */
export type DropdownValidation = 'none' | 'error' | 'success' | 'warning';

/**
 * Props for the Dropdown component
 */
export interface DropdownProps {
  // ========================================
  // Required Props
  // ========================================

  /** Unique identifier for the dropdown */
  id?: string;

  /** Dropdown name for form submission */
  name?: string;

  /** Available options */
  options: DropdownOption[] | DropdownGroup[];

  // ========================================
  // Value & Selection
  // ========================================

  /** Currently selected value(s) */
  value?: string | string[];

  /** Default value for uncontrolled mode */
  defaultValue?: string | string[];

  /** Callback when selection changes */
  onChange?: (value: string | string[]) => void;

  /** Selection mode */
  mode?: DropdownMode;

  // ========================================
  // Appearance
  // ========================================

  /** Size variant */
  size?: DropdownSize;

  /** Label text */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Helper text below the dropdown */
  helperText?: string;

  /** Error message (sets validation to 'error') */
  errorMessage?: string;

  /** Validation state */
  validation?: DropdownValidation;

  /** Whether to show the chevron icon */
  showChevron?: boolean;

  // ========================================
  // Search & Filtering
  // ========================================

  /** Enable search/filter functionality */
  searchable?: boolean;

  /** Placeholder for search input */
  searchPlaceholder?: string;

  /** Custom search filter function */
  filterFn?: (option: DropdownOption, searchTerm: string) => boolean;

  // ========================================
  // Multiple Selection Features
  // ========================================

  /** Show selected items as tags (multiple mode only) */
  showTags?: boolean;

  /** Maximum number of tags to show before "+X more" */
  maxTagsVisible?: number;

  /** Custom render function for selected value display */
  renderValue?: (value: string | string[], options: DropdownOption[]) => React.ReactNode;

  // ========================================
  // Menu Customization
  // ========================================

  /** Custom render function for dropdown items */
  renderOption?: (option: DropdownOption, selected: boolean) => React.ReactNode;

  /** Show "Add new item" button */
  showAddButton?: boolean;

  /** Text for add button */
  addButtonText?: string;

  /** Callback when add button is clicked */
  onAddClick?: () => void;

  /** Maximum height for the dropdown menu */
  maxMenuHeight?: number | string;

  // ========================================
  // State & Interaction
  // ========================================

  /** Whether the dropdown is disabled */
  disabled?: boolean;

  /** Whether the dropdown is required */
  required?: boolean;

  /** Whether to open the menu by default */
  defaultOpen?: boolean;

  /** Controlled open state */
  open?: boolean;

  /** Callback when menu opens/closes */
  onOpenChange?: (open: boolean) => void;

  /** Callback when dropdown is focused */
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;

  /** Callback when dropdown loses focus */
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;

  // ========================================
  // Advanced
  // ========================================

  /** Additional CSS class names */
  className?: string;

  /** Custom styles for the container */
  style?: React.CSSProperties;

  /** ARIA label for accessibility */
  'aria-label'?: string;

  /** ARIA description */
  'aria-describedby'?: string;

  /** Tab index */
  tabIndex?: number;

  /** Test ID for automated testing */
  'data-testid'?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if options are grouped
 */
export function isGroupedOptions(
  options: DropdownOption[] | DropdownGroup[]
): options is DropdownGroup[] {
  return options.length > 0 && 'options' in options[0];
}

/**
 * Type guard to check if value is array (multiple mode)
 */
export function isMultipleValue(value: string | string[] | undefined): value is string[] {
  return Array.isArray(value);
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Internal state for the dropdown component
 */
export interface DropdownState {
  isOpen: boolean;
  searchTerm: string;
  focusedIndex: number;
  selectedValues: string[];
}

/**
 * Props for the DropdownMenu component
 */
export interface DropdownMenuProps {
  options: DropdownOption[] | DropdownGroup[];
  selectedValues: string[];
  mode: DropdownMode;
  searchable: boolean;
  searchTerm: string;
  searchPlaceholder?: string;
  focusedIndex: number;
  showAddButton?: boolean;
  addButtonText?: string;
  maxHeight?: number | string;
  onSelect: (value: string) => void;
  onSearchChange: (term: string) => void;
  onAddClick?: () => void;
  onClose: () => void;
  renderOption?: (option: DropdownOption, selected: boolean) => React.ReactNode;
}

/**
 * Props for the DropdownTag component (used in multiple mode)
 */
export interface DropdownTagProps {
  label: string;
  onRemove: () => void;
  disabled?: boolean;
}
