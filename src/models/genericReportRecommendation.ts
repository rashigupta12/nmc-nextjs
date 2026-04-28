import { Schema, model, models } from "mongoose";

// Define the recommendation status enum
export enum RecommendationStatus {
  // Original statuses
  Good = "Good",
  Average = "Average",
  Poor = "Poor",
  
  // New metabolizer statuses
  UltraMetabolizer = "Ultra Metabolizer",
  ExtensiveMetabolizer = "Extensive Metabolizer",
  IntermediateMetabolizer = "Intermediate Metabolizer",
  PoorMetabolizer = "Poor Metabolizer",
  NormalMetabolizer = "Normal Metabolizer",
  
  // New myopathy risk statuses
  NormalMyopathyRisk = "Normal myopathy risk",
  IntermediateMyopathyRisk = "Intermediate myopathy risk",
  HighMyopathyRisk = "High myopathy risk"
}

// Define the interface for status recommendations
export interface IStatusRecommendation {
  status: RecommendationStatus;
  recommendation?: string;
  interpretation?: string;
  // Additional fields for more complex recommendations
  nutrition?: string;
  lifestyle?: string;
  miscellaneous?: string;
  additionalInfo?: any;
}

// Define the schema for generic report recommendations
const genericReportRecommendationSchema = new Schema(
  {
    reportTestId: {
      type: Schema.Types.ObjectId,
      ref: 'TestMaster',
      required: true,
    },
    conditionName: {
      type: String,
      required: false,
    },
    data: [
      {
        status: {
          type: String,
          enum: Object.values(RecommendationStatus),
          required: true,
        },
        recommendation: {
          type: String,
          required: false,
        },
        interpretation: {
          type: String,
          required: false,
        },
        // Additional flexible fields
        nutrition: {
          type: String,
          required: false,
        },
        lifestyle: {
          type: String,
          required: false,
        },
        miscellaneous: {
          type: String,
          required: false,
        },
        additionalInfo: {
          type: Schema.Types.Mixed,
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Create and export the model
const GenericReportRecommendation =
  models.GenericReportRecommendation ||
  model("GenericReportRecommendation", genericReportRecommendationSchema);

export default GenericReportRecommendation;
