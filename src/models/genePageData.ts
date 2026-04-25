import mongoose, { Document, Schema } from 'mongoose';

export interface IGenePageData extends Document {
  testId: string;
  testCode: string;
  testReportName: string;
  unique_id?: string;
  gene?: string;
  condition_name: string;
  display_condition?: string;
  condition_desc?: string;
  heading1?: string;
  heading_desc1?: string;
  heading_desc2?: string;
  risk_factors?: string;
  symptoms?: string;
  prevention?: string;
  createdAt: Date;
  updatedAt: Date;
}

const genePageDataSchema = new Schema<IGenePageData>(
  {
    testId: { type: String, required: true, index: true },
    testCode: { type: String, required: true, index: true },
    testReportName: { type: String, required: true, index: true },
    unique_id: { type: String, trim: true },
    gene: { type: String, trim: true },
    condition_name: { type: String, required: true, trim: true, index: true },
    display_condition: { type: String, trim: true },
    condition_desc: { type: String },
    heading1: { type: String, trim: true },
    heading_desc1: { type: String },
    heading_desc2: { type: String },
    risk_factors: { type: String },
    symptoms: { type: String },
    prevention: { type: String },
  },
  { timestamps: true }
);

genePageDataSchema.index({ testId: 1, condition_name: 1, gene: 1 });
genePageDataSchema.index({ testCode: 1, condition_name: 1 });
genePageDataSchema.index({ testReportName: 1, condition_name: 1 });

genePageDataSchema.statics.findByTestId = function (testId: string) {
  return this.find({ testId });
};

genePageDataSchema.statics.findByCondition = function (conditionName: string) {
  return this.find({ condition_name: { $regex: conditionName, $options: 'i' } });
};

export interface GenePageDataModel extends mongoose.Model<IGenePageData> {
  findByTestId(testId: string): Promise<IGenePageData[]>;
  findByCondition(conditionName: string): Promise<IGenePageData[]>;
}

export const GenePageData =
  (mongoose.models.GenePageData as GenePageDataModel) ||
  mongoose.model<IGenePageData, GenePageDataModel>('GenePageData', genePageDataSchema);