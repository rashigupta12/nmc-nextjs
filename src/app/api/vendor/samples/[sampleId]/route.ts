// app/api/vendor/samples/[sampleId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  SamplesTable, 
  OrdersTable, 
  PatientsTable, 
  TestCatalogTable,
  VendorsTable
} from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sampleId: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { sampleId } = await params;
    
    // Fetch sample by sample_id (string) instead of id (UUID)
    const sample = await db.query.SamplesTable.findFirst({
      where: eq(SamplesTable.sampleId, sampleId),
      with: {
        order: {
          with: {
            patient: true,
            vendor: true,
          }
        },
        patient: true,
        testCatalog: true,
        vendor: true,
      }
    });

    if (!sample) {
      return NextResponse.json(
        { success: false, error: 'Sample not found' },
        { status: 404 }
      );
    }

    // Fetch subtests details if any
    let subtestsDetails: any[] = [];
    if (sample.subtests && sample.subtests.length > 0) {
      subtestsDetails = await db.query.TestCatalogTable.findMany({
        where: (testCatalog, { inArray }) => 
          inArray(testCatalog.testCode, sample.subtests as string[]),
      });
    }

    // Get CSV validation summary (safe default)
    const validationSummary = sample.validationSummary || {};

    return NextResponse.json({
      success: true,
      data: {
        ...sample,
        subtestsDetails,
        validationSummary,
        order: sample.order,
        patient: sample.patient,
        testCatalog: sample.testCatalog,
        vendor: sample.vendor,
      }
    });
  } catch (error) {
    console.error('Error fetching sample:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sample details' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sampleId: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { sampleId } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    const rows = fileContent.split('\n').filter(row => row.trim());
    
    if (rows.length < 2) {
      return NextResponse.json(
        { success: false, error: 'CSV file must contain headers and at least one data row' },
        { status: 400 }
      );
    }

    // Parse CSV - handle headers with spaces
    const rawHeaders = rows[0].split(',').map(h => h.trim());
    const headers = rawHeaders.map(h => h.toLowerCase());
    
    const dataRows = rows.slice(1).map(row => {
      const values = row.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      // Also store with original header names for display
      obj._originalHeaders = rawHeaders;
      return obj;
    });

    // Define required columns (with original names)
    const requiredColumns = ['condition name', 'genes', 'uniqueid', 'genotype'];
    const requiredColumnsLower = requiredColumns.map(c => c.toLowerCase());
    const missingColumns = requiredColumnsLower.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      const originalMissing = requiredColumns.filter((_, idx) => !headers.includes(requiredColumnsLower[idx]));
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required columns: ${originalMissing.join(', ')}`,
          expectedColumns: requiredColumns,
          foundColumns: rawHeaders
        },
        { status: 400 }
      );
    }

    // Validate data
    const errors: string[] = [];
    const warnings: string[] = [];
    
    dataRows.forEach((row, index) => {
      const rowNum = index + 2;
      if (!row.uniqueid) {
        errors.push(`Row ${rowNum}: Unique ID is required`);
      }
      if (!row.genes) {
        errors.push(`Row ${rowNum}: Genes is required`);
      }
      if (!row['condition name']) {
        errors.push(`Row ${rowNum}: Condition name is required`);
      }
      if (!row.genotype) {
        errors.push(`Row ${rowNum}: Genotype is required`);
      }
    });

    // Validate uniqueid matches sample ID
    const sample = await db.query.SamplesTable.findFirst({
      where: eq(SamplesTable.sampleId, sampleId),
    });

    // Check all uniqueids match the sample ID
    const invalidUniqueIds = dataRows.filter(row => row.uniqueid && row.uniqueid !== sampleId);
    if (invalidUniqueIds.length > 0) {
      warnings.push(`${invalidUniqueIds.length} row(s) have uniqueid that doesn't match Sample ID ${sampleId}`);
    }

    const isValid = errors.length === 0;

    // Group data by condition for better organization
    const groupedData: Record<string, any[]> = {};
    dataRows.forEach(row => {
      const condition = row['condition name'] || 'Other';
      if (!groupedData[condition]) {
        groupedData[condition] = [];
      }
      groupedData[condition].push({
        genes: row.genes,
        genotype: row.genotype,
        uniqueid: row.uniqueid,
      });
    });

    // Update sample with CSV info
    await db.update(SamplesTable)
      .set({
        csvUploaded: true,
        csvValidated: isValid,
        validationSummary: {
          isValid,
          errors,
          warnings,
          rowCount: dataRows.length,
          columnCount: headers.length,
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          groupedData, // Store grouped data for reference
          rawData: dataRows.slice(0, 10), // Store first 10 rows for preview
        },
        updatedAt: new Date(),
      })
      .where(eq(SamplesTable.sampleId, sampleId));

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'CSV validation failed',
        validationSummary: { isValid, errors, warnings, rowCount: dataRows.length },
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'CSV uploaded and validated successfully',
      data: {
        rowCount: dataRows.length,
        columnCount: headers.length,
        validationSummary: { isValid, errors, warnings },
        preview: {
          conditions: Object.keys(groupedData),
          sampleData: dataRows.slice(0, 5),
        }
      }
    });

  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process CSV file' },
      { status: 500 }
    );
  }
}