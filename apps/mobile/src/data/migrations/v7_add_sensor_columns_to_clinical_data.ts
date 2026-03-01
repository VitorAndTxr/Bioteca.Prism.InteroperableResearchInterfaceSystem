export const v7_add_sensor_columns_to_clinical_data = `
ALTER TABLE clinical_data ADD COLUMN sensor_ids TEXT DEFAULT '[]';
ALTER TABLE clinical_data ADD COLUMN sensor_names TEXT DEFAULT '[]';
`;
