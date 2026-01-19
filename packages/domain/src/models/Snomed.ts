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

  /** Display name */
  displayName: string;

  /** Description */
  description: string;

  /** Structure type (e.g., "Órgão", "Tecido", "Músculo") */
  type: string;

  /** Body region this structure belongs to */
  bodyRegion?: SnomedBodyRegion;

  /** Parent structure (for hierarchical structure) */
  parentStructure?: SnomedBodyStructure;
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
export interface SnomedTopographicalModifier extends Record<string, unknown>{
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Display name */
  displayName: string;

  /** Category */
  category: string;

  /** Description */
  description: string;
}

/**
 * Represents a SNOMED CT clinical condition code
 * Maps to: Bioteca.Prism.Domain.Entities.Clinical.ClinicalCondition
 */
export interface ClinicalCondition extends Record<string, unknown>{
  /** SNOMED CT code (primary key) */
  snomedCode: string;

  /** Display name for the clinical condition */
  displayName: string;

  /** Detailed description of the clinical condition */
  description: string;
}

/**
 * Represents a SNOMED CT clinical event code
 */
export interface SnomedClinicalEvent extends Record<string, unknown> {
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Display name */
  displayName: string;

  /** Description */
  description: string;
}

/**
 * Represents a SNOMED CT medication code
 * Maps to: Bioteca.Prism.Domain.DTOs.Snomed.SnomedMedicationDTO
 */
export interface SnomedMedication extends Record<string, unknown> {
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Medication name */
  medicationName: string;

  /** Active pharmaceutical ingredient */
  activeIngredient: string;

  /** ANVISA (Brazilian Health Regulatory Agency) code */
  anvisaCode: string;
}

/**
 * Represents a SNOMED CT allergy/intolerance code
 * Maps to: Bioteca.Prism.Domain.DTOs.Snomed.SnomedAllergyIntoleranceDTO
 */
export interface SnomedAllergyIntolerance extends Record<string, unknown> {
  /** SNOMED code (primary key) */
  snomedCode: string;

  /** Category of the allergy/intolerance (e.g., food, medication, environment) */
  category: string;

  /** Name of the substance causing the allergy/intolerance */
  substanceName: string;

  /** Type (allergy or intolerance) */
  type: string;
}

// ============================================================================
// Update Payload Types
// ============================================================================

/**
 * Payload for updating a SNOMED CT body region
 */
export interface UpdateSnomedBodyRegionPayload extends Record<string, unknown> {
  /** Display name */
  displayName: string;

  /** Description */
  description: string;

  /** Parent region code (optional) */
  parentRegionCode?: string;
}

/**
 * Payload for updating a SNOMED CT body structure
 */
export interface UpdateSnomedBodyStructurePayload extends Record<string, unknown> {
  /** Display name */
  displayName: string;

  /** Description */
  description: string;

  /** Structure type */
  type: string;

  /** Body region code (optional) */
  bodyRegionCode?: string;

  /** Parent structure code (optional) */
  parentStructureCode?: string;
}

/**
 * Payload for updating a SNOMED CT topographical modifier
 */
export interface UpdateSnomedTopographicalModifierPayload extends Record<string, unknown> {
  /** Display name */
  displayName: string;

  /** Description */
  description: string;

  /** Category */
  category: string;
}

/**
 * Payload for updating a SNOMED CT clinical condition
 */
export interface UpdateSnomedClinicalConditionPayload extends Record<string, unknown> {
  /** Display name */
  displayName: string;

  /** Description */
  description: string;
}

/**
 * Payload for updating a SNOMED CT clinical event
 */
export interface UpdateSnomedClinicalEventPayload extends Record<string, unknown> {
  /** Display name */
  displayName: string;

  /** Description */
  description: string;
}

/**
 * Payload for updating a SNOMED CT medication
 */
export interface UpdateSnomedMedicationPayload extends Record<string, unknown> {
  /** Medication name */
  medicationName: string;

  /** Active pharmaceutical ingredient */
  activeIngredient: string;

  /** ANVISA code */
  anvisaCode: string;
}

/**
 * Payload for updating a SNOMED CT allergy/intolerance
 */
export interface UpdateSnomedAllergyIntolerancePayload extends Record<string, unknown> {
  /** Category of the allergy/intolerance */
  category: string;

  /** Name of the substance */
  substanceName: string;

  /** Type (allergy or intolerance) */
  type: string;
}
