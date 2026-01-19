/**
 * SNOMEDList Component
 * Based on IRIS Design System - Figma nodes:
 * - Body Region: 6804-12924
 * - Body Structure: 6804-13008
 * - Topographic Modifier: 6804-13092
 * - Clinical Condition: 6804-13176
 *
 * Displays SNOMED CT medical terminology with CRUD operations.
 * Uses the generic TabbedTable component from the design system.
 */


import { useEffect, useMemo, useState } from 'react';
import {
  SnomedBodyRegion,
  SnomedBodyStructure,
  SnomedTopographicalModifier,
  ClinicalCondition,
  SnomedClinicalEvent,
  SnomedMedication,
  SnomedAllergyIntolerance,
} from '@iris/domain';
import { TabbedTable } from '../../design-system/components/tabbed-table';
import type { TabbedTableTab } from '../../design-system/components/tabbed-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import { snomedService } from '../../services/middleware';
import '../../styles/shared/List.css';
import Pagination from '@/design-system/components/pagination/Pagination';

export interface SNOMEDListProps {
  // Body Region handlers
  onBodyRegionAdd?: () => void;
  onBodyRegionEdit?: (region: SnomedBodyRegion) => void;
  onBodyRegionView?: (region: SnomedBodyRegion) => void;

  // Body Structure handlers
  onBodyStructureAdd?: () => void;
  onBodyStructureEdit?: (structure: SnomedBodyStructure) => void;
  onBodyStructureView?: (structure: SnomedBodyStructure) => void;

  // Topographic Modifier handlers
  onTopographicModifierAdd?: () => void;
  onTopographicModifierEdit?: (modifier: SnomedTopographicalModifier) => void;
  onTopographicModifierView?: (modifier: SnomedTopographicalModifier) => void;

  // Clinical Condition handlers
  onClinicalConditionAdd?: () => void;
  onClinicalConditionEdit?: (condition: ClinicalCondition) => void;
  onClinicalConditionView?: (condition: ClinicalCondition) => void;

  // Clinical Event handlers
  onClinicalEventAdd?: () => void;
  onClinicalEventEdit?: (event: SnomedClinicalEvent) => void;
  onClinicalEventView?: (event: SnomedClinicalEvent) => void;

  // Medication handlers
  onMedicationAdd?: () => void;
  onMedicationEdit?: (medication: SnomedMedication) => void;
  onMedicationView?: (medication: SnomedMedication) => void;

  // Allergy/Intolerance handlers
  onAllergyIntoleranceAdd?: () => void;
  onAllergyIntoleranceEdit?: (allergy: SnomedAllergyIntolerance) => void;
  onAllergyIntoleranceView?: (allergy: SnomedAllergyIntolerance) => void;
}

type SnomedTabs =
  | 'body-region'
  | 'body-structure'
  | 'topographic-modifier'
  | 'clinical-condition'
  | 'clinical-event'
  | 'medication'
  | 'allergy-intolerance';

// Friendly name mappings for AllergyIntolerance
const categoryDisplayNames: Record<string, string> = {
  food: 'Alimento',
  medication: 'Medicamento',
  environment: 'Ambiental',
  biologic: 'Biológico',
  other: 'Outro',
};

const typeDisplayNames: Record<string, string> = {
  allergy: 'Alergia',
  intolerance: 'Intolerância',
};

export function SNOMEDList({
  onBodyRegionAdd,
  onBodyRegionEdit,
  onBodyRegionView,
  onBodyStructureAdd,
  onBodyStructureEdit,
  onBodyStructureView,
  onTopographicModifierAdd,
  onTopographicModifierEdit,
  onTopographicModifierView,
  onClinicalConditionAdd,
  onClinicalConditionEdit,
  onClinicalConditionView,
  onClinicalEventAdd,
  onClinicalEventEdit,
  onClinicalEventView,
  onMedicationAdd,
  onMedicationEdit,
  onMedicationView,
  onAllergyIntoleranceAdd,
  onAllergyIntoleranceEdit,
  onAllergyIntoleranceView,
}: SNOMEDListProps) {

  const [activeTab, setActiveTab] = useState<SnomedTabs>('body-region');


  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
      currentPage: 1,
      totalRecords: 0
  });

  const [bodyRegions, setBodyRegions] = useState<SnomedBodyRegion[]>([]);
  const [bodyStructures, setBodyStructures] = useState<SnomedBodyStructure[]>([]);
  const [topographicModifiers, setTopographicModifiers] = useState<SnomedTopographicalModifier[]>([]);
  const [clinicalConditions, setClinicalConditions] = useState<ClinicalCondition[]>([]);
  const [clinicalEvents, setClinicalEvents] = useState<SnomedClinicalEvent[]>([]);
  const [medications, setMedications] = useState<SnomedMedication[]>([]);
  const [allergyIntolerances, setAllergyIntolerances] = useState<SnomedAllergyIntolerance[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    switch(activeTab) {
      case 'body-region':
        loadBodyRegions();
        break;
      case 'body-structure':
        loadBodyStructures();
        break;
      case 'topographic-modifier':
        loadTopographicModifiers();
        break;
      case 'clinical-condition':
        loadClinicalConditions();
        break;
      case 'clinical-event':
        loadClinicalEvents();
        break;
      case 'medication':
        loadMedications();
        break;
      case 'allergy-intolerance':
        loadAllergyIntolerances();
        break;
      default:
        break;
    }
    }, [pagination.currentPage, pageSize,  activeTab]);

  
  const loadBodyStructures = async () => {
    try{
      setLoading(true);
      setError(null);
     
      const response = await snomedService.getBodyStructurePaginated(pagination.currentPage, pageSize);

      console.log('Fetched body structures:', response);
      setBodyStructures(response.data || []);
      setPagination(prev => ({
          ...prev,
          totalRecords: response.totalRecords || 0
      }));
    } catch (err) {
      console.error('Failed to load body structures:', err);
      setError(err instanceof Error ? err.message : 'Failed to load body structures');
    } finally {
      setLoading(false);
    }
  }

  const loadBodyRegions = async () => {
    try{
      setLoading(true);
      setError(null);

      const response = await snomedService.getBodyRegionPaginated(pagination.currentPage, pageSize);

      console.log('Fetched body regions:', response);
      setBodyRegions(response.data || []);
      setPagination(prev => ({
          ...prev,
          totalRecords: response.totalRecords || 0
      }));

    } catch (err) {
      console.error('Failed to load body regions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load body regions');
    } finally {
      setLoading(false);
    }
  }

  const loadTopographicModifiers = async () => {
    try{
      setLoading(true);
      setError(null);
      // Placeholder for real data fetching

      const response = await snomedService.getTopographicalModifiersPaginated(pagination.currentPage, pageSize);
      console.log('Fetched topographic modifiers:', response);
      setTopographicModifiers(response.data || []);
      setPagination(prev => ({
          ...prev,
          totalRecords: response.totalRecords || 0
      }));
    } catch (err) {
      console.error('Failed to load topographic modifiers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load topographic modifiers');
    } finally {
      setLoading(false);
    }
  }

  const loadClinicalConditions = async () => {
    try{
      setLoading(true);
      setError(null);
      // Placeholder for real data fetching
      const response = await snomedService.getClinicalConditionsPaginated(pagination.currentPage, pageSize);
      console.log('Fetched clinical conditions:', response);
      setClinicalConditions(response.data || []);
      setPagination(prev => ({
          ...prev,
          totalRecords: response.totalRecords || 0
      }));
    } catch (err) {
      console.error('Failed to load clinical conditions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clinical conditions');
    } finally {
      setLoading(false);
    }
  }

  const loadClinicalEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await snomedService.getClinicalEventsPaginated(pagination.currentPage, pageSize);
      console.log('Fetched clinical events:', response);
      setClinicalEvents(response.data || []);
      setPagination(prev => ({
          ...prev,
          totalRecords: response.totalRecords || 0
      }));
    } catch (err) {
      console.error('Failed to load clinical events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clinical events');
    } finally {
      setLoading(false);
    }
  }

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await snomedService.getMedicationsPaginated(pagination.currentPage, pageSize);
      console.log('Fetched medications:', response);
      setMedications(response.data || []);
      setPagination(prev => ({
          ...prev,
          totalRecords: response.totalRecords || 0
      }));
    } catch (err) {
      console.error('Failed to load medications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  }

  const loadAllergyIntolerances = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await snomedService.getAllergyIntolerancesPaginated(pagination.currentPage, pageSize);
      console.log('Fetched allergy/intolerances:', response);
      setAllergyIntolerances(response.data || []);
      setPagination(prev => ({
          ...prev,
          totalRecords: response.totalRecords || 0
      }));
    } catch (err) {
      console.error('Failed to load allergy/intolerances:', err);
      setError(err instanceof Error ? err.message : 'Failed to load allergy/intolerances');
    } finally {
      setLoading(false);
    }
  }

  // Column definitions for Body Region
  const bodyRegionColumns: DataTableColumn<SnomedBodyRegion>[] = useMemo(
    () => [
      {
        id: 'snomedCode',
        label: 'Código SNOMED',
        accessor: 'snomedCode',
        sortable: true,
        width: '20%',
      },
      {
        id: 'displayName',
        label: 'Nome',
        accessor: 'displayName',
        sortable: true,
        width: '25%',
      },
      {
        id: 'description',
        label: 'Descrição',
        accessor: 'description',
        sortable: true,
        width: '30%',
      },
      {
        id: 'parentRegionCode',
        label: 'Pertence a',
        accessor: 'parentRegion',
        sortable: true,
        width: '15%',
        render: (_, region) => region.parentRegion?.displayName || '-',
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'snomedCode',
        width: '10%',
        align: 'center',
        render: (_, region) => (
          <div className="list-actions">
            <button
              className="action-button view"
              onClick={(e) => {
                e.stopPropagation();
                onBodyRegionView?.(region);
              }}
              aria-label="Visualizar região do corpo"
              title="Visualizar"
            >
              <EyeIcon />
            </button>
            <button
              className="action-button edit"
              onClick={(e) => {
                e.stopPropagation();
                onBodyRegionEdit?.(region);
              }}
              aria-label="Editar região do corpo"
              title="Editar"
            >
              <EditIcon />
            </button>
          </div>
        ),
      },
    ],
    [onBodyRegionEdit, onBodyRegionView]
  );

  // Column definitions for Body Structure
  const bodyStructureColumns: DataTableColumn<SnomedBodyStructure>[] = useMemo(
    () => [
      {
        id: 'snomedCode',
        label: 'Código SNOMED',
        accessor: 'snomedCode',
        sortable: true,
        width: '15%',
      },
      {
        id: 'displayName',
        label: 'Nome',
        accessor: 'displayName',
        sortable: true,
        width: '20%',
      },
      {
        id: 'type',
        label: 'Tipo',
        accessor: 'type',
        sortable: true,
        width: '15%',
      },
      {
        id: 'description',
        label: 'Descrição',
        accessor: 'description',
        sortable: true,
        width: '20%',
      },
      {
        id: 'bodyRegion',
        label: 'Região',
        accessor: 'bodyRegion',
        sortable: true,
        width: '10%',
        render: (_, structure) => structure.bodyRegion?.displayName || '-',
      },
      {
        id: 'parentStructure',
        label: 'Pertence a',
        accessor: 'parentStructure',
        sortable: true,
        width: '10%',
        render: (_, structure) => structure.parentStructure?.displayName || '-',
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'snomedCode',
        width: '10%',
        align: 'center',
        render: (_, structure) => (
          <div className="list-actions">
            <button
              className="action-button view"
              onClick={(e) => {
                e.stopPropagation();
                onBodyStructureView?.(structure);
              }}
              aria-label="Visualizar estrutura do corpo"
              title="Visualizar"
            >
              <EyeIcon />
            </button>
            <button
              className="action-button edit"
              onClick={(e) => {
                e.stopPropagation();
                onBodyStructureEdit?.(structure);
              }}
              aria-label="Editar estrutura do corpo"
              title="Editar"
            >
              <EditIcon />
            </button>
          </div>
        ),
      },
    ],
    [onBodyStructureEdit, onBodyStructureView]
  );

  // Column definitions for Topographic Modifier
  const topographicModifierColumns: DataTableColumn<SnomedTopographicalModifier>[] = useMemo(
    () => [
      {
        id: 'snomedCode',
        label: 'Código SNOMED',
        accessor: 'snomedCode',
        sortable: true,
        width: '20%',
      },
      {
        id: 'displayName',
        label: 'Nome',
        accessor: 'displayName',
        sortable: true,
        width: '25%',
      },
      {
        id: 'category',
        label: 'Categoria',
        accessor: 'category',
        sortable: true,
        width: '20%',
      },
      {
        id: 'description',
        label: 'Descrição',
        accessor: 'description',
        sortable: true,
        width: '25%',
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'code',
        width: '10%',
        align: 'center',
        render: (_, modifier) => (
          <div className="list-actions">
            <button
              className="action-button view"
              onClick={(e) => {
                e.stopPropagation();
                onTopographicModifierView?.(modifier);
              }}
              aria-label="Visualizar modificador topográfico"
              title="Visualizar"
            >
              <EyeIcon />
            </button>
            <button
              className="action-button edit"
              onClick={(e) => {
                e.stopPropagation();
                onTopographicModifierEdit?.(modifier);
              }}
              aria-label="Editar modificador topográfico"
              title="Editar"
            >
              <EditIcon />
            </button>
          </div>
        ),
      },
    ],
    [onTopographicModifierEdit, onTopographicModifierView]
  );

  // Column definitions for Clinical Condition
  const clinicalConditionColumns: DataTableColumn<ClinicalCondition>[] = useMemo(
    () => [
      {
        id: 'snomedCode',
        label: 'Código SNOMED',
        accessor: 'snomedCode',
        sortable: true,
        width: '20%',
      },
      {
        id: 'displayName',
        label: 'Nome',
        accessor: 'displayName',
        sortable: true,
        width: '30%',
      },
      {
        id: 'description',
        label: 'Descrição',
        accessor: 'description',
        sortable: true,
        width: '40%',
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'snomedCode',
        width: '10%',
        align: 'center',
        render: (_, condition) => (
          <div className="list-actions">
            <button
              className="action-button view"
              onClick={(e) => {
                e.stopPropagation();
                onClinicalConditionView?.(condition);
              }}
              aria-label="Visualizar condição clínica"
              title="Visualizar"
            >
              <EyeIcon />
            </button>
            <button
              className="action-button edit"
              onClick={(e) => {
                e.stopPropagation();
                onClinicalConditionEdit?.(condition);
              }}
              aria-label="Editar condição clínica"
              title="Editar"
            >
              <EditIcon />
            </button>
          </div>
        ),
      },
    ],
    [onClinicalConditionEdit, onClinicalConditionView]
  );

  // Column definitions for Clinical Event
  const clinicalEventColumns: DataTableColumn<SnomedClinicalEvent>[] = useMemo(
    () => [
      {
        id: 'snomedCode',
        label: 'Código SNOMED',
        accessor: 'snomedCode',
        sortable: true,
        width: '20%',
      },
      {
        id: 'displayName',
        label: 'Nome',
        accessor: 'displayName',
        sortable: true,
        width: '30%',
      },
      {
        id: 'description',
        label: 'Descrição',
        accessor: 'description',
        sortable: true,
        width: '40%',
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'snomedCode',
        width: '10%',
        align: 'center',
        render: (_, event) => (
          <div className="list-actions">
            <button
              className="action-button view"
              onClick={(e) => {
                e.stopPropagation();
                onClinicalEventView?.(event);
              }}
              aria-label="Visualizar evento clínico"
              title="Visualizar"
            >
              <EyeIcon />
            </button>
            <button
              className="action-button edit"
              onClick={(e) => {
                e.stopPropagation();
                onClinicalEventEdit?.(event);
              }}
              aria-label="Editar evento clínico"
              title="Editar"
            >
              <EditIcon />
            </button>
          </div>
        ),
      },
    ],
    [onClinicalEventEdit, onClinicalEventView]
  );

  // Column definitions for Medication
  const medicationColumns: DataTableColumn<SnomedMedication>[] = useMemo(
    () => [
      {
        id: 'snomedCode',
        label: 'Código SNOMED',
        accessor: 'snomedCode',
        sortable: true,
        width: '15%',
      },
      {
        id: 'medicationName',
        label: 'Nome',
        accessor: 'medicationName',
        sortable: true,
        width: '25%',
      },
      {
        id: 'activeIngredient',
        label: 'Princípio Ativo',
        accessor: 'activeIngredient',
        sortable: true,
        width: '25%',
      },
      {
        id: 'anvisaCode',
        label: 'Código ANVISA',
        accessor: 'anvisaCode',
        sortable: true,
        width: '20%',
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'snomedCode',
        width: '15%',
        align: 'center',
        render: (_, medication) => (
          <div className="list-actions">
            <button
              className="action-button view"
              onClick={(e) => {
                e.stopPropagation();
                onMedicationView?.(medication);
              }}
              aria-label="Visualizar medicação"
              title="Visualizar"
            >
              <EyeIcon />
            </button>
            <button
              className="action-button edit"
              onClick={(e) => {
                e.stopPropagation();
                onMedicationEdit?.(medication);
              }}
              aria-label="Editar medicação"
              title="Editar"
            >
              <EditIcon />
            </button>
          </div>
        ),
      },
    ],
    [onMedicationEdit, onMedicationView]
  );

  // Column definitions for Allergy/Intolerance
  const allergyIntoleranceColumns: DataTableColumn<SnomedAllergyIntolerance>[] = useMemo(
    () => [
      {
        id: 'snomedCode',
        label: 'Código SNOMED',
        accessor: 'snomedCode',
        sortable: true,
        width: '15%',
      },
      {
        id: 'substanceName',
        label: 'Substância',
        accessor: 'substanceName',
        sortable: true,
        width: '25%',
      },
      {
        id: 'category',
        label: 'Categoria',
        accessor: 'category',
        sortable: true,
        width: '20%',
        render: (value) => categoryDisplayNames[value as string] || value,
      },
      {
        id: 'type',
        label: 'Tipo',
        accessor: 'type',
        sortable: true,
        width: '15%',
        render: (value) => typeDisplayNames[value as string] || value,
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'snomedCode',
        width: '15%',
        align: 'center',
        render: (_, allergy) => (
          <div className="list-actions">
            <button
              className="action-button view"
              onClick={(e) => {
                e.stopPropagation();
                onAllergyIntoleranceView?.(allergy);
              }}
              aria-label="Visualizar alergia/intolerância"
              title="Visualizar"
            >
              <EyeIcon />
            </button>
            <button
              className="action-button edit"
              onClick={(e) => {
                e.stopPropagation();
                onAllergyIntoleranceEdit?.(allergy);
              }}
              aria-label="Editar alergia/intolerância"
              title="Editar"
            >
              <EditIcon />
            </button>
          </div>
        ),
      },
    ],
    [onAllergyIntoleranceEdit, onAllergyIntoleranceView]
  );

  // Tab configurations
  const tabs: TabbedTableTab[] = useMemo(
    () => [
      {
        value: 'body-region',
        label: 'Região do Corpo',
        title: 'Região do corpo',
        data: bodyRegions,
        columns: bodyRegionColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onBodyRegionAdd || (() => console.log('Add body region clicked')),
          variant: 'primary',
        },
      },
      {
        value: 'body-structure',
        label: 'Estrutura do corpo',
        title: 'Estrutura do corpo',
        data: bodyStructures,
        columns: bodyStructureColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onBodyStructureAdd || (() => console.log('Add body structure clicked')),
          variant: 'primary',
        },
      },
      {
        value: 'topographic-modifier',
        label: 'Modificador topográfico',
        title: 'Modificador topográfico',
        data: topographicModifiers,
        columns: topographicModifierColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onTopographicModifierAdd || (() => console.log('Add topographic modifier clicked')),
          variant: 'primary',
        },
      },
      {
        value: 'clinical-condition',
        label: 'Condição clínica',
        title: 'Condição clínica',
        data: clinicalConditions,
        columns: clinicalConditionColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onClinicalConditionAdd || (() => console.log('Add clinical condition clicked')),
          variant: 'primary',
        },
      },
      {
        value: 'clinical-event',
        label: 'Evento clínico',
        title: 'Evento clínico',
        data: clinicalEvents,
        columns: clinicalEventColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onClinicalEventAdd || (() => console.log('Add clinical event clicked')),
          variant: 'primary',
        },
      },
      {
        value: 'medication',
        label: 'Medicação',
        title: 'Medicação',
        data: medications,
        columns: medicationColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onMedicationAdd || (() => console.log('Add medication clicked')),
          variant: 'primary',
        },
      },
      {
        value: 'allergy-intolerance',
        label: 'Alergia/Intolerância',
        title: 'Alergia/Intolerância',
        data: allergyIntolerances,
        columns: allergyIntoleranceColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onAllergyIntoleranceAdd || (() => console.log('Add allergy/intolerance clicked')),
          variant: 'primary',
        },
      },
    ],
    [
      bodyRegionColumns,
      bodyStructureColumns,
      topographicModifierColumns,
      clinicalConditionColumns,
      clinicalEventColumns,
      medicationColumns,
      allergyIntoleranceColumns,
      bodyRegions,
      bodyStructures,
      topographicModifiers,
      clinicalConditions,
      clinicalEvents,
      medications,
      allergyIntolerances,
      onBodyRegionAdd,
      onBodyStructureAdd,
      onTopographicModifierAdd,
      onClinicalConditionAdd,
      onClinicalEventAdd,
      onMedicationAdd,
      onAllergyIntoleranceAdd,
    ]
  );

  // Custom search filter
  const searchFilter = (item: Record<string, unknown>, query: string) => {
    const lowerQuery = query.toLowerCase();
    return (
      // Common fields
      (item.displayName as string)?.toLowerCase().includes(lowerQuery) ||
      (item.description as string)?.toLowerCase().includes(lowerQuery) ||
      (item.snomedCode as string)?.includes(query) ||
      (item.code as string)?.includes(query) ||
      // Medication-specific fields
      (item.medicationName as string)?.toLowerCase().includes(lowerQuery) ||
      (item.activeIngredient as string)?.toLowerCase().includes(lowerQuery) ||
      (item.anvisaCode as string)?.includes(query) ||
      // AllergyIntolerance-specific fields
      (item.substanceName as string)?.toLowerCase().includes(lowerQuery) ||
      (item.category as string)?.toLowerCase().includes(lowerQuery) ||
      (item.type as string)?.toLowerCase().includes(lowerQuery)
    );
  };

  if (error) {
      return (
          <div className="list-screen">
              <div className="error-message" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                  {error && activeTab === 'body-region' && <p>Erro ao carregar regiões do corpo: {error}</p>}
                  {error && activeTab === 'body-structure' && <p>Erro ao carregar estruturas do corpo: {error}</p>}
                  {error && activeTab === 'topographic-modifier' && <p>Erro ao carregar modificadores topográficos: {error}</p>}
                  {error && activeTab === 'clinical-condition' && <p>Erro ao carregar condições clínicas: {error}</p>}
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      {error && activeTab === 'body-region' && (
                          <button
                              onClick={loadBodyRegions}
                              style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                              }}
                          >
                              Recarregar regiões do corpo
                          </button>
                      )}
                      {error && activeTab === 'body-structure' && (
                          <button
                              onClick={loadBodyStructures}
                              style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                              }}
                          >
                              Recarregar estruturas do corpo
                          </button>
                      )}
                      {error && activeTab === 'topographic-modifier' && (
                          <button
                              onClick={loadTopographicModifiers}
                              style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                              }}
                          >
                              Recarregar modificadores topográficos
                          </button>
                      )}
                      {error && activeTab === 'clinical-condition' && (
                          <button
                              onClick={loadClinicalConditions}
                              style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                              }}
                          >
                              Recarregar condições clínicas
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  }


  return (
    <div className="list-screen">
      {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
              {loading && activeTab === 'body-region' && 'Carregando regiões do corpo... '}
              {loading && activeTab === 'body-structure' && 'Carregando estruturas do corpo...'}
              {loading && activeTab === 'topographic-modifier' && 'Carregando modificadores topográficos...'}
              {loading && activeTab === 'clinical-condition' && 'Carregando condições clínicas...'}
          </div>
      )}
      {!loading && (
          <TabbedTable
              tabs={tabs}
              search={{
                  placeholder: 'Buscar...',
                  filter: searchFilter,
              }}
              onTabChange={async (tab)=>{
                  setActiveTab(tab as SnomedTabs);
              }}
              selectedTab={activeTab}
              emptyMessage="Nenhum registro cadastrado."
              emptySearchMessage="Nenhum registro encontrado com os critérios de busca."
              striped
              hoverable
          />
      )}

      {!loading && pagination.totalRecords > pageSize && 
        <Pagination 
          setPagination={setPagination} 
          pagination={pagination} 
          pageSize={pageSize} 
        />
      }
    </div>
  );
}

export default SNOMEDList;





