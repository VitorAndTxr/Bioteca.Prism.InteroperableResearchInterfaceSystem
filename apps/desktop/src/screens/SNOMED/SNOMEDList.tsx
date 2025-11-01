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

import { useMemo } from 'react';
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
  // Mock data - Replace with real API calls
  const mockBodyRegions: SnomedBodyRegion[] = useMemo(
    () => [
      {
        snomedCode: '123037004',
        displayName: 'Estrutura da cabeça',
        description: 'Região anatômica da cabeça',
        parentRegionCode: undefined,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        snomedCode: '302509004',
        displayName: 'Estrutura do tronco',
        description: 'Região anatômica do tronco',
        parentRegionCode: undefined,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ],
    []
  );

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
        accessor: 'parentRegionCode',
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
        data: mockBodyRegions,
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
      mockBodyRegions,
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

  return (
    <div className="list-screen">
      <TabbedTable
        tabs={tabs}
        search={{
          placeholder: 'Buscar...',
          filter: searchFilter,
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
