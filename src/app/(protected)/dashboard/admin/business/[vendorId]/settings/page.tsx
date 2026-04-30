/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(protected)/dashboard/admin/business/[vendorId]/settings/page.tsx
"use client";

import { getVendorById } from "@/actions/admin/vendor-actions";
import { updateVendorSettings } from "@/actions/admin/vendor-settings-actions";
import ImageUploader from "@/components/admin/vendor/ImageUploader";
import RichTextEditor from "@/components/admin/vendor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Layout,
  Loader2,
  MapPin,
  Save,
  Signature,
  Smartphone,
  User,
  Volume2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const vendorSettingsSchema = z.object({
  logoImg: z.string().optional(),
  coverPageImgName: z.string().optional(),
  backCoverPageImgName: z.string().optional(),
  welcomeMessage: z.string().optional(),
  sigName: z.string().optional(),
  sigTitle: z.string().optional(),
  sigImgName: z.string().optional(),
  aboutImgName: z.string().optional(),
  about: z.string().optional(),
  legalDisContent: z.string().optional(),
  dietPage1Img: z.string().optional(),
  dietPage2Img: z.string().optional(),
  fitnessPage1Img: z.string().optional(),
  fitnessPage2Img: z.string().optional(),
  weightPage1Img: z.string().optional(),
  weightPage2Img: z.string().optional(),
  detoxPage1Img: z.string().optional(),
  detoxPage2Img: z.string().optional(),
  skinCoverPageImg: z.string().optional(),
  skinBackCoverPageImg: z.string().optional(),
  skinCoverLogo: z.boolean().optional(),
  skinBackCoverLogo: z.boolean().optional(),
  cardiometCoverPage: z.string().optional(),
  cardiometBackCoverPage: z.string().optional(),
  cardiometCoverLogo: z.boolean().optional(),
  cardiometBackCoverLogo: z.boolean().optional(),
  immunityCoverPage: z.string().optional(),
  immunityBackCoverPage: z.string().optional(),
  immunityCoverLogo: z.boolean().optional(),
  immunityBackCoverLogo: z.boolean().optional(),
  autoimmuneCoverPage: z.string().optional(),
  autoimmuneBackCoverPage: z.string().optional(),
  autoimmuneCoverLogo: z.boolean().optional(),
  autoimmuneBackCoverLogo: z.boolean().optional(),
  womanCoverPage: z.string().optional(),
  womanBackCoverPage: z.string().optional(),
  womanCoverLogo: z.boolean().optional(),
  womanBackCoverLogo: z.boolean().optional(),
  menCoverPage: z.string().optional(),
  menBackCoverPage: z.string().optional(),
  menCoverLogo: z.boolean().optional(),
  menBackCoverLogo: z.boolean().optional(),
  eyeCoverPage: z.string().optional(),
  eyeBackCoverPage: z.string().optional(),
  eyeCoverLogo: z.boolean().optional(),
  eyeBackCoverLogo: z.boolean().optional(),
  kidneyCoverPage: z.string().optional(),
  kidneyBackCoverPage: z.string().optional(),
  kidneyCoverLogo: z.boolean().optional(),
  kidneyBackCoverLogo: z.boolean().optional(),
  sleepCoverPage: z.string().optional(),
  sleepBackCoverPage: z.string().optional(),
  sleepCoverLogo: z.boolean().optional(),
  sleepBackCoverLogo: z.boolean().optional(),
  pgxCoverPage: z.string().optional(),
  pgxBackCoverPage: z.string().optional(),
  pgxCoverLogo: z.boolean().optional(),
  pgxBackCoverLogo: z.boolean().optional(),
  vendorAddress: z.string().optional(),
  coverPage: z.boolean(),
  blankPage: z.boolean(),
  sectionImages: z.boolean(),
  summaryPages: z.boolean(),
});

type VendorSettingsFormValues = z.infer<typeof vendorSettingsSchema>;

// ─── Reusable primitives ────────────────────────────────────────────────────

/** Uniform section wrapper */
const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="border border-border rounded-lg overflow-hidden">
    {/* section header */}
    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

/** 2-column grid */
const Grid2 = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
);

/** Compact field label */
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm font-medium text-muted-foreground mb-1.5">{children}</p>
);

/** Toggle row */
const ToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between px-3 py-2 border border-border rounded-md bg-background">
    <span className="text-sm text-foreground">{label}</span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

/** Report card (cover + back + 2 toggles) */
const ReportCard = ({
  title,
  coverVal,
  backVal,
  coverLogo,
  backLogo,
  coverFolder,
  backFolder,
  onCover,
  onBack,
  onCoverLogo,
  onBackLogo,
}: any) => (
  <div className="border border-border rounded-md overflow-hidden">
    <div className="px-3 py-2 bg-muted/30 border-b border-border">
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
    <div className="p-3 space-y-3">
      <Grid2>
        <div>
          <FieldLabel>Cover Page</FieldLabel>
          <ImageUploader
            value={coverVal || ""}
            onChange={onCover}
            folder={coverFolder}
            cropDimensions={{ width: 2480, height: 3507 }}
          />
        </div>
        <div>
          <FieldLabel>Back Cover</FieldLabel>
          <ImageUploader
            value={backVal || ""}
            onChange={onBack}
            folder={backFolder}
            cropDimensions={{ width: 2480, height: 3507 }}
          />
        </div>
      </Grid2>
      <Grid2>
        <ToggleRow label="Cover Logo" checked={coverLogo || false} onChange={onCoverLogo} />
        <ToggleRow label="Back Cover Logo" checked={backLogo || false} onChange={onBackLogo} />
      </Grid2>
    </div>
  </div>
);

// ─── Page ───────────────────────────────────────────────────────────────────

export default function VendorSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.vendorId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState<any>(null);

  const form = useForm<VendorSettingsFormValues>({
    resolver: zodResolver(vendorSettingsSchema),
    defaultValues: {
      coverPage: false,
      blankPage: false,
      sectionImages: false,
      summaryPages: false,
      skinCoverLogo: false,
      skinBackCoverLogo: false,
      cardiometCoverLogo: false,
      cardiometBackCoverLogo: false,
      immunityCoverLogo: false,
      immunityBackCoverLogo: false,
      autoimmuneCoverLogo: false,
      autoimmuneBackCoverLogo: false,
      womanCoverLogo: false,
      womanBackCoverLogo: false,
      menCoverLogo: false,
      menBackCoverLogo: false,
      eyeCoverLogo: false,
      eyeBackCoverLogo: false,
      kidneyCoverLogo: false,
      kidneyBackCoverLogo: false,
      sleepCoverLogo: false,
      sleepBackCoverLogo: false,
      pgxCoverLogo: false,
      pgxBackCoverLogo: false,
    },
  });

  useEffect(() => {
    loadVendorData();
  }, [vendorId]);

  async function loadVendorData() {
    try {
      const result = await getVendorById(vendorId);
      if (result && "id" in result) {
        setVendor(result);
        if (result.settings) {
          const settingsData = Object.fromEntries(
            Object.entries(result.settings).map(([k, v]) => [k, v === null ? undefined : v])
          ) as VendorSettingsFormValues;
          form.reset(settingsData);
        }
      } else if (result && "error" in result) {
        toast({ variant: "destructive", title: "Error", description: (result as any).error || "Failed to load vendor data" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: VendorSettingsFormValues) {
    setSaving(true);
    try {
      const result = await updateVendorSettings(vendorId, data);
      if (result.success) {
        toast({ title: "Saved", description: "Settings saved successfully" });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error || "Failed to save" });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings…</p>
        </div>
      </div>
    );
  }

  const w = form.watch;
  const sv = (field: any) => (val: any) => form.setValue(field, val);

  return (
    // Force uniform text-sm everywhere on the page
    <div className="text-sm container mx-auto pb-10 space-y-0">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-background border-b border-border flex items-center justify-between px-1 py-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
          <span className="text-border select-none">|</span>
          <div>
            <p className="font-semibold text-sm text-foreground leading-tight">Report Settings</p>
            <p className="text-muted-foreground leading-tight">
              {vendor?.name} {vendor?.vendorCode && <span className="opacity-60">· {vendor.vendorCode}</span>}
            </p>
          </div>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={saving}
          size="sm"
          className="gap-1.5 h-8 text-sm"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Save
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

          {/* 1 · A/C SETTINGS */}
          <Section icon={ImageIcon} title="A/C Settings">
            <Grid2>
              <div>
                <FieldLabel>Logo (150×60)</FieldLabel>
                <ImageUploader value={w("logoImg") || ""} onChange={sv("logoImg")} folder="vendor-logos" cropDimensions={{ width: 150, height: 60 }} />
              </div>
              <div>
                <FieldLabel>Cover Page (2480×3507)</FieldLabel>
                <ImageUploader value={w("coverPageImgName") || ""} onChange={sv("coverPageImgName")} folder="vendor-covers" cropDimensions={{ width: 2480, height: 3507 }} />
              </div>
              <div>
                <FieldLabel>Back Cover (2480×3507)</FieldLabel>
                <ImageUploader value={w("backCoverPageImgName") || ""} onChange={sv("backCoverPageImgName")} folder="vendor-covers" cropDimensions={{ width: 2480, height: 3507 }} />
              </div>
            </Grid2>
          </Section>

          {/* 2 · WELCOME */}
          <Section icon={Volume2} title="Welcome Content">
            <RichTextEditor value={w("welcomeMessage") || ""} onChange={sv("welcomeMessage")} placeholder="Write a welcome message…" minHeight={140} />
          </Section>

          {/* 3 · SIGNATURE */}
          <Section icon={Signature} title="Signature Section">
            <div className="space-y-3">
              <Grid2>
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <Input placeholder="Dr. John Doe" {...form.register("sigName")} className="h-8 text-sm" />
                </div>
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <Input placeholder="Chief Scientific Officer" {...form.register("sigTitle")} className="h-8 text-sm" />
                </div>
              </Grid2>
              <Grid2>
                <div>
                  <FieldLabel>Signature Image (200×100)</FieldLabel>
                  <ImageUploader value={w("sigImgName") || ""} onChange={sv("sigImgName")} folder="vendor-signatures" cropDimensions={{ width: 200, height: 100 }} />
                </div>
                <div>
                  <FieldLabel>About Image (200×200)</FieldLabel>
                  <ImageUploader value={w("aboutImgName") || ""} onChange={sv("aboutImgName")} folder="vendor-about-images" cropDimensions={{ width: 200, height: 200 }} />
                </div>
              </Grid2>
            </div>
          </Section>

          {/* 4 · ABOUT */}
          <Section icon={User} title="About Us">
            <RichTextEditor value={w("about") || ""} onChange={sv("about")} placeholder="Tell about your company…" minHeight={140} />
          </Section>

          {/* 5 · LEGAL */}
          <Section icon={FileText} title="Legal Disclaimer">
            <RichTextEditor value={w("legalDisContent") || ""} onChange={sv("legalDisContent")} placeholder="Legal disclaimer text…" minHeight={110} />
          </Section>

          {/* 6 · REPORT COVER PAGES */}
          <Section icon={Layout} title="Report Cover Pages">
            <div className="space-y-4">
              {[
                { label: "Diet",    p1: "dietPage1Img",    p2: "dietPage2Img",    folder: "report-covers/diet" },
                { label: "Fitness", p1: "fitnessPage1Img", p2: "fitnessPage2Img", folder: "report-covers/fitness" },
                { label: "Weight",  p1: "weightPage1Img",  p2: "weightPage2Img",  folder: "report-covers/weight" },
                { label: "Detox",   p1: "detoxPage1Img",   p2: "detoxPage2Img",   folder: "report-covers/detox" },
              ].map(({ label, p1, p2, folder }) => (
                <div key={label}>
                  <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
                  <Grid2>
                    <div>
                      <FieldLabel>Cover Page 1</FieldLabel>
                      <ImageUploader value={w(p1 as any) || ""} onChange={sv(p1)} folder={folder} cropDimensions={{ width: 2480, height: 3507 }} />
                    </div>
                    <div>
                      <FieldLabel>Cover Page 2</FieldLabel>
                      <ImageUploader value={w(p2 as any) || ""} onChange={sv(p2)} folder={folder} cropDimensions={{ width: 2480, height: 3507 }} />
                    </div>
                  </Grid2>
                </div>
              ))}
            </div>
          </Section>

          {/* 7-16 · SPECIALISED REPORT SETTINGS */}
          <Section icon={Layout} title="Specialised Report Settings">
            <div className="space-y-3">
              {[
                { title: "Skin",        cover: "skinCoverPageImg",    back: "skinBackCoverPageImg",    cl: "skinCoverLogo",        bl: "skinBackCoverLogo",        folder: "report-covers/skin" },
                { title: "Cardiometric",cover: "cardiometCoverPage",  back: "cardiometBackCoverPage",  cl: "cardiometCoverLogo",   bl: "cardiometBackCoverLogo",   folder: "report-covers/cardiometric" },
                { title: "Immunity",    cover: "immunityCoverPage",   back: "immunityBackCoverPage",   cl: "immunityCoverLogo",    bl: "immunityBackCoverLogo",    folder: "report-covers/immunity" },
                { title: "Autoimmune",  cover: "autoimmuneCoverPage", back: "autoimmuneBackCoverPage", cl: "autoimmuneCoverLogo",  bl: "autoimmuneBackCoverLogo",  folder: "report-covers/autoimmune" },
                { title: "Woman's",     cover: "womanCoverPage",      back: "womanBackCoverPage",      cl: "womanCoverLogo",       bl: "womanBackCoverLogo",       folder: "report-covers/woman" },
                { title: "Men's",       cover: "menCoverPage",        back: "menBackCoverPage",        cl: "menCoverLogo",         bl: "menBackCoverLogo",         folder: "report-covers/men" },
                { title: "Eye",         cover: "eyeCoverPage",        back: "eyeBackCoverPage",        cl: "eyeCoverLogo",         bl: "eyeBackCoverLogo",         folder: "report-covers/eye" },
                { title: "Kidney",      cover: "kidneyCoverPage",     back: "kidneyBackCoverPage",     cl: "kidneyCoverLogo",      bl: "kidneyBackCoverLogo",      folder: "report-covers/kidney" },
                { title: "Sleep",       cover: "sleepCoverPage",      back: "sleepBackCoverPage",      cl: "sleepCoverLogo",       bl: "sleepBackCoverLogo",       folder: "report-covers/sleep" },
                { title: "PGx",         cover: "pgxCoverPage",        back: "pgxBackCoverPage",        cl: "pgxCoverLogo",         bl: "pgxBackCoverLogo",         folder: "report-covers/pgx" },
              ].map((r) => (
                <ReportCard
                  key={r.title}
                  title={r.title}
                  coverVal={w(r.cover as any)}
                  backVal={w(r.back as any)}
                  coverLogo={w(r.cl as any)}
                  backLogo={w(r.bl as any)}
                  coverFolder={r.folder}
                  backFolder={r.folder}
                  onCover={sv(r.cover)}
                  onBack={sv(r.back)}
                  onCoverLogo={sv(r.cl)}
                  onBackLogo={sv(r.bl)}
                />
              ))}
            </div>
          </Section>

          {/* 17 · VENDOR ADDRESS */}
          <Section icon={MapPin} title="Business Partner Address">
            <RichTextEditor value={w("vendorAddress") || ""} onChange={sv("vendorAddress")} placeholder="Official address for reports…" minHeight={100} />
          </Section>

          {/* 18 · ELECTRONIC REPORT SETTINGS */}
          <Section icon={Smartphone} title="Electronic Report Settings">
            <Grid2>
              <ToggleRow label="Cover Page Back"  checked={w("coverPage")}    onChange={sv("coverPage")} />
              <ToggleRow label="Blank Page"        checked={w("blankPage")}    onChange={sv("blankPage")} />
              <ToggleRow label="Section Images"    checked={w("sectionImages")} onChange={sv("sectionImages")} />
              <ToggleRow label="Summary Pages"     checked={w("summaryPages")} onChange={sv("summaryPages")} />
            </Grid2>
          </Section>

          {/* ── Bottom action bar ── */}
          <div className="sticky bottom-0 bg-background border-t border-border flex justify-end gap-2 px-1 py-3">
            <Button type="button" variant="outline" size="sm" className="h-8 text-sm" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} size="sm" className="h-8 text-sm gap-1.5">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save Settings
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}