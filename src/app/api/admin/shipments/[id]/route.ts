import { db } from "@/db";
import { 
  ShipmentsTable, 
  VendorsTable, 
  ShipmentSamplesTable, 
  SamplesTable,
  OrdersTable,
  PatientsTable,
  TestCatalogTable
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shipmentId = params.id;

    // Get shipment with vendor
    const [shipment] = await db
      .select({
        id: ShipmentsTable.id,
        shipmentNo: ShipmentsTable.shipmentNo,
        courierNumber: ShipmentsTable.courierNumber,
        courierService: ShipmentsTable.courierService,
        courierDate: ShipmentsTable.courierDate,
        status: ShipmentsTable.status,
        createdAt: ShipmentsTable.createdAt,
        receivedAt: ShipmentsTable.receivedAt,
        receivedBy: ShipmentsTable.receivedBy,
        vendor: {
          id: VendorsTable.id,
          name: VendorsTable.name,
          vendorCode: VendorsTable.vendorCode,
          email: VendorsTable.email,
        },
      })
      .from(ShipmentsTable)
      .innerJoin(VendorsTable, eq(ShipmentsTable.vendorId, VendorsTable.id))
      .where(eq(ShipmentsTable.id, shipmentId));

    if (!shipment) {
      return NextResponse.json(
        { error: "Shipment not found" },
        { status: 404 }
      );
    }

    // Get all samples in this shipment with their orders and patients
    const shipmentSamples = await db
      .select({
        shipmentSampleId: ShipmentSamplesTable.id,
        sample: {
          id: SamplesTable.id,
          sampleId: SamplesTable.sampleId,
          status: SamplesTable.status,
          sampleType: SamplesTable.sampleType,
          tatDueAt: SamplesTable.tatDueAt,
        },
        order: {
          id: OrdersTable.id,
          orderNo: OrdersTable.orderNo,
          orderDate: OrdersTable.orderDate,
        },
        patient: {
          id: PatientsTable.id,
          patientId: PatientsTable.patientId,
          patientFName: PatientsTable.patientFName,
          patientLName: PatientsTable.patientLName,
          email: PatientsTable.email,
          mobileNo: PatientsTable.mobileNo,
        },
        test: {
          id: TestCatalogTable.id,
          testName: TestCatalogTable.testName,
          testCode: TestCatalogTable.testCode,
        },
      })
      .from(ShipmentSamplesTable)
      .innerJoin(SamplesTable, eq(ShipmentSamplesTable.sampleId, SamplesTable.id))
      .innerJoin(OrdersTable, eq(SamplesTable.orderId, OrdersTable.id))
      .innerJoin(PatientsTable, eq(OrdersTable.patientId, PatientsTable.id))
      .innerJoin(TestCatalogTable, eq(SamplesTable.testCatalogId, TestCatalogTable.id))
      .where(eq(ShipmentSamplesTable.shipmentId, shipmentId));

    const samples = shipmentSamples.map(ss => ({
      id: ss.sample.id,
      sampleId: ss.sample.sampleId,
      status: ss.sample.status,
      sampleType: ss.sample.sampleType,
      tatDueAt: ss.sample.tatDueAt,
      order: {
        id: ss.order.id,
        orderNo: ss.order.orderNo,
        orderDate: ss.order.orderDate,
        patient: ss.patient,
        test: ss.test,
      },
    }));

    return NextResponse.json({
      success: true,
      shipment: {
        ...shipment,
        samples,
      },
    });
  } catch (error) {
    console.error("Error fetching shipment details:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipment details" },
      { status: 500 }
    );
  }
}