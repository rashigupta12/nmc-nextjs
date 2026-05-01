// lib/reportEngine/GenericReportService.ts
// ============================================================
// Report Engine — GenericReportService
//
// Pure logic layer. No Mongoose imports, no Puppeteer.
// Accepts plain data objects, returns GenericApiResponse.
// Updated to properly handle auto-fill from PatientFinalReport.
// ============================================================

import {
  ReportTypeConfig,
  GenericApiResponse,
  PatientDetails,
  SampleDetails,
  GeneData,
  ConditionData,
  ReportData,
} from './types';

// ─── Default status priority (worst-wins) ────────────────────────────────────

const DEFAULT_STATUS_PRIORITY: Record<string, number> = {
  Poor: 3,
  Average: 2,
  Good: 1,
  '': 0,
};

// ─── Raw DB status → normalised display response ─────────────────────────────

function normaliseStatus(raw: string): string {
  const s = (raw ?? '').toLowerCase();
  if (s === 'normal' || s === 'low') return 'Good';
  if (s === 'medium') return 'Average';
  if (s === 'high') return 'Poor';
  if (s === 'good' || s === 'average' || s === 'poor')
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return raw || 'Average';
}

function worstStatus(
  a: string,
  b: string,
  priority: Record<string, number>
): string {
  return (priority[a] ?? 0) >= (priority[b] ?? 0) ? a : b;
}

// ─── Input shape contracts ────────────────────────────────────────────────────

export interface RawPatientInput {
  patientId: string;
  patientFName: string;
  patientMName?: string;
  patientLName: string;
  age: string;
  gender: string;
  email: string;
  weight?: string;
  height?: string;
}

export interface RawSampleInput {
  sampleId?: string;
  orderNo?: string;
  test?: string;
  collectionDate?: Date;
  receivedDate?: Date;
  status?: string;
  geneticData?: { reportGenerated?: boolean };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class GenericReportService {
  private priority: Record<string, number>;

  constructor(private config: ReportTypeConfig) {
    this.priority = config.statusPriorityMap ?? DEFAULT_STATUS_PRIORITY;
  }

  async processReportData(
    patient: RawPatientInput,
    sample: RawSampleInput,
    geneReportData: any[],
    pageData: any[],
    pageDesc: any[],
    patientAdditional: Record<string, any> | null
  ): Promise<GenericApiResponse> {
    const PatientDetails = this.buildPatientDetails(patient, patientAdditional);
    const SampleDetails = this.buildSampleDetails(sample);

    // 1. Match gene rows against page data + page desc → flat ConditionData[]
    const flat = this.matchAndBuildConditions(geneReportData, pageData, pageDesc);

    // 2. Apply patientAdditional overrides (from PatientFinalReport)
    this.applyAutoFill(flat, patientAdditional);

    // 3. Group by section
    const sections = this.groupBySections(flat);

    return {
      PatientDetails,
      SampleDetails,
      sections,
      addDetails: patientAdditional,
      meta: {
        reportTypeId: this.config.id,
        reportLabel: this.config.label,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  // ── Step 1: Match rows ───────────────────────────────────────────────────────

  private matchAndBuildConditions(
    geneReportData: any[],
    pageData: any[],
    pageDesc: any[]
  ): ConditionData[] {
    const result: ConditionData[] = [];

    for (let i = 0; i < geneReportData.length; i++) {
      const raw = (geneReportData[i] as any)?._doc ?? geneReportData[i];

      const pd = this.findPageData(raw, pageData);
      const pdesc = this.findPageDesc(raw, pageDesc);

      const response = normaliseStatus(raw.status || raw.response || '');

      const gene: GeneData = {
        uniqueid: raw.uniqueId ?? raw.uniqueid ?? '',
        name: raw.gene ?? '',
        test_variant: raw.test_variant ?? '',
        report_variant: raw.report_variant ?? '',
        response,
        interpretation: raw.interpretation ?? '',
        status: raw.status ?? '',
        gene_description: pdesc?.gene_desc ?? raw.gene_desc ?? '',
      };

      const condition: ConditionData = {
        condition_name: raw.condition_name ?? pd?.condition_name ?? '',
        display_condition: raw.display_condition ?? pd?.display_condition ?? raw.condition_name ?? '',
        recommendation: raw.recommendation ?? '',
        interpretation: raw.interpretation ?? '',
        condition_status: response,
        condition_desc: pd?.condition_desc ?? raw.condition_desc ?? '',
        heading1: pd?.heading1 ?? raw.heading1 ?? '',
        heading_desc1: pd?.heading_desc1 ?? raw.heading_desc1 ?? '',
        heading_desc2: pd?.heading_desc2 ?? raw.heading_desc2 ?? '',
        sectionId: raw.sectionId ?? '',
        gene: [gene],
      };

      result.push(condition);
    }

    return result;
  }

  private findPageData(raw: any, pageData: any[]): any | null {
    const match = pageData.find(gpd => {
      const d = (gpd as any)?._doc ?? gpd;
      return (
        (d.unique_id && raw.uniqueId &&
          d.unique_id.toLowerCase() === raw.uniqueId.toLowerCase()) ||
        (d.gene && raw.gene &&
          d.gene.toLowerCase() === raw.gene.toLowerCase())
      );
    });
    return match ? ((match as any)?._doc ?? match) : null;
  }

  private findPageDesc(raw: any, pageDesc: any[]): any | null {
    const match = pageDesc.find(gpd => {
      const d = (gpd as any)?._doc ?? gpd;
      return (
        (d.uniqueid && raw.uniqueId &&
          d.uniqueid.toLowerCase() === raw.uniqueId.toLowerCase()) ||
        (d.gene && raw.gene &&
          d.gene.toLowerCase() === raw.gene.toLowerCase())
      );
    });
    return match ? ((match as any)?._doc ?? match) : null;
  }

  // ── Step 2: Auto-fill overrides from PatientFinalReport ───────────────────────

  private applyAutoFill(
    conditions: ConditionData[],
    pa: Record<string, any> | null
  ): void {
    if (!pa) return;

    for (const mapping of this.config.autoFillMappings) {
      // Find matching condition
      const matched = conditions.filter(c =>
        c.condition_name.toLowerCase().includes(mapping.match.toLowerCase()) ||
        c.display_condition.toLowerCase().includes(mapping.match.toLowerCase())
      );
      
      if (!matched.length) continue;

      for (const cond of matched) {
        // Look up the status from patientAdditional by condition name
        const conditionOverride = pa[cond.condition_name] || pa[cond.display_condition];
        
        if (conditionOverride?.status) {
          cond.condition_status = conditionOverride.status;
        }
        if (conditionOverride?.recommendation) {
          cond.recommendation = conditionOverride.recommendation;
        }
        if (conditionOverride?.interpretation) {
          cond.interpretation = conditionOverride.interpretation;
        }

        // Propagate to gene level
        cond.gene.forEach(g => {
          if (conditionOverride?.status) g.status = conditionOverride.status;
          if (conditionOverride?.interpretation) g.interpretation = conditionOverride.interpretation;
        });
      }
    }
  }

  // ── Step 3: Group by section then deduplicate by display_condition ───────────

  private groupBySections(conditions: ConditionData[]): Record<string, ReportData> {
    const sections: Record<string, ReportData> = {};

    if (this.config.sections.length === 0) {
      sections['flat'] = this.groupByDisplayCondition(conditions);
      return sections;
    }

    for (const section of this.config.sections) {
      const sectionConditions = conditions.filter(c => c.sectionId === section.id);
      sections[section.id] = this.groupByDisplayCondition(sectionConditions);
    }

    return sections;
  }

  private groupByDisplayCondition(conditions: ConditionData[]): ReportData {
    const map = new Map<string, ConditionData[]>();

    for (const c of conditions) {
      const key = c.display_condition || c.condition_name;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }

    const result: ReportData = {};

    map.forEach((items, key) => {
      const base = items[0];
      const merged: ConditionData = {
        ...base,
        gene: items.map(i => i.gene[0]).filter(Boolean),
      };
      result[key] = [merged];
    });

    return result;
  }

  // ── Patient / Sample transformers ────────────────────────────────────────────

  private buildPatientDetails(
    pd: RawPatientInput,
    pa: Record<string, any> | null
  ): PatientDetails {
    return {
      hospital: '',
      referredBy: '',
      patientId: pd.patientId,
      name: [pd.patientFName, pd.patientMName, pd.patientLName]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
      email: pd.email,
      age: parseInt(pd.age, 10) || 0,
      gender: pd.gender === 'M' ? 'Male' : pd.gender === 'F' ? 'Female' : 'Other',
      weight: pd.weight ?? '',
      height: pd.height ?? '',
      activityLevel: pa?.activityLevel?.toString() ?? '',
      dailyCalorieIntake: pa ? parseInt(pa.dailyCalorieIntake, 10) || 0 : 0,
    };
  }

  private buildSampleDetails(sd: RawSampleInput): SampleDetails {
    const fmt = (d?: Date) => d ? d.toISOString().split('T')[0] : '';
    const tmt = (d?: Date) => d ? d.toTimeString().split(' ')[0] : '';

    return {
      kitBarcode: sd.sampleId ?? '',
      orderNo: sd.orderNo ?? '',
      test: sd.test ?? '',
      subtests: '',
      sample_date: fmt(sd.collectionDate),
      sample_time: tmt(sd.collectionDate),
      resample_date: fmt(sd.receivedDate),
      lab_date: sd.status === 'Completed' ? new Date().toISOString().split('T')[0] : '',
      report_date: sd.geneticData?.reportGenerated ? new Date().toISOString().split('T')[0] : '',
      sampleType: 'SALIVA',
      addedBy: 'System',
      vendorSampleId: sd.sampleId ?? '',
      tatDate: '',
      pdfpath: '',
    };
  }
}