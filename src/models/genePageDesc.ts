import mongoose, { Document, Schema } from 'mongoose';

export interface IGenePageDesc extends Document {
  testId: string;  // This comes from Neon (PostgreSQL)
  testCode: string;
  testReportName: string;
  unique_id?: string;
  gene: string;
  condition_name: string;
  gene_desc?: string;
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

const genePageDescSchema = new Schema<IGenePageDesc>({
  testId: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  testCode: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  testReportName: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  unique_id: {
    type: String,
    trim: true,
  },
  gene: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  condition_name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  gene_desc: {
    type: String,
  },
  display_condition: {
    type: String,
    trim: true,
  },
  condition_desc: {
    type: String,
  },
  heading1: {
    type: String,
    trim: true,
  },
  heading_desc1: {
    type: String,
  },
  heading_desc2: {
    type: String,
  },
  risk_factors: {
    type: String,
  },
  symptoms: {
    type: String,
  },
  prevention: {
    type: String,
  },
}, {
  timestamps: true
});

// Compound indexes for better query performance
genePageDescSchema.index({ testId: 1, condition_name: 1, gene: 1 });
genePageDescSchema.index({ testCode: 1, condition_name: 1 });
genePageDescSchema.index({ testReportName: 1, condition_name: 1 });
genePageDescSchema.index({ unique_id: 1 });

// Static methods
genePageDescSchema.statics.findByTestId = function(testId: string) {
  return this.find({ testId });
};

genePageDescSchema.statics.findByGene = function(gene: string) {
  return this.find({ gene: { $regex: gene, $options: 'i' } });
};

genePageDescSchema.statics.findByCondition = function(conditionName: string) {
  return this.find({ condition_name: { $regex: conditionName, $options: 'i' } });
};

genePageDescSchema.statics.findByUniqueId = function(uniqueId: string) {
  return this.findOne({ unique_id: uniqueId });
};

genePageDescSchema.statics.search = function(searchTerm: string) {
  return this.find({
    $or: [
      { testReportName: { $regex: searchTerm, $options: 'i' } },
      { condition_name: { $regex: searchTerm, $options: 'i' } },
      { gene: { $regex: searchTerm, $options: 'i' } },
      { unique_id: { $regex: searchTerm, $options: 'i' } },
    ]
  });
};

// Define static methods interface
export interface GenePageDescModel extends mongoose.Model<IGenePageDesc> {
  findByTestId(testId: string): Promise<IGenePageDesc[]>;
  findByGene(gene: string): Promise<IGenePageDesc[]>;
  findByCondition(conditionName: string): Promise<IGenePageDesc[]>;
  findByUniqueId(uniqueId: string): Promise<IGenePageDesc | null>;
  search(searchTerm: string): Promise<IGenePageDesc[]>;
}

const GenePageDesc = 
  (mongoose.models.GenePageDesc as GenePageDescModel) ||
  mongoose.model<IGenePageDesc, GenePageDescModel>('GenePageDesc', genePageDescSchema);

export default GenePageDesc;