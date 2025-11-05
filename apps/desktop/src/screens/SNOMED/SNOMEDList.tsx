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
} from '@iris/domain';
import { TabbedTable } from '../../design-system/components/tabbed-table';
import type { TabbedTableTab } from '../../design-system/components/tabbed-table';
import type { DataTableColumn } from '../../design-system/components/data-table/DataTable.types';
import { EyeIcon, PencilIcon as EditIcon, PlusIcon } from '@heroicons/react/24/outline';
import { snomedService } from '../../services/middleware';
import '../../styles/shared/List.css';

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
}

type SnomedTabs =
  | 'body-region'
  | 'body-structure'
  | 'topographic-modifier'
  | 'clinical-condition';

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
}: SNOMEDListProps) {

  const [activeTab, setActiveTab] = useState<SnomedTabs>('body-region');


  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
      currentPage: 1,
      totalRecords: 0
  });

  const [bodyRegions, setBodyRegions] = useState<SnomedBodyRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    switch(activeTab) {
      case 'body-region':
        loadBodyRegions();
        break;
      // Future cases for other tabs can be added here
      default:
        break;
    }
    }, [pagination.currentPage, pageSize, pagination.totalRecords, activeTab]);


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


  const mockBodyStructures: SnomedBodyStructure[] = useMemo(
    () => [
      {
        snomedCode: '21483005',
        displayName: 'Estrutura do coração',
        structureType: 'Órgão',
        description: 'Órgão muscular responsável pelo bombeamento de sangue',
        bodyRegionCode: '302509004',
        parentStructureCode: undefined,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        snomedCode: '39607008',
        displayName: 'Estrutura do pulmão',
        structureType: 'Órgão',
        description: 'Órgão responsável pela respiração',
        bodyRegionCode: '302509004',
        parentStructureCode: undefined,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ],
    []
  );

  const mockTopographicModifiers: SnomedTopographicalModifier[] = useMemo(
    () => [
      {
        code: '24028007',
        displayName: 'Direito',
        category: 'Lateralidade',
        description: 'Lado direito do corpo',
        isActive: true,
      },
      {
        code: '7771000',
        displayName: 'Esquerdo',
        category: 'Lateralidade',
        description: 'Lado esquerdo do corpo',
        isActive: true,
      },
    ],
    []
  );

  const mockClinicalConditions: ClinicalCondition[] = useMemo(
    () => [
      {
        snomedCode: '38341003',
        displayName: 'Hipertensão arterial',
        description: 'Pressão arterial elevada persistente',
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        snomedCode: '73211009',
        displayName: 'Diabetes mellitus',
        description: 'Distúrbio metabólico caracterizado por hiperglicemia',
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ],
    []
  );

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
        accessor: 'parentRegion.displayName',
        sortable: true,
        width: '15%',
        render: (value) => value || '-',
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
        id: 'structureType',
        label: 'Tipo',
        accessor: 'structureType',
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
        id: 'bodyRegionCode',
        label: 'Região',
        accessor: 'bodyRegionCode',
        sortable: true,
        width: '10%',
      },
      {
        id: 'parentStructureCode',
        label: 'Pertence a',
        accessor: 'parentStructureCode',
        sortable: true,
        width: '10%',
        render: (value) => value || '-',
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
        id: 'code',
        label: 'Código SNOMED',
        accessor: 'code',
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
        data: mockBodyStructures,
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
        data: mockTopographicModifiers,
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
        data: mockClinicalConditions,
        columns: clinicalConditionColumns,
        action: {
          label: 'Adicionar',
          icon: <PlusIcon />,
          onClick: onClinicalConditionAdd || (() => console.log('Add clinical condition clicked')),
          variant: 'primary',
        },
      },
    ],
    [
      bodyRegionColumns,
      bodyStructureColumns,
      topographicModifierColumns,
      clinicalConditionColumns,
      bodyRegions,
      mockBodyStructures,
      mockTopographicModifiers,
      mockClinicalConditions,
      onBodyRegionAdd,
      onBodyStructureAdd,
      onTopographicModifierAdd,
      onClinicalConditionAdd,
    ]
  );

  // Custom search filter
  const searchFilter = (item: any, query: string) => {
    const lowerQuery = query.toLowerCase();
    return (
      item.displayName?.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.snomedCode?.includes(query) ||
      item.code?.includes(query)
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
                    </div>
                </div>
            </div>
        );
    }


  return (
    <div className="list-screen">
      <TabbedTable
        tabs={tabs}
        selectedTab={activeTab}
        search={{
          placeholder: 'Buscar...',
          filter: searchFilter,
        }}
        onTabChange={(tab)=>{
          setActiveTab(tab as SnomedTabs);
        }}
        emptyMessage="Nenhum registro cadastrado."
        emptySearchMessage="Nenhum registro encontrado com os critérios de busca."
        striped
        hoverable
      />
    </div>
  );
}

export default SNOMEDList;
