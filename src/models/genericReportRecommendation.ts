import { Schema, model, models, Document, Model } from "mongoose";

export enum RecommendationStatus {
  // Standard risk statuses
  Good = "Good",
  Average = "Average",
  Poor = "Poor",

  // Metabolizer statuses (Clopidogrel, Warfarin)
  UltraMetabolizer = "Ultra Metabolizer",
  ExtensiveMetabolizer = "Extensive Metabolizer",
  IntermediateMetabolizer = "Intermediate Metabolizer",
  PoorMetabolizer = "Poor Metabolizer",
  NormalMetabolizer = "Normal Metabolizer",

  // Myopathy risk statuses (Statin)
  NormalMyopathyRisk = "Normal myopathy risk",
  IntermediateMyopathyRisk = "Intermediate myopathy risk",
  HighMyopathyRisk = "High myopathy risk",
}

// ── Drug-specific additionalInfo shapes ────────────────────────────────────────

export interface IClopidogrelAdditionalInfo {
  drugType: "clopidogrel";
  rowId: number;           // original "id" from the JSON array
  cyp2c19_2: string;       // e.g. "*1*1"
  cyp2c19_3: string;
  cyp2c19_17: string;
  combinedGenotype: string; // e.g. "*1/*1"
  implications: string;
}

export interface IWarfarinAdditionalInfo {
  drugType: "warfarin";
  rowId: number;
  cyp2c9_2: string;        // field named "CYP2C19*2" in source JSON
  cyp2c9_3: string;        // field named "CYP2C19*3" in source JSON
  combinedGenotype: string;
  implications?: string;
}

export interface IStatinAdditionalInfo {
  drugType: "statin";
  rowId: number;
  drug: string;            // e.g. "Simvastatin"
  TT: string;              // dosage for TT genotype, e.g. "80(mg/day)"
  TC: string;
  CC: string;
  implications?: string;
}

// ── Per-status recommendation entry ───────────────────────────────────────────

export interface IStatusRecommendation {
  status: string;                // RecommendationStatus or free-form string
  recommendation?: string;
  interpretation?: string;
  // Skin / Wellness extended fields
  nutrition?: string;
  lifestyle?: string;
  miscellaneous?: string;
  // Drug-specific structured data
  additionalInfo?:
    | IClopidogrelAdditionalInfo
    | IWarfarinAdditionalInfo
    | IStatinAdditionalInfo
    | null;
}

// ── Document interface ─────────────────────────────────────────────────────────

export interface IGenericReportRecommendation extends Document {
  testId: string;          // UUID from test_catalog (e.g. "1add9d31-...")
  testCode: string;        // e.g. "NMC_CLOPI"
  testReportName: string;  // e.g. "Clopidogrel Sensitivity"
  /**
   * conditionName is optional:
   *  - Standard tests  → condition name  (e.g. "Ankylosing Spondylitis")
   *  - Clopidogrel     → combinedGenotype (e.g. "*1/*1")
   *  - Warfarin        → combinedGenotype (e.g. "*1/*2")
   *  - Statin          → drug name        (e.g. "Simvastatin")
   */
  conditionName?: string;
  data: IStatusRecommendation[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ─────────────────────────────────────────────────────────────────────

const genericReportRecommendationSchema =
  new Schema<IGenericReportRecommendation>(
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
      conditionName: {
        type: String,
        required: false,
      },
      data: [
        {
          status: {
            type: String,
            required: true,
          },
          recommendation: { type: String, required: false },
          interpretation: { type: String, required: false },
          nutrition:      { type: String, required: false },
          lifestyle:      { type: String, required: false },
          miscellaneous:  { type: String, required: false },
          additionalInfo: {
            type: Schema.Types.Mixed,
            required: false,
            default: null,
          },
        },
      ],
    },
    { timestamps: true }
  );

// ── Indexes ────────────────────────────────────────────────────────────────────

genericReportRecommendationSchema.index({ testId: 1, testCode: 1 });
genericReportRecommendationSchema.index({ testCode: 1, conditionName: 1 });
genericReportRecommendationSchema.index({ testReportName: 1, conditionName: 1 });
genericReportRecommendationSchema.index({ "data.status": 1 });
// Fast lookup: all rows for one drug test
genericReportRecommendationSchema.index({ testId: 1, conditionName: 1 });

// ── Static methods ─────────────────────────────────────────────────────────────

genericReportRecommendationSchema.statics.findByTestId =
  function (testId: string) {
    return this.find({ testId }).sort({ conditionName: 1 });
  };

genericReportRecommendationSchema.statics.findByTestCode =
  function (testCode: string) {
    return this.find({ testCode }).sort({ conditionName: 1 });
  };

genericReportRecommendationSchema.statics.findByTestReportName =
  function (testReportName: string) {
    return this.find({ testReportName });
  };

genericReportRecommendationSchema.statics.findByCondition =
  function (conditionName: string) {
    return this.find({ conditionName });
  };

genericReportRecommendationSchema.statics.findByStatus =
  function (status: RecommendationStatus) {
    return this.find({ "data.status": status });
  };

/**
 * Find a specific Clopidogrel / Warfarin row by combined genotype.
 * e.g. findByGenotype("1add9d31-...", "*1/*1")
 */
genericReportRecommendationSchema.statics.findByGenotype =
  function (testId: string, combinedGenotype: string) {
    return this.findOne({ testId, conditionName: combinedGenotype });
  };

/**
 * Find a specific Statin row by drug name.
 * e.g. findStatinByDrug("8df58358-...", "Simvastatin")
 */
genericReportRecommendationSchema.statics.findStatinByDrug =
  function (testId: string, drug: string) {
    return this.findOne({ testId, conditionName: drug });
  };

// Pre-hook
genericReportRecommendationSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: new Date() });
  // next();
});

// ── Model interface ────────────────────────────────────────────────────────────

export interface GenericReportRecommendationModel
  extends Model<IGenericReportRecommendation> {
  findByTestId(testId: string): Promise<IGenericReportRecommendation[]>;
  findByTestCode(testCode: string): Promise<IGenericReportRecommendation[]>;
  findByTestReportName(
    testReportName: string
  ): Promise<IGenericReportRecommendation[]>;
  findByCondition(
    conditionName: string
  ): Promise<IGenericReportRecommendation[]>;
  findByStatus(
    status: RecommendationStatus
  ): Promise<IGenericReportRecommendation[]>;
  findByGenotype(
    testId: string,
    combinedGenotype: string
  ): Promise<IGenericReportRecommendation | null>;
  findStatinByDrug(
    testId: string,
    drug: string
  ): Promise<IGenericReportRecommendation | null>;
}

// ── Export ─────────────────────────────────────────────────────────────────────

const GenericReportRecommendation =
  (models.GenericReportRecommendation as GenericReportRecommendationModel) ||
  model<IGenericReportRecommendation, GenericReportRecommendationModel>(
    "GenericReportRecommendation",
    genericReportRecommendationSchema
  );

export default GenericReportRecommendation;