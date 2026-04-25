// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSkinVariantsToMongoDB(skinVariantsData: any[], reportType?: string): any[] {
  // Group variants by section, condition, and gene
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedData = new Map<string, any>();

  for (const variant of skinVariantsData) {
    // Extract grouping keys
    const sectionId = variant.sectionId || 'unknown';
    const sectionName = variant.section_name || 'Unknown Section';
    const conditionName = variant.condition_name || 'Unknown Condition';
    const geneName = variant.gene || 'Unknown Gene';
    const rsId = variant.uniqueId || variant.rsId || 'unknown';

    // Create a unique key for grouping
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupKey = `${sectionId}_${conditionName}_${geneName}`;

    // Create variant object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantObj = {
      testVariant: variant.test_variant || variant.testVariant || 'unknown',
      reportVariant: variant.report_variant || variant.reportVariant || 'unknown',
      response: variant.response || 'unknown',
      status: variant.status || 'unknown',
      recommendation: variant.recommendation || '',
      interpretation: variant.interpretation || '',
      lifestyle: variant.lifestyle || '',
      miscellaneous: variant.miscellaneous || '',
    };

    // Check if we already have a document for this group
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (groupedData.has(groupKey)) {
      // Add variant to existing document
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingDoc = groupedData.get(groupKey)!;
      existingDoc.variants.push(variantObj);
      existingDoc.updatedAt = new Date();
    } else {
      // Create new document
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mongoVariant = {
        reportType: reportType || variant.reportType || 'Skin Health',
        section: {
          id: sectionId,
          name: sectionName,
        },
        condition: {
          name: conditionName,
          category: 'Skin',
        },
        gene: {
          name: geneName,
          rsId: rsId,
        },
        variants: [variantObj],
        effect: {
          type: variant.effect_type || variant.effect || 'Unknown',
          description: variant.effect_description || variant.description || '',
          magnitude: variant.magnitude || 0,
          significance: variant.significance || 'Unknown',
        },
        interpretation: {
          result: variant.interpretation_result || variant.result || 'Unknown',
          description: variant.interpretation_description || variant.description || '',
          recommendation: variant.recommendation || '',
        },
        // Skin-specific fields
        skinType: variant.skin_type || variant.skinType || '',
        skinCondition: variant.skin_condition || variant.skinCondition || '',
        skinCareConcern: variant.skin_care_concern || variant.skinCareConcern || '',
        skinVariantId: variant.skin_variant_id || variant.skinVariantId || '',
        // Additional skin fields
        skinPhenotype: variant.skin_phenotype || variant.skinPhenotype || '',
        skinSensitivity: variant.skin_sensitivity || variant.skinSensitivity || '',
        skinAging: variant.skin_aging || variant.skinAging || '',
        skinHydration: variant.skin_hydration || variant.skinHydration || '',
        skinElasticity: variant.skin_elasticity || variant.skinElasticity || '',
        skinPigmentation: variant.skin_pigmentation || variant.skinPigmentation || '',
        // Optional fields
        dosage: variant.dosage || '',
        notes: variant.notes || '',
        source: variant.source || 'Skin Health Report',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      groupedData.set(groupKey, mongoVariant);
    }
  }

    // Convert Map to array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Array.from(groupedData.values());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertSkinVariantsToMongoDB(skinVariantsData: any[], reportType?: string): Promise<any[]> {
  try {
    const { GeneticVariant } = await import('@/models/geneticVariant');
    const mappedData = mapSkinVariantsToMongoDB(skinVariantsData, reportType);
    
    // Use upsert to avoid duplicates based on unique combination
    const results = [];
    
    for (const variant of mappedData) {
      const upsertResult = await GeneticVariant.findOneAndUpdate(
        {
          reportType: variant.reportType,
          'condition.name': variant.condition.name,
          'gene.name': variant.gene.name,
          'variants.testVariant': variant.variants[0].testVariant,
        },
        variant,
        { upsert: true, new: true }
      );
      results.push(upsertResult);
    }
    
    return results;
  } catch (error) {
    console.error('Error inserting skin variants to MongoDB:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function validateSkinVariantsData(skinVariantsData: any[]): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  if (!Array.isArray(skinVariantsData)) {
    errors.push('Data must be an array');
    return { valid: false, errors };
  }
  
  if (skinVariantsData.length === 0) {
    errors.push('Data array cannot be empty');
    return { valid: false, errors };
  }
  
  // Validate required fields for skin variants
  const requiredFields = ['skin_type', 'skin_condition', 'gene', 'variant'];
  
  for (let i = 0; i < skinVariantsData.length; i++) {
    const variant = skinVariantsData[i];
    
    if (!variant || typeof variant !== 'object') {
      errors.push(`Record ${i + 1}: Invalid variant object`);
      continue;
    }
    
    // Check for required skin-specific fields
    for (const field of requiredFields) {
      if (!variant[field]) {
        errors.push(`Record ${i + 1}: Missing required field '${field}'`);
      }
    }
    
    // Validate data types
    if (variant.magnitude && typeof variant.magnitude !== 'number') {
      errors.push(`Record ${i + 1}: magnitude must be a number`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}