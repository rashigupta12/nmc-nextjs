/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { 
  OrdersTable, 
  SamplesTable, 
  PatientsTable, 
  TestCatalogTable,
  NewOrder,
  NewSample,
  VendorsTable
} from '@/db/schema';
import { eq, like, desc, or, sql, and } from 'drizzle-orm';
import { auth } from '@/auth';

// Input validation schema
const CreateOrderSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  test: z.string().min(1, 'Test is required'),
  subtests: z.array(z.string()).optional(),
  kitBarcode: z.string().optional().default(''),
  customerSampleId: z.string().optional().default(''),
  sampleType: z.string().optional().default('SALIVA'),
  collectionDate: z.string().min(1, 'Collection date is required'),
  collectionTime: z.string().optional().default('12:00:00'),
  addedBy: z.string().min(1, 'Added by is required'),
  vendorId: z.string().min(1, 'Vendor ID is required'),
  createdBy: z.string().min(1, 'Created by is required'),
  remark: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
  try {
    // Get session to verify vendor
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { Success: 'false', Error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          Success: 'false', 
          Error: validationResult.error.errors[0].message,
          Details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const {
      patientId,
      patientName,
      test,
      subtests,
      kitBarcode,
      customerSampleId,
      sampleType,
      collectionDate,
      collectionTime,
      addedBy,
      vendorId,
      createdBy,
      remark
    } = validationResult.data;

    // Verify the vendorId matches the session user
    if (vendorId !== session.user.id) {
      return NextResponse.json(
        { Success: 'false', Error: 'Unauthorized: Vendor ID mismatch' },
        { status: 403 }
      );
    }

    try {
      // 1. Validate patient exists and belongs to this vendor
      const patient = await db.query.PatientsTable.findFirst({
        where: and(
          eq(PatientsTable.patientId, patientId.toUpperCase()),
          eq(PatientsTable.vendorId, vendorId)
        )
      });

      if (!patient) {
        return NextResponse.json(
          { Success: 'false', Error: 'Patient not found or does not belong to this vendor' },
          { status: 404 }
        );
      }

      // 2. Validate test exists in TestCatalog
      const testMaster = await db.query.TestCatalogTable.findFirst({
        where: eq(TestCatalogTable.testCode, test.toUpperCase())
      });

      if (!testMaster) {
        return NextResponse.json(
          { Success: 'false', Error: `Test ${test} not found in Test Catalog` },
          { status: 400 }
        );
      }

      // 3. Validate subtests if provided
      const validatedSubtests: string[] = [];
      if (subtests && subtests.length > 0) {
        for (const subtestCode of subtests) {
          const subtestMaster = await db.query.TestCatalogTable.findFirst({
            where: eq(TestCatalogTable.testCode, subtestCode.toUpperCase())
          });

          if (!subtestMaster) {
            return NextResponse.json(
              { Success: 'false', Error: `Subtest ${subtestCode} not found in Test Catalog` },
              { status: 400 }
            );
          }
          
          // Check if subtest belongs to parent test
          if (subtestMaster.parentTestId !== testMaster.id) {
            return NextResponse.json(
              { Success: 'false', Error: `Subtest ${subtestCode} does not belong to test ${test}` },
              { status: 400 }
            );
          }
          
          validatedSubtests.push(subtestMaster.testCode);
        }
      }

      // 4. Generate sequential IDs
      const currentDate = new Date();
      const yearMonthDay = currentDate.toISOString().slice(2, 10).replace(/-/g, '');
      const orderNo = await generateOrderNo(yearMonthDay);
      const sampleId = await generateSampleId(yearMonthDay);

      // Calculate TAT date
      const tatDate = calculateTatDate(testMaster.tatDays);

      // 5. Phase 1: Create Order without sampleId initially
      const newOrder: NewOrder = {
        orderNo: orderNo,
        patientId: patient.id,
        vendorId: vendorId,
        createdBy: createdBy,
        addedBy: addedBy,
        shipmentStatus: 'Pending',
        orderDate: currentDate.toISOString().slice(0, 10),
        statusCode: 'O001',
        remark: remark,
        sampleId: null,
        totalAmount: null,
        currency: 'INR',
        paymentStatus: 'PENDING'
      };

      const [createdOrder] = await db.insert(OrdersTable).values(newOrder).returning();

      // 6. Phase 2: Create Sample with order reference
      const newSample: NewSample = {
        sampleId: sampleId,
        orderId: createdOrder.id,
        vendorId: vendorId,
        patientId: patient.id,
        testCatalogId: testMaster.id,
        createdBy: createdBy,
        sampleType: sampleType.toUpperCase() as any,
        kitBarcode: kitBarcode,
        dateSampleTaken: collectionDate,
        sampleTime: collectionTime,
        subtests: validatedSubtests,
        addedBy: addedBy,
        vendorSampleId: customerSampleId,
        tatDueAt: tatDate,
        status: 'CREATED',
        nmcgId: null,
        partnerSampleId: null,
        trfUrl: null,
        referringDoctor: null,
        qcRejectionReason: null,
        shippedAt: null,
        receivedAt: null,
        qcPassedAt: null,
        processedAt: null,
        reportGeneratedAt: null,
        releasedAt: null,
        csvUploaded: false,
        csvValidated: false,
        validationSummary: null,
        pdfPath: null,
        mongoReportId: null,
        reportGenerated: false,
        reportReleased: false,
        reportPasswordProtected: false
      };

      const [createdSample] = await db.insert(SamplesTable).values(newSample).returning();

      // 7. Phase 3: Update Order with sample reference
      await db.update(OrdersTable)
        .set({ sampleId: createdSample.id })
        .where(eq(OrdersTable.id, createdOrder.id));

      // 8. Return success response
      return NextResponse.json({
        Success: 'true',
        Result: {
          order: {
            id: createdOrder.id,
            orderNo: createdOrder.orderNo,
            patientId: createdOrder.patientId,
            sampleId: createdOrder.sampleId,
            addedBy: createdOrder.addedBy,
            shipmentStatus: createdOrder.shipmentStatus,
            orderDate: createdOrder.orderDate,
            statusCode: createdOrder.statusCode,
            remark: createdOrder.remark,
          },
          sample: {
            id: createdSample.id,
            sampleId: createdSample.sampleId,
            orderId: createdSample.orderId,
            patientId: createdSample.patientId,
            kitBarcode: createdSample.kitBarcode,
            test: testMaster.testCode,
            testName: testMaster.testName,
            subtests: createdSample.subtests,
            sample_date: createdSample.dateSampleTaken,
            sample_time: createdSample.sampleTime,
            sampleType: createdSample.sampleType,
            addedBy: createdSample.addedBy,
            vendorSampleId: createdSample.vendorSampleId,
            tatDate: createdSample.tatDueAt,
            status: createdSample.status,
          },
          patient: {
            id: patient.id,
            patientId: patient.patientId,
            patientFName: patient.patientFName,
            patientLName: patient.patientLName,
            age: patient.age,
            gender: patient.gender,
            email: patient.email,
            mobileNo: patient.mobileNo,
          }
        }
      });

    } catch (error) {
      console.error('Error creating order and sample:', error);
      return NextResponse.json(
        { Success: 'false', Error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in create order API:', error);
    return NextResponse.json(
      { Success: 'false', Error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate sequential order number
async function generateOrderNo(yearMonthDay: string): Promise<string> {
  const todayOrders = await db.query.OrdersTable.findMany({
    where: like(OrdersTable.orderNo, `OR-${yearMonthDay}%`),
    orderBy: desc(OrdersTable.orderNo),
    limit: 1
  });

  let nextNumber = 1;
  if (todayOrders.length > 0) {
    const lastOrderNo = todayOrders[0].orderNo;
    const lastNumber = parseInt(lastOrderNo.slice(-5), 10);
    nextNumber = lastNumber + 1;
  }

  return `OR-${yearMonthDay}${nextNumber.toString().padStart(5, '0')}`;
}

// Helper function to generate sequential sample ID
async function generateSampleId(yearMonthDay: string): Promise<string> {
  const todaySamples = await db.query.SamplesTable.findMany({
    where: like(SamplesTable.sampleId, `SMP-${yearMonthDay}%`),
    orderBy: desc(SamplesTable.sampleId),
    limit: 1
  });

  let nextNumber = 1;
  if (todaySamples.length > 0) {
    const lastSampleId = todaySamples[0].sampleId;
    const lastNumber = parseInt(lastSampleId.slice(-5), 10);
    nextNumber = lastNumber + 1;
  }

  return `SMP-${yearMonthDay}${nextNumber.toString().padStart(5, '0')}`;
}

// Helper function to calculate TAT date
function calculateTatDate(tatDays: number): string {
  const today = new Date();
  const tatDate = new Date(today);
  tatDate.setDate(today.getDate() + tatDays);
  return tatDate.toISOString().slice(0, 10);
}

// GET endpoint to fetch orders for the logged-in vendor
export async function GET(request: NextRequest) {
  try {
    // Get session to verify vendor
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendorId = session.user.id;
    const vendorCode = session.user.vendorCode;

    console.log("Fetching orders for vendor:", { vendorId, vendorCode });

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const shipmentStatus = searchParams.get('shipmentStatus');
    const paymentStatus = searchParams.get('paymentStatus');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build conditions array - ALWAYS filter by vendor
    const conditions = [eq(OrdersTable.vendorId, vendorId)];
    
 if (search) {
  const searchCondition = or(
    sql`${OrdersTable.orderNo} ILIKE ${`%${search}%`}`,
    sql`${PatientsTable.patientFName} ILIKE ${`%${search}%`}`,
    sql`${PatientsTable.patientLName} ILIKE ${`%${search}%`}`,
    sql`${PatientsTable.email} ILIKE ${`%${search}%`}`,
    sql`${PatientsTable.mobileNo} ILIKE ${`%${search}%`}`,
    sql`${OrdersTable.remark} ILIKE ${`%${search}%`}`
  );
  if (searchCondition) conditions.push(searchCondition);
}
    
    if (shipmentStatus && shipmentStatus !== 'ALL') {
      conditions.push(eq(OrdersTable.shipmentStatus, shipmentStatus));
    }

    // Validate paymentStatus enum
    type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    const validPaymentStatuses: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

    if (paymentStatus && paymentStatus !== 'ALL') {
      if (validPaymentStatuses.includes(paymentStatus as PaymentStatus)) {
        conditions.push(eq(OrdersTable.paymentStatus, paymentStatus as PaymentStatus));
      }
    }
    
    if (dateFrom) {
      conditions.push(sql`${OrdersTable.orderDate} >= ${dateFrom}`);
    }
    
    if (dateTo) {
      conditions.push(sql`${OrdersTable.orderDate} <= ${dateTo}`);
    }

    // Create where clause and handle potential undefined
    const whereClause = and(...conditions);
    
    // Since we always have at least the vendor condition, whereClause should never be undefined
    // But TypeScript doesn't know that, so we need to handle it
    if (!whereClause) {
      // This should never happen since we always have at least one condition (vendorId)
      console.error('No conditions provided for order query');
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    // Execute query with joins to get patient and sample data
    const orders = await db
      .select({
        id: OrdersTable.id,
        orderNo: OrdersTable.orderNo,
        vendorId: OrdersTable.vendorId,
        patientId: OrdersTable.patientId,
        createdBy: OrdersTable.createdBy,
        sampleId: OrdersTable.sampleId,
        addedBy: OrdersTable.addedBy,
        shipmentStatus: OrdersTable.shipmentStatus,
        orderDate: OrdersTable.orderDate,
        statusCode: OrdersTable.statusCode,
        remark: OrdersTable.remark,
        totalAmount: OrdersTable.totalAmount,
        currency: OrdersTable.currency,
        paymentStatus: OrdersTable.paymentStatus,
        createdAt: OrdersTable.createdAt,
        updatedAt: OrdersTable.updatedAt,
        // Patient information
        patient: {
          id: PatientsTable.id,
          patientId: PatientsTable.patientId,
          patientFName: PatientsTable.patientFName,
          patientLName: PatientsTable.patientLName,
          gender: PatientsTable.gender,
          age: PatientsTable.age,
          email: PatientsTable.email,
          mobileNo: PatientsTable.mobileNo,
          mrno: PatientsTable.mrno,
        },
        // Sample information
        sample: {
          id: SamplesTable.id,
          sampleId: SamplesTable.sampleId,
          sampleType: SamplesTable.sampleType,
          status: SamplesTable.status,
          tatDueAt: SamplesTable.tatDueAt,
          testCatalogId: SamplesTable.testCatalogId,
          subtests: SamplesTable.subtests,
        }
      })
      .from(OrdersTable)
      .innerJoin(PatientsTable, eq(OrdersTable.patientId, PatientsTable.id))
      .leftJoin(SamplesTable, eq(OrdersTable.sampleId, SamplesTable.id))
      .where(whereClause)
      .orderBy(desc(OrdersTable.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Fetch test names for each order
    const ordersWithTestNames = await Promise.all(
      orders.map(async (order) => {
        let testName = null;
        let testCode = null;
        
        if (order.sample?.testCatalogId) {
          const test = await db.query.TestCatalogTable.findFirst({
            where: eq(TestCatalogTable.id, order.sample.testCatalogId),
            columns: {
              testName: true,
              testCode: true,
            }
          });
          if (test) {
            testName = test.testName;
            testCode = test.testCode;
          }
        }
        
        return {
          ...order,
          sample: order.sample ? {
            ...order.sample,
            testName,
            testCode,
          } : null,
        };
      })
    );
    
    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(OrdersTable)
      .innerJoin(PatientsTable, eq(OrdersTable.patientId, PatientsTable.id))
      .where(whereClause);
    
    const total = Number(countResult[0]?.count) || 0;

    console.log(`Found ${orders.length} orders for vendor ${vendorCode}`);

    return NextResponse.json({
      success: true,
      orders: ordersWithTestNames,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}