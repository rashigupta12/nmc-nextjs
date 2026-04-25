import mongoose, { Document, Schema } from 'mongoose';

export interface IGeneticVariant extends Document {
  testId: string;           // UUID from test_catalog
  testCode: string;         // test_code from test_catalog  
  testReportName: string;   // test_name from test_catalog
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

const geneticVariantSchema = new Schema<IGeneticVariant>(
  {
    testId: {
      type: String,
      required: true,
      index: true,
    },
    testCode: {
      type: String,
      required: true,
      index: true,
    },
    testReportName: {
      type: String,
      required: true,
      index: true,
    },
    section: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    condition: {
      name: { type: String, required: true },
      category: { type: String, required: true },
    },
    gene: {
      name: { type: String, required: true },
      rsIds: [
        {
          uniqueId: { type: String, required: true },
          variants: [
            {
              testVariant: { type: String, required: true },
              reportVariant: { type: String, required: true },
              response: { type: String, required: true },
              status: { type: String, required: true },
              recommendation: { type: String },
              interpretation: { type: String },
              lifestyle: { type: String },
              miscellaneous: { type: String },
            },
          ],
        },
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This automatically handles createdAt and updatedAt
  }
);

// Compound indexes for efficient queries
geneticVariantSchema.index({ testId: 1, testCode: 1 });
geneticVariantSchema.index({ testCode: 1, 'condition.name': 1 });
geneticVariantSchema.index({ testReportName: 1, 'condition.name': 1 });
geneticVariantSchema.index({ 'gene.name': 1 });
geneticVariantSchema.index({ 'condition.name': 1 });
geneticVariantSchema.index({ 'gene.rsIds.uniqueId': 1 });

// Static methods
geneticVariantSchema.statics.findByTestId = function(testId: string) {
  return this.find({ testId });
};

geneticVariantSchema.statics.findByTestCode = function(testCode: string) {
  return this.find({ testCode });
};

geneticVariantSchema.statics.findByTestReportName = function(testReportName: string) {
  return this.find({ testReportName });
};

geneticVariantSchema.statics.findByGene = function(geneName: string) {
  return this.find({ 'gene.name': geneName });
};

geneticVariantSchema.statics.findByRsId = function(rsId: string) {
  return this.find({ 'gene.rsIds.uniqueId': rsId });
};

geneticVariantSchema.statics.findByCondition = function(conditionName: string) {
  return this.find({ 'condition.name': conditionName });
};

// Update the updatedAt timestamp on save
geneticVariantSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  // next();
});

export interface GeneticVariantModel extends mongoose.Model<IGeneticVariant> {
  findByTestId(testId: string): Promise<IGeneticVariant[]>;
  findByTestCode(testCode: string): Promise<IGeneticVariant[]>;
  findByTestReportName(testReportName: string): Promise<IGeneticVariant[]>;
  findByGene(geneName: string): Promise<IGeneticVariant[]>;
  findByRsId(rsId: string): Promise<IGeneticVariant[]>;
  findByCondition(conditionName: string): Promise<IGeneticVariant[]>;
}

export const GeneticVariant = (mongoose.models.GeneticVariant as GeneticVariantModel) ||
  mongoose.model<IGeneticVariant, GeneticVariantModel>('GeneticVariant', geneticVariantSchema);