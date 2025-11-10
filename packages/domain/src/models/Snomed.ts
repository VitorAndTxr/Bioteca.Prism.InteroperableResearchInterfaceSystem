/**
 * SNOMED CT Domain Models
 *
 * TypeScript representations of SNOMED CT entities from Bioteca.Prism.Domain
 * Used for managing standardized medical terminology in the PRISM ecosystem
 */

/**
 * Represents a SNOMED CT body region code
 * Maps to: Bioteca.Prism.Domain.Entities.Snomed.SnomedBodyRegion
 */
export interface SnomedBodyRegion {
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Display name */
  displayName: string;

    /** Description */
  description: string;

  /** Parent region code (for hierarchical structure) */
  parentRegion?: SnomedBodyRegion;

}




export interface AddSnomedBodyRegionPayload extends Record<string, unknown>{
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Display name */
  displayName: string;

    /** Description */
  description: string;

  /** Parent region code */
  parentRegion?: string;
}

/**
 * Represents a SNOMED CT body structure code
 * Maps to: Bioteca.Prism.Domain.Entities.Snomed.SnomedBodyStructure
 */
export interface SnomedBodyStructure {
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Body region code */
  parentRegion: SnomedBodyRegion;

  /** Display name */
  displayName: string;

  /** Structure type */
  structureType: string;

  /** Parent structure code (for hierarchical structure) */
  parentStructureCode?: SnomedBodyStructure;

  /** Description */
  description: string;
}


export interface AddSnomedBodyStructurePayload extends Record<string, unknown>{
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Body region code */
  bodyRegionCode: string;
  /** Display name */
  displayName: string;

  /** Structure type */
  type: string;
  /** Parent structure code (for hierarchical structure) */
  parentStructureCode?: string;

  /** Description */
  description: string;

}

/**
 * Represents a SNOMED CT topographical modifier code
 * Maps to: Bioteca.Prism.Domain.Entities.Snomed.SnomedTopographicalModifier
 */
export interface SnomedTopographicalModifier {
  /** SNOMED code (primary key) */
  code: string;

  /** Display name */
  displayName: string;

  /** Category */
  category: string;

  /** Description */
  description: string;

  /** Whether this code is active */
  isActive: boolean;
}

/**
 * Represents a SNOMED CT clinical condition code
 * Maps to: Bioteca.Prism.Domain.Entities.Clinical.ClinicalCondition
 */
export interface ClinicalCondition {
  /** SNOMED CT code (primary key) */
  snomedCode: string;

  /** Display name for the clinical condition */
  displayName: string;

  /** Detailed description of the clinical condition */
  description: string;

  /** Whether this condition is currently active in SNOMED CT */
  isActive: boolean;

  /** When this condition was created */
  createdAt?: Date;

  /** When this condition was last updated */
  updatedAt?: Date;
}
