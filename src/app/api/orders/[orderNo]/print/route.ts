// app/api/orders/[orderNo]/print/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { OrdersTable, SamplesTable, PatientsTable, TestCatalogTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNo: string } }
) {
  try {
    const { orderNo } = params;

    // Fetch order with related data
    const order = await db.query.OrdersTable.findFirst({
      where: eq(OrdersTable.orderNo, orderNo),
      with: {
        patient: true,
        sample: {
          with: {
            testCatalog: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.sample) {
      return NextResponse.json(
        { success: false, error: 'Sample not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNo: order.orderNo,
        orderDate: order.orderDate,
        shipmentStatus: order.shipmentStatus,
        statusCode: order.statusCode,
        remark: order.remark,
        patient: {
          patientId: order.patient.patientId,
          name: `${order.patient.patientFName} ${order.patient.patientLName}`,
          age: order.patient.age,
          gender: order.patient.gender,
          email: order.patient.email,
          mobileNo: order.patient.mobileNo
        },
        sample: {
          sampleId: order.sample.sampleId,
          testName: order.sample.testCatalog.testName,
          testCode: order.sample.testCatalog.testCode,
          subtests: order.sample.subtests,
          sampleType: order.sample.sampleType,
          collectionDate: order.sample.dateSampleTaken,
          collectionTime: order.sample.sampleTime,
          tatDate: order.sample.tatDueAt,
          kitBarcode: order.sample.kitBarcode
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}