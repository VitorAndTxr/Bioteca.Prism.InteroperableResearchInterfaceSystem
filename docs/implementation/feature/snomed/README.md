# SNOMED CT Feature Implementation

## 📊 Overall Progress: 0% (0/7 screens)

## 🏥 Screen Status

| Screen | Figma Node | Mobile | Desktop | API | Tests | Priority |
|--------|------------|--------|---------|-----|-------|----------|
| **Body Region** | 6804-12924 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🟢 Medium |
| **Body Structure** | 6804-13008 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🟢 Medium |
| **Topographic Modifier** | 6804-13092 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🟢 Medium |
| **Clinical Condition** | 6804-13176 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🟡 High |
| **Clinical Event** | 6804-13260 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🟡 High |
| **Medication** | 6804-13344 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🟡 High |
| **Allergy/Intolerance** | 6804-13428 | ⏸️ Pending | ⏸️ Pending | ❌ | ❌ | 🟡 High |

## 🏗️ SNOMED Architecture

SNOMED CT (Systematized Nomenclature of Medicine Clinical Terms) provides standardized medical terminology for the IRIS system.

### Shared Components
| Component | Purpose | Status | Location |
|-----------|---------|--------|----------|
| **SnomedSearch** | Autocomplete search with code lookup | ⏸️ | `packages/ui-components/organisms/SnomedSearch` |
| **SnomedTable** | Display SNOMED terms with hierarchy | ⏸️ | `packages/ui-components/organisms/SnomedTable` |
| **TermCard** | Display single SNOMED term details | ⏸️ | `packages/ui-components/molecules/TermCard` |
| **HierarchyTree** | Navigate SNOMED hierarchy | ⏸️ | `packages/ui-components/organisms/HierarchyTree` |
| **CodeDisplay** | Format and display SNOMED codes | ⏸️ | `packages/ui-components/atoms/CodeDisplay` |

## 📋 SNOMED Data Models

```typescript
interface SnomedTerm {
  id: string;
  conceptId: string;
  term: string;
  fullySpecifiedName: string;
  category: SnomedCategory;
  parents: string[];
  children: string[];
  synonyms: string[];
  definition?: string;
  isActive: boolean;
}

type SnomedCategory =
  | 'body_region'
  | 'body_structure'
  | 'topographic_modifier'
  | 'clinical_condition'
  | 'clinical_event'
  | 'medication'
  | 'allergy';

interface SnomedSearchResult {
  term: SnomedTerm;
  matchType: 'exact' | 'synonym' | 'partial';
  score: number;
}
```

## 🔍 Common Features Across All SNOMED Screens

### Search & Filter
- [ ] Autocomplete search by term or code
- [ ] Filter by active/inactive
- [ ] Filter by hierarchy level
- [ ] Recent searches history
- [ ] Favorite terms

### Display Options
- [ ] List view with pagination
- [ ] Tree/hierarchy view
- [ ] Card grid view
- [ ] Detailed term view modal
- [ ] Export selected terms

### Term Operations
- [ ] Select multiple terms
- [ ] Copy SNOMED code
- [ ] View full hierarchy
- [ ] See related terms
- [ ] Add to favorites

## 🏥 Clinical Condition Screen

### Specific Features
- Search conditions by symptoms
- ICD-10 mapping display
- Severity indicators
- Chronic/Acute classification
- Body system categorization

### Example Terms
```
- Hypertension (38341003)
- Diabetes mellitus (73211009)
- COVID-19 (840544004)
- Myocardial infarction (22298006)
```

## 💊 Medication Screen

### Specific Features
- Drug interaction warnings
- Dosage forms
- Route of administration
- Generic/Brand name toggle
- ATC code mapping

### Example Terms
```
- Paracetamol (387517004)
- Amoxicillin (372687004)
- Insulin (67866001)
- Aspirin (387458008)
```

## 🩺 Body Structure Screen

### Specific Features
- Anatomical hierarchy navigation
- 3D body visualization (future)
- Laterality options (left/right/bilateral)
- System grouping (cardiovascular, respiratory, etc.)

### Example Terms
```
- Heart (80891009)
- Liver (10200004)
- Left kidney (18639004)
- Femur (71341001)
```

## 📊 SNOMED Context

```typescript
interface SnomedContext {
  terms: Map<string, SnomedTerm>;
  searchResults: SnomedSearchResult[];
  selectedTerms: SnomedTerm[];
  favorites: string[];
  loading: boolean;
  error: Error | null;

  // Search Operations
  searchTerms: (query: string, category?: SnomedCategory) => Promise<SnomedSearchResult[]>;
  getTermById: (conceptId: string) => Promise<SnomedTerm>;

  // Hierarchy Operations
  getParents: (conceptId: string) => Promise<SnomedTerm[]>;
  getChildren: (conceptId: string) => Promise<SnomedTerm[]>;

  // User Operations
  toggleFavorite: (conceptId: string) => void;
  selectTerm: (term: SnomedTerm) => void;
  exportSelected: (format: 'csv' | 'json') => Promise<Blob>;
}
```

## 🎯 Implementation Commands

```bash
# Extract all SNOMED screens
claude /extract-feature snomed

# Implement shared SNOMED components
claude /implement-snomed-base

# Implement specific screen
claude /implement-screen ClinicalCondition snomed

# Generate SNOMED mock data
claude /generate-snomed-mocks
```

## 📈 Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Screens Complete | 0/7 | 7/7 |
| Terms in Database | 0 | 1000+ |
| Search Performance | - | <100ms |
| Test Coverage | 0% | 80% |

## 🔄 SNOMED Search Flow

```
1. User types in search box
   ↓
2. Debounced autocomplete (300ms)
   ↓
3. Query mock SNOMED database
   ↓
4. Return top 10 matches
   ↓
5. User selects term
   ↓
6. Display full term details
   ↓
7. Option to add to selection
   ↓
8. Save to research context
```

## 🧪 Test Scenarios

1. **Search Functionality**
   - Search by term name
   - Search by SNOMED code
   - Fuzzy matching works
   - Synonym search works

2. **Hierarchy Navigation**
   - Navigate parent/child relationships
   - Expand/collapse tree nodes
   - Show correct hierarchy levels

3. **Data Operations**
   - Select multiple terms
   - Export to CSV/JSON
   - Add/remove favorites
   - Copy codes to clipboard

## 📦 Mock Data Structure

```typescript
const mockSnomedData = {
  clinical_conditions: [
    {
      conceptId: "38341003",
      term: "Hypertension",
      fullySpecifiedName: "Hypertensive disorder (disorder)",
      parents: ["64572001"], // Disease
      synonyms: ["High blood pressure", "HTN"]
    }
    // ... more terms
  ],
  medications: [
    // ... medication terms
  ],
  body_structures: [
    // ... anatomy terms
  ]
  // ... other categories
};
```

## 🔗 Integration Points

- Research project configuration
- Patient record creation
- Clinical trial criteria
- Device sensor mapping
- Report generation

---

*Last Updated: 2025-01-17 10:35:00*
*Next Task: Implement SNOMED base components*