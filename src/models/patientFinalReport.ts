// models/patientFinalReport.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IConditionGene {
  gene:     string;
  uniqueId: string;
  response: string;
}

interface IFinalCondition {
  conditionName:  string;
  status:         string;
  recommendation: string;
  interpretation: string;
  nutrition:      string;
  lifestyle:      string;
  miscellaneous:  string;
  genes:          IConditionGene[];
  updatedAt:      Date;
}

export interface IPatientFinalReport extends Document {
  patientId:      string;   // Neon patients.id (UUID)
  sampleId:       string;   // Neon samples.id (UUID)
  testId:         string;   // Neon test_catalog.id (UUID)
  testCode:       string;
  testReportName: string;
  conditions:     IFinalCondition[];
  createdAt:      Date;
  updatedAt:      Date;
}

const patientFinalReportSchema = new Schema<IPatientFinalReport>(
  {
    patientId:      { type: String, required: true, index: true },
    sampleId:       { type: String, required: true, index: true },
    testId:         { type: String, required: true, index: true },
    testCode:       { type: String, required: true },
    testReportName: { type: String, required: true },
    conditions: [
      {
        conditionName:  { type: String, required: true },
        status:         { type: String, required: true },
        recommendation: { type: String, default: "" },
        interpretation: { type: String, default: "" },
        nutrition:      { type: String, default: "" },
        lifestyle:      { type: String, default: "" },
        miscellaneous:  { type: String, default: "" },
        genes: [
          {
            gene:     { type: String, required: true },
            uniqueId: { type: String, required: true },
            response: { type: String, required: true },
          },
        ],
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// One document per patient per sample per test — upsert key
patientFinalReportSchema.index(
  { patientId: 1, sampleId: 1, testId: 1 },
  { unique: true }
);

export default
  (mongoose.models.PatientFinalReport as mongoose.Model<IPatientFinalReport>) ||
  mongoose.model<IPatientFinalReport>('PatientFinalReport', patientFinalReportSchema);