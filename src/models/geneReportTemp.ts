import mongoose, { Document, Schema } from 'mongoose';

export interface IGeneReportTemp extends Document {
  patientId: string;        // UUID
  sampleId: string;         // UUID
  testId: string;           // UUID from test_catalog
  testCode: string;         // test_code from test_catalog  
  testReportName: string;   // test_name from test_catalog

  uniqueId: string;
  gene: string;
  test_variant: string;
  report_variant: string;

  sectionId: string;
  condition_name: string;

  response: string;
  recommendation: string;
  interpretation: string;
  status: string;

  modifiedDate: Date;
}

const geneReportTempSchema = new Schema<IGeneReportTemp>({
  patientId: {
    type: String,
    required: true,
    uppercase: false  // UUIDs are typically lowercase
  },

  sampleId: {
    type: String,
    required: true,
    uppercase: false,  // UUIDs are typically lowercase
    index: true
  },

  testId: {
    type: String,
    required: true,
    uppercase: false,  // UUID format
    index: true
  },

  testCode: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },

  testReportName: {
    type: String,
    required: true
  },

  uniqueId: {
    type: String,
    required: true,
    match: /^rs\d+$/,
    index: true
  },

  gene: {
    type: String,
    required: true,
    uppercase: true
  },

  test_variant: {
    type: String,
    required: true,
    uppercase: true
  },

  report_variant: {
    type: String,
    default: ''
  },

  sectionId: String,

  condition_name: {
    type: String,
    required: true,
    index: true
  },

  response: String,
  recommendation: String,
  interpretation: String,
  status: String,

  modifiedDate: {
    type: Date,
    default: Date.now
  }
});

// Updated unique index to include testId instead of reportType
geneReportTempSchema.index(
  { patientId: 1, sampleId: 1, uniqueId: 1, condition_name: 1 },
  { unique: true }
);

// Optional: Add index for testId queries
geneReportTempSchema.index({ testId: 1, patientId: 1 });

geneReportTempSchema.pre('save', function () {
  this.modifiedDate = new Date();
});

// Updated static methods
geneReportTempSchema.statics.findBySampleId = function (sampleId: string) {
  return this.find({ sampleId });
};

// Updated to use testId instead of reportType
geneReportTempSchema.statics.findByTestId = function (sampleId: string, testId: string) {
  return this.find({ sampleId, testId });
};

// Optional: Find by testCode
geneReportTempSchema.statics.findByTestCode = function (sampleId: string, testCode: string) {
  return this.find({ sampleId, testCode });
};

export interface GeneReportTempModel extends mongoose.Model<IGeneReportTemp> {
  findBySampleId(sampleId: string): Promise<IGeneReportTemp[]>;
  findByTestId(sampleId: string, testId: string): Promise<IGeneReportTemp[]>;
  findByTestCode(sampleId: string, testCode: string): Promise<IGeneReportTemp[]>;
}

export const GeneReportTemp =
  (mongoose.models.GeneReportTemp as GeneReportTempModel) ||
  mongoose.model<IGeneReportTemp, GeneReportTempModel>(
    'GeneReportTemp',
    geneReportTempSchema
  );