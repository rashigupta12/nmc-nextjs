

/*eslint-disable @typescript-eslint/no-explicit-any */

/*eslint-disable @typescript-eslint/no-unused-vars */

// src/lib/gene/geneVariantMapper.ts

interface MongoGeneticVariant {
  testId: string;
  testCode: string;
  testReportName: string;
  section: {
    id: string;
    name: string;
  };
  condition: {
    name: string;
    category: string;
  };
  gene: {
    name: string;
    rsIds: Array<{
      uniqueId: string;
      variants: Array<{
        testVariant: string;
        reportVariant: string;
        response: string;
        status: string;
        recommendation?: string;
        interpretation?: string;
        lifestyle?: string;
        miscellaneous?: string;
      }>;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface RsIdObject {
  uniqueId: string;
  variants: Array<{
    testVariant: string;
    reportVariant: string;
    response: string;
    status: string;
    recommendation?: string;
    interpretation?: string;
    lifestyle?: string;
    miscellaneous?: string;
  }>;
}

interface GeneticVariantDocument {
  testId: string;
  testCode: string;
  testReportName: string;
  condition: { name: string; category?: string };
  gene: { name: string; rsIds: RsIdObject[] };
  section: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<GeneticVariantDocument>;
}

export function mapGeneVariantsToMongoDB(geneVariantsData: any[]): MongoGeneticVariant[] {
  const groupedData = new Map<string, MongoGeneticVariant>();

  for (const variantData of geneVariantsData) {
    const testId = variantData.testId;
    const testCode = variantData.testCode;
    const testReportName = variantData.testReportName;

    // Section fallback
    let sectionId = variantData.sectionId || variantData.section?.id;
    let sectionName = variantData.section_name || variantData.section?.name;
    if (!sectionId || !sectionName) {
      sectionName = variantData.condition_name || 'General';
      sectionId = sectionName.toLowerCase().replace(/\s+/g, '_');
    }

    const conditionName = variantData.condition_name || variantData.condition?.name || 'Unknown Condition';
    const category = variantData.condition?.category || variantData.category || 'General';
    const geneName = variantData.gene || variantData.gene?.name || 'Unknown Gene';
    const rsId = variantData.uniqueId || variantData.gene?.rsId || 'unknown';

    // Build variant with defaults for required fields
    const variant = {
      testVariant: variantData.test_variant || variantData.testVariant || 'N/A',
      reportVariant: variantData.report_variant || variantData.reportVariant || 'N/A',
      response: variantData.response || 'N/A',
      status: variantData.status || 'N/A',
      recommendation: variantData.recommendation || '',
      interpretation: variantData.interpretation || '',
      lifestyle: variantData.lifestyle || '',
      miscellaneous: JSON.stringify({
        homo_hetro: variantData['homo/hetro'] || null,
        functional_nonfunctional: variantData['functional/nonfunctional'] || null,
        genotype: variantData.genotype || null,
        medication: variantData.medication || null,
      }),
    };

    const groupKey = `${testId}_${sectionId}_${conditionName}_${geneName}`;

    if (groupedData.has(groupKey)) {
      const existingDoc = groupedData.get(groupKey)!;
      const existingRsIdIndex = existingDoc.gene.rsIds.findIndex(rs => rs.uniqueId === rsId);

      if (existingRsIdIndex !== -1) {
        existingDoc.gene.rsIds[existingRsIdIndex].variants.push(variant);
      } else {
        existingDoc.gene.rsIds.push({
          uniqueId: rsId,
          variants: [variant],
        });
      }
      existingDoc.updatedAt = new Date();
    } else {
      groupedData.set(groupKey, {
        testId,
        testCode,
        testReportName,
        section: {
          id: sectionId,
          name: sectionName,
        },
        condition: {
          name: conditionName,
          category: category,
        },
        gene: {
          name: geneName,
          rsIds: [
            {
              uniqueId: rsId,
              variants: [variant],
            },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return Array.from(groupedData.values());
}

export async function insertGeneVariantsToMongoDB(geneVariantsData: any[]) {
  try {
    const validation = validateGeneVariantsData(geneVariantsData);
    if (!validation.valid) {
      throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
    }

    let GeneticVariant;
    try {
      const modelname = await import('../../models/geneticVariant');
      GeneticVariant = modelname.GeneticVariant;
    } catch (error) {
      throw new Error('Could not load GeneticVariant model');
    }

    const mappedVariants = mapGeneVariantsToMongoDB(geneVariantsData);
    const results = [];

    for (const variant of mappedVariants) {
      const existingDoc = await GeneticVariant.findOne({
        testId: variant.testId,
        'condition.name': variant.condition.name,
        'gene.name': variant.gene.name,
      }) as GeneticVariantDocument | null;

      if (existingDoc) {
        // Merge rsIds and variants
        const existingRsIdsMap = new Map<string, RsIdObject>(
          existingDoc.gene.rsIds.map((rs: RsIdObject) => [rs.uniqueId, rs])
        );

        for (const newRsId of variant.gene.rsIds) {
          if (existingRsIdsMap.has(newRsId.uniqueId)) {
            const existingRsId = existingRsIdsMap.get(newRsId.uniqueId)!;
            const existingVariantsMap = new Map(
              existingRsId.variants.map((v: any) => [v.testVariant, v])
            );
            for (const newVariant of newRsId.variants) {
              existingVariantsMap.set(newVariant.testVariant, newVariant);
            }
            existingRsId.variants = Array.from(existingVariantsMap.values());
          } else {
            existingRsIdsMap.set(newRsId.uniqueId, newRsId);
          }
        }

        existingDoc.gene.rsIds = Array.from(existingRsIdsMap.values());
        existingDoc.updatedAt = new Date();
        await existingDoc.save();
        results.push(existingDoc);
      } else {
        const newDoc = await GeneticVariant.create(variant);
        results.push(newDoc);
      }
    }

    return results;
  } catch (error) {
    console.error('Error inserting genetic variants:', error);
    throw error;
  }
}

export function validateGeneVariantsData(geneVariantsData: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(geneVariantsData) || geneVariantsData.length === 0) {
    errors.push('Data must be a non-empty array');
    return { valid: false, errors };
  }

  for (let i = 0; i < geneVariantsData.length; i++) {
    const variant = geneVariantsData[i];

    if (!variant || typeof variant !== 'object') {
      errors.push(`Record ${i + 1}: Invalid variant object`);
      continue;
    }

    if (!variant.testId) errors.push(`Record ${i + 1}: Missing testId`);
    if (!variant.testCode) errors.push(`Record ${i + 1}: Missing testCode`);
    if (!variant.testReportName) errors.push(`Record ${i + 1}: Missing testReportName`);
    if (!variant.condition_name && (!variant.condition || !variant.condition.name)) {
      errors.push(`Record ${i + 1}: Missing condition name`);
    }
    if (!variant.gene && (!variant.gene || !variant.gene.name)) {
      errors.push(`Record ${i + 1}: Missing gene name`);
    }
    if (!variant.uniqueId && (!variant.gene || !variant.gene.rsId)) {
      errors.push(`Record ${i + 1}: Missing uniqueId/rsId`);
    }

    const rsId = variant.uniqueId || variant.gene?.rsId;
    if (rsId && rsId !== 'unknown' && typeof rsId === 'string' && !/^rs\d+$/.test(rsId)) {
      errors.push(`Record ${i + 1}: Invalid rsID format: ${rsId}`);
    }
  }

  return { valid: errors.length === 0, errors };
}