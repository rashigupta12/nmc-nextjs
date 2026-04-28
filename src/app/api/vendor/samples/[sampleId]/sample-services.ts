// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GeneticVariant } from '@/models/geneticVariant';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GeneReportTemp } from '@/models/geneReportTemp';
import { db } from '@/db';
import { TestCatalogTable, SamplesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Helper function to normalize gene names for comparison
 */
function normalizeGeneName(gene: string): string {
  return gene
    .trim()
    .toLowerCase()
    .replace(/\s+and\s+/g, ' and ')
    .replace(/\s+/g, ' ');
}

/**
 * Returns the complement of a DNA genotype string
 * e.g. "TT" → "AA", "CC" → "GG", "TG" → "AC", "GA" → "CT"
 * Handles slash-format too: "AG/GA" → "TC/CT"
 */
function complementGenotype(genotype: string): string {
  const complementMap: Record<string, string> = { A: 'T', T: 'A', C: 'G', G: 'C' };
  return genotype
    .split('')
    .map(base => complementMap[base] ?? base)
    .join('');
}

/**
 * Find a matching variant from an rsId record using a 4-step fallback strategy:
 * 1. Exact match
 * 2. Reversed genotype (e.g. "GA" → "AG")
 * 3. Slash format (e.g. "AG" matches "AG/GA")
 * 4. Complement strand (e.g. "TT" → "AA", "CC" → "GG")
 *
 * Returns { match, matchType } where matchType describes how it was found.
 */
function findVariantMatch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rsIdRecord: any,
  genotype: string,
  uniqueId: string
): { match: any; matchType: string } | null {
  if (!rsIdRecord.variants || !Array.isArray(rsIdRecord.variants)) return null;

  const reversedGenotype = genotype.split('').reverse().join('');
  const comp = complementGenotype(genotype);
  const compReversed = comp.split('').reverse().join('');

  // 1. Exact match
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exactMatch = rsIdRecord.variants.find((v: any) => v.testVariant === genotype);
  if (exactMatch) {
    return { match: exactMatch, matchType: 'exact' };
  }

  // 2. Reversed genotype
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exactMatchReversed = rsIdRecord.variants.find((v: any) => v.testVariant === reversedGenotype);
  if (exactMatchReversed) {
    console.log(`🔄 Using reversed genotype match for ${uniqueId}: "${genotype}" → "${reversedGenotype}"`);
    return { match: exactMatchReversed, matchType: 'reversed' };
  }

  // 3. Slash format (original or reversed within a slash-delimited master variant)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slashFormatMatch = rsIdRecord.variants.find((v: any) => {
    const mv: string = v.testVariant;
    return mv.includes('/') && (mv.includes(genotype) || mv.includes(reversedGenotype));
  });
  if (slashFormatMatch) {
    console.log(`🔄 Using slash format match for ${uniqueId}: "${genotype}" matched "${slashFormatMatch.testVariant}"`);
    return { match: slashFormatMatch, matchType: 'slash' };
  }

  // 4. Complement strand (handles opposite-strand reporting from sequencer)
  console.log(`🔄 Trying complement strand for ${uniqueId}: "${genotype}" → comp="${comp}", compReversed="${compReversed}"`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const complementMatch = rsIdRecord.variants.find((v: any) => {
    const mv: string = v.testVariant;
    return (
      mv === comp ||
      mv === compReversed ||
      (mv.includes('/') && (mv.includes(comp) || mv.includes(compReversed)))
    );
  });
  if (complementMatch) {
    console.log(`✅ Complement strand match for ${uniqueId}: "${genotype}" → "${comp}" matched "${complementMatch.testVariant}"`);
    return { match: complementMatch, matchType: 'complement' };
  }

  return null;
}

/**
 * Validate genetic data against master variants
 * Uses testCode directly from the test catalog
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function validateGeneticData(geneticData: any[], testCode: string) {
  console.log('🧬 Starting genetic data validation for test code:', testCode);
  console.log('📊 Total records to validate:', geneticData.length);

  console.log('🔍 Checking master data for testCode:', testCode);
  const masterDataCount = await GeneticVariant.countDocuments({ testCode });
  console.log('📊 Total master records found for', testCode + ':', masterDataCount);

  if (masterDataCount > 0) {
    const masterData = await GeneticVariant.find({ testCode }).lean();
    console.log('📋 Master data summary:', {
      totalRecords: masterData.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      uniqueGenes: [...new Set(masterData.map((m: any) => m.gene.name))],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      uniqueConditions: [...new Set(masterData.map((m: any) => m.condition.name))],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      uniqueSections: [...new Set(masterData.map((m: any) => m.section.name))],
    });

    // Show all uniqueId values in master data
    const allUniqueIds: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    masterData.forEach((m: any) => {
      if (m.gene.rsIds && Array.isArray(m.gene.rsIds)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.gene.rsIds.forEach((rs: any) => {
          if (rs.uniqueId) allUniqueIds.push(rs.uniqueId);
        });
      }
    });
    console.log('🆔 All uniqueId values in master data:', allUniqueIds);
  }

  const validationResults = {
    totalRecords: geneticData.length,
    validRecords: 0,
    invalidRecords: 0,
    errors: [] as string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validData: [] as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invalidData: [] as any[],
  };

  for (let i = 0; i < geneticData.length; i++) {
    const record = geneticData[i];
    const { uniqueId, gene, conditionName, genotype } = record;

    console.log(`🔍 Validating record ${i + 1}/${geneticData.length}:`, {
      uniqueId,
      gene,
      conditionName,
      genotype,
    });

    // Check if uniqueId exists in master table using testCode
    const masterRecord = await GeneticVariant.findOne({
      testCode,
      'gene.rsIds.uniqueId': uniqueId,
    }).lean();

    if (!masterRecord) {
      console.log(`❌ uniqueId ${uniqueId} not found in master table`);
      validationResults.invalidRecords++;
      validationResults.errors.push(
        `Invalid uniqueId: ${uniqueId} not found in master table for ${testCode}`
      );
      validationResults.invalidData.push({
        ...record,
        validationError: `uniqueId ${uniqueId} not found in master table`,
      });
      continue;
    }

    console.log(`✅ Found master record for ${uniqueId}:`, {
      gene: masterRecord.gene.name,
      condition: masterRecord.condition.name,
      section: masterRecord.section.name,
    });

    // Check if gene matches master table (normalized comparison)
    if (
      masterRecord.gene.name &&
      normalizeGeneName(masterRecord.gene.name) !== normalizeGeneName(gene)
    ) {
      console.log(
        `⚠️ Gene mismatch: uploaded "${normalizeGeneName(gene)}" vs master "${normalizeGeneName(masterRecord.gene.name)}"`
      );
      validationResults.invalidRecords++;
      validationResults.errors.push(
        `Gene mismatch for ${uniqueId}: uploaded "${gene}" vs master "${masterRecord.gene.name}"`
      );
      validationResults.invalidData.push({
        ...record,
        validationError: `Gene mismatch: uploaded "${gene}" vs master "${masterRecord.gene.name}"`,
      });
      continue;
    }

    // Check if condition matches (if provided) — warning only, not a hard failure
    if (
      conditionName &&
      masterRecord.condition.name &&
      masterRecord.condition.name !== conditionName
    ) {
      console.log(
        `⚠️ Condition mismatch: uploaded "${conditionName}" vs master "${masterRecord.condition.name}"`
      );
      validationResults.errors.push(
        `Condition mismatch for ${uniqueId}: uploaded "${conditionName}" vs master "${masterRecord.condition.name}"`
      );
    }

    // Find the specific rsId record within the nested structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rsIdRecord = masterRecord.gene.rsIds.find((rs: any) => rs.uniqueId === uniqueId);

    if (!rsIdRecord) {
      console.log(`❌ rsId ${uniqueId} not found in nested rsIds array`);
      validationResults.invalidRecords++;
      validationResults.errors.push(
        `rsId ${uniqueId} not found in nested rsIds array for gene ${masterRecord.gene.name}`
      );
      validationResults.invalidData.push({
        ...record,
        validationError: `rsId ${uniqueId} not found in nested structure`,
      });
      continue;
    }

    console.log(`✅ Found rsId record with ${rsIdRecord.variants.length} variants`);

    // Find variant using 4-step fallback (exact → reversed → slash → complement)
    const result = findVariantMatch(rsIdRecord, genotype, uniqueId);

    if (!result) {
      console.log(
        `❌ Genotype "${genotype}" not found in master table (tried exact, reversed, slash, complement)`
      );
      validationResults.invalidRecords++;
      validationResults.errors.push(
        `Invalid genotype for ${uniqueId}: "${genotype}" not found in master table ` +
          `(tried exact, reversed, slash format, and complement strand)`
      );
      validationResults.invalidData.push({
        ...record,
        validationError: `Genotype "${genotype}" not found in master table for ${uniqueId}`,
      });
      continue;
    }

    const { match: matchedVariant, matchType } = result;

    // Log non-exact matches as informational warnings
    if (matchType === 'reversed') {
      validationResults.errors.push(
        `Genotype for ${uniqueId}: "${genotype}" not found, but reversed "${genotype
          .split('')
          .reverse()
          .join('')}" matched master table`
      );
    } else if (matchType === 'slash') {
      validationResults.errors.push(
        `Genotype for ${uniqueId}: "${genotype}" not found, but slash format "${matchedVariant.testVariant}" matched master table`
      );
    } else if (matchType === 'complement') {
      validationResults.errors.push(
        `Genotype for ${uniqueId}: "${genotype}" matched via complement strand "${complementGenotype(
          genotype
        )}" → master "${matchedVariant.testVariant}"`
      );
    }

    console.log(`✅ Genotype match found for ${uniqueId} (${matchType}):`, {
      testVariant: matchedVariant.testVariant,
      reportVariant: matchedVariant.reportVariant,
      response: matchedVariant.response,
      status: matchedVariant.status,
      recommendation: matchedVariant.recommendation,
      interpretation: matchedVariant.interpretation,
    });

    validationResults.validRecords++;
    validationResults.validData.push({
      ...record,
      masterData: {
        gene: masterRecord.gene.name.trim(),
        condition_name: masterRecord.condition.name,
        response: matchedVariant.response,
        status: matchedVariant.status,
        matchedVariant: matchedVariant.testVariant,
        matchType,
        recommendation: matchedVariant.recommendation || '',
        interpretation: matchedVariant.interpretation || '',
      },
    });
  }

  console.log('📊 Validation Summary:', {
    totalRecords: validationResults.totalRecords,
    validRecords: validationResults.validRecords,
    invalidRecords: validationResults.invalidRecords,
    errorCount: validationResults.errors.length,
  });

  return validationResults;
}

/**
 * Save processed genetic data to temp collection
 * Now uses testId to fetch test catalog information and sample UUID
 */
export async function saveWellnessDataToTemp(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validData: any[],
  patientId: string,
  sampleDisplayId: string,
  testId: string
) {
  console.log('💾 saveWellnessDataToTemp called with:', {
    patientId,
    sampleDisplayId,
    testId,
    validDataLength: validData.length,
  });

  // Validate input parameters
  if (!patientId) {
    throw new Error('patientId is required and cannot be empty');
  }
  if (!sampleDisplayId) {
    throw new Error('sampleDisplayId is required and cannot be empty');
  }
  if (!testId) {
    throw new Error('testId is required and cannot be empty');
  }
  if (!validData || validData.length === 0) {
    console.log('⚠️ No valid data provided to save');
    return [];
  }

  // Fetch test catalog information from Neon
  const [testCatalog] = await db
    .select({
      testCode: TestCatalogTable.testCode,
      testName: TestCatalogTable.testName,
    })
    .from(TestCatalogTable)
    .where(eq(TestCatalogTable.id, testId))
    .limit(1);

  if (!testCatalog) {
    throw new Error(`Test catalog not found for testId: ${testId}`);
  }

  // Fetch the actual sample UUID from Neon using the display sampleId
  const [sample] = await db
    .select({
      id: SamplesTable.id,
      sampleId: SamplesTable.sampleId,
    })
    .from(SamplesTable)
    .where(eq(SamplesTable.sampleId, sampleDisplayId))
    .limit(1);

  if (!sample) {
    throw new Error(`Sample not found for sampleId: ${sampleDisplayId}`);
  }

  console.log('📋 Test catalog info:', {
    testCode: testCatalog.testCode,
    testName: testCatalog.testName,
  });

  console.log('📋 Sample info:', {
    uuid: sample.id,
    displayId: sample.sampleId,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tempRecords: any[] = [];

  for (const record of validData) {
    console.log(`💾 Processing record for uniqueId: ${record.uniqueId}`);

    // Find the exact variant match to get proper response and status
    const masterRecord = await GeneticVariant.findOne({
      testCode: testCatalog.testCode,
      'gene.rsIds.uniqueId': record.uniqueId,
    }).lean();

    if (!masterRecord) {
      console.log(`❌ Master record not found for uniqueId: ${record.uniqueId}`);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rsIdRecord = masterRecord.gene.rsIds.find((rs: any) => rs.uniqueId === record.uniqueId);
    if (!rsIdRecord) {
      console.log(`❌ rsId record not found for uniqueId: ${record.uniqueId}`);
      continue;
    }

    // Find the matched variant using the same 4-step fallback
    const result = findVariantMatch(rsIdRecord, record.genotype, record.uniqueId);

    if (!result) {
      console.log(
        `❌ No matched variant found for ${record.uniqueId} (${record.genotype}) during save — skipping`
      );
      continue;
    }

    const { match: matchedVariant, matchType } = result;
    console.log(`💾 Variant match type for ${record.uniqueId}: ${matchType}`);

    // Extract clean genotype: strip slash format from the uploaded value if present
    let cleanGenotype = record.genotype;
    if (cleanGenotype.includes('/')) {
      console.log(`🔄 Converting slash format "${cleanGenotype}" to clean genotype`);
      cleanGenotype = cleanGenotype.split('/')[0];
      console.log(`✅ Clean genotype: "${cleanGenotype}"`);
    }

    // Ensure all required fields have values - use actual data from master, not placeholders
    const tempRecordData = {
      // Store UUID in lowercase as per schema (uppercase: false)
      patientId: patientId.toLowerCase(),
      sampleId: sample.id.toLowerCase(), // Use the UUID, not the display ID
      testId: testId.toLowerCase(),
      testCode: testCatalog.testCode,
      testReportName: testCatalog.testName,
      uniqueId: record.uniqueId,
      gene: masterRecord.gene.name.trim().toUpperCase(),
      test_variant: cleanGenotype.toUpperCase(),
      report_variant: matchedVariant.reportVariant || '',
      sectionId: masterRecord.section.id || '',
      condition_name: record.conditionName || masterRecord.condition.name,
      response: matchedVariant.response || '',
      recommendation: matchedVariant.recommendation || '',
      interpretation: matchedVariant.interpretation || '',
      status: matchedVariant.status || '',
      modifiedDate: new Date(),
    };

    console.log(`💾 Creating GeneReportTemp record:`, {
      ...tempRecordData,
      recommendation: tempRecordData.recommendation.substring(0, 100) + '...',
      interpretation: tempRecordData.interpretation.substring(0, 100) + '...',
    });

    const tempRecord = new GeneReportTemp(tempRecordData);
    tempRecords.push(tempRecord);
  }

  // Save all records to temp collection
  if (tempRecords.length > 0) {
    console.log(`💾 Saving ${tempRecords.length} records to GeneReportTemp collection...`);
    const savedRecords = await GeneReportTemp.insertMany(tempRecords);
    console.log(`✅ Successfully saved ${savedRecords.length} records`);

    // Log the first saved record to verify
    if (savedRecords[0]) {
      console.log('📝 First saved record:', {
        patientId: savedRecords[0].patientId,
        sampleId: savedRecords[0].sampleId,
        testId: savedRecords[0].testId,
        testCode: savedRecords[0].testCode,
        testReportName: savedRecords[0].testReportName,
        uniqueId: savedRecords[0].uniqueId,
        recommendation: savedRecords[0].recommendation?.substring(0, 100),
        interpretation: savedRecords[0].interpretation?.substring(0, 100),
        _id: savedRecords[0]._id,
      });
    }

    return savedRecords;
  } else {
    console.log('⚠️ No records to save to temp collection');
    return [];
  }
}