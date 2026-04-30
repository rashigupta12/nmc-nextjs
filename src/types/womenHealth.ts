export interface WomenHealthReportResponse {
  PatientDetails: {
    patientId: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    activityLevel: string;
    dailyCalorieIntake: number;
  };
  SampleDetails: {
    kitBarcode: string;
    orderNo: string;
    test: string;
    subtests: string;
    sample_date: string;
    sample_time: string;
    resample_date: string;
    lab_date: string;
    report_date: string;
    sampleType: string;
    addedBy: string;
    vendorSampleId: string;
    tatDate: string;
    pdfpath: string;
  };
  ReportData: {
    [key: string]: WomenHealthCondition[];
  };
}

export interface WomenHealthCondition {
  condition_name: string;
  display_condition: string;
  recommendation: string;
  interpretation: string;
  condition_status: string;
  condition_desc: string;
  heading1: string;
  heading_desc1: string;
  heading_desc2: string;
  gene: GeneDetail[];
}

export interface GeneDetail {
  uniqueid: string;
  name: string;
  test_variant: string;
  report_variant: string;
  response: string;
  interpretation: string;
  status: string;
  gene_description: string;
}