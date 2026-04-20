// src/app/(protected)/dashboard/admin/vendors/[vendorId]/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Save, 
  Settings, 
  Image, 
  FileText, 
  Bell, 
  Layout,
  Building2,
  MapPin,
  Mail,
  Cloud
} from "lucide-react";
import ImageUploader from "@/components/admin/vendor/ImageUploader";
import RichTextEditor from "@/components/admin/vendor/RichTextEditor";
import { getVendorById } from "@/actions/admin/vendor-actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateVendorSettings } from "@/actions/admin/vendor-settings-actions";

// Form schema for vendor settings
const vendorSettingsSchema = z.object({
  // Basic Settings
  deliverable: z.enum(["REPORT", "RAW_DATA", "BOTH"]),
  s3BucketName: z.string().optional(),
  rawDataEmail: z.string().email().optional(),
  vendorAddress: z.string().optional(),
  
  // Privacy Settings
  hidePersonalInfo: z.boolean(),
  passwordProtectedReport: z.boolean(),
  passwordRule: z.string(),
  
  // Page Settings
  coverPage: z.boolean(),
  skinCoverBackPage: z.boolean(),
  blankPage: z.boolean(),
  sectionImages: z.boolean(),
  summaryPages: z.boolean(),
  splitWellnessReport: z.boolean(),
  
  // Content
  welcomeMessage: z.string().optional(),
  about: z.string().optional(),
  legalDisContent: z.string().optional(),
  
  // Signature
  sigTitle: z.string().optional(),
  sigName: z.string().optional(),
  
  // Notification Settings
  notifyTarget: z.enum(["SUBJECT", "BUSINESS_PARTNER", "BOTH"]),
  
  // Images
  logoImg: z.string().optional(),
  coverLogoImgName: z.string().optional(),
  coverPageImgName: z.string().optional(),
  backCoverPageImgName: z.string().optional(),
  aboutImgName: z.string().optional(),
  sigImgName: z.string().optional(),
  dietPage1Img: z.string().optional(),
  dietPage2Img: z.string().optional(),
  fitnessPage1Img: z.string().optional(),
  fitnessPage2Img: z.string().optional(),
  weightPage1Img: z.string().optional(),
  weightPage2Img: z.string().optional(),
  detoxPage1Img: z.string().optional(),
  detoxPage2Img: z.string().optional(),
  imageOverview: z.string().optional(),
  skinCoverPageImg: z.string().optional(),
  skinBackCoverPageImg: z.string().optional(),
  cardiometBackCoverPage: z.string().optional(),
  immunityCoverPage: z.string().optional(),
  immunityBackCoverPage: z.string().optional(),
  autoimmuneCoverPage: z.string().optional(),
  autoimmuneBackCoverPage: z.string().optional(),
  womanCoverPage: z.string().optional(),
  womanBackCoverPage: z.string().optional(),
  menCoverPage: z.string().optional(),
  menBackCoverPage: z.string().optional(),
  eyeCoverPage: z.string().optional(),
  eyeBackCoverPage: z.string().optional(),
  kidneyCoverPage: z.string().optional(),
  kidneyBackCoverPage: z.string().optional(),
  sleepCoverPage: z.string().optional(),
  sleepBackCoverPage: z.string().optional(),
});

type VendorSettingsFormValues = z.infer<typeof vendorSettingsSchema>;

export default function VendorSettingsPage() {
  const params = useParams();
  const vendorId = params.vendorId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState<any>(null);
  const [openAccordion, setOpenAccordion] = useState("basic");

  const form = useForm<VendorSettingsFormValues>({
    resolver: zodResolver(vendorSettingsSchema),
    defaultValues: {
      deliverable: "REPORT",
      hidePersonalInfo: false,
      passwordProtectedReport: false,
      passwordRule: "NAME4_DOB",
      coverPage: false,
      skinCoverBackPage: false,
      blankPage: false,
      sectionImages: false,
      summaryPages: false,
      splitWellnessReport: false,
      notifyTarget: "BOTH",
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
            Object.entries(result.settings).map(([key, value]) => [key, value === null ? undefined : value])
          ) as VendorSettingsFormValues;
          form.reset(settingsData);
        }
      } else if (result && "error" in result) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to load vendor data",
        });
      }
    } catch (error) {
      console.error("Error loading vendor:", error);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: VendorSettingsFormValues) {
    setSaving(true);
    try {
      const result = await updateVendorSettings(vendorId, data);
      if (result.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to save settings",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure settings for {vendor?.name} ({vendor?.vendorCode})
          </p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={saving} size="lg" className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          Save All Settings
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Accordion 
            type="single" 
            value={openAccordion} 
            onValueChange={setOpenAccordion}
            className="space-y-4"
          >
            
            {/* 1. Basic Information */}
            <AccordionItem value="basic" className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure deliverables and address information
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  <div>
                    <Label className="text-base font-semibold">Deliverable Type</Label>
                    <RadioGroup
                      value={form.watch("deliverable")}
                      onValueChange={(value: any) => form.setValue("deliverable", value)}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="REPORT" id="report" />
                        <Label htmlFor="report" className="cursor-pointer">Report Only</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="RAW_DATA" id="raw_data" />
                        <Label htmlFor="raw_data" className="cursor-pointer">Raw Data Only</Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="BOTH" id="both" />
                        <Label htmlFor="both" className="cursor-pointer">Both Report & Raw Data</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {form.watch("deliverable") !== "REPORT" && (
                    <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-semibold">Data Delivery Configuration</Label>
                      </div>
                      <div>
                        <Label>S3 Bucket Name</Label>
                        <Input
                          placeholder="your-bucket-name"
                          {...form.register("s3BucketName")}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Raw Data Email</Label>
                        <Input
                          type="email"
                          placeholder="data@company.com"
                          {...form.register("rawDataEmail")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-semibold">Vendor Address</Label>
                    </div>
                    <textarea
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Enter vendor address that will appear on reports..."
                      {...form.register("vendorAddress")}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Branding & Images */}
            <AccordionItem value="branding" className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">Branding & Images</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload logos, cover images, and section images
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-8 pt-4">
                  {/* Company Logos */}
                  <div>
                    <Label className="text-base font-semibold">Company Logos</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                      <ImageUploader
                        label="Company Logo"
                        value={form.watch("logoImg") || ""}
                        onChange={(url) => form.setValue("logoImg", url)}
                        folder="vendor-logos"
                      />
                      <ImageUploader
                        label="Cover Logo"
                        value={form.watch("coverLogoImgName") || ""}
                        onChange={(url) => form.setValue("coverLogoImgName", url)}
                        folder="vendor-cover-logos"
                      />
                    </div>
                  </div>

                  {/* Cover Pages */}
                  <div>
                    <Label className="text-base font-semibold">Cover Pages</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                      <ImageUploader
                        label="Front Cover"
                        value={form.watch("coverPageImgName") || ""}
                        onChange={(url) => form.setValue("coverPageImgName", url)}
                        folder="vendor-covers"
                      />
                      <ImageUploader
                        label="Back Cover"
                        value={form.watch("backCoverPageImgName") || ""}
                        onChange={(url) => form.setValue("backCoverPageImgName", url)}
                        folder="vendor-covers"
                      />
                    </div>
                  </div>

                  {/* Section Images */}
                  <div>
                    <Label className="text-base font-semibold">Section Images</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                      <ImageUploader
                        label="Diet Page 1"
                        value={form.watch("dietPage1Img") || ""}
                        onChange={(url) => form.setValue("dietPage1Img", url)}
                        folder="vendor-section-images"
                      />
                      <ImageUploader
                        label="Diet Page 2"
                        value={form.watch("dietPage2Img") || ""}
                        onChange={(url) => form.setValue("dietPage2Img", url)}
                        folder="vendor-section-images"
                      />
                      <ImageUploader
                        label="Fitness Page 1"
                        value={form.watch("fitnessPage1Img") || ""}
                        onChange={(url) => form.setValue("fitnessPage1Img", url)}
                        folder="vendor-section-images"
                      />
                      <ImageUploader
                        label="Fitness Page 2"
                        value={form.watch("fitnessPage2Img") || ""}
                        onChange={(url) => form.setValue("fitnessPage2Img", url)}
                        folder="vendor-section-images"
                      />
                      <ImageUploader
                        label="Weight Page 1"
                        value={form.watch("weightPage1Img") || ""}
                        onChange={(url) => form.setValue("weightPage1Img", url)}
                        folder="vendor-section-images"
                      />
                      <ImageUploader
                        label="Weight Page 2"
                        value={form.watch("weightPage2Img") || ""}
                        onChange={(url) => form.setValue("weightPage2Img", url)}
                        folder="vendor-section-images"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Report Settings */}
            <AccordionItem value="reports" className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5 text-orange-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">Report Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure privacy, security, and layout options
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Hide Personal Information</Label>
                        <p className="text-sm text-muted-foreground">Mask patient data in reports</p>
                      </div>
                      <Switch
                        checked={form.watch("hidePersonalInfo")}
                        onCheckedChange={(checked) => form.setValue("hidePersonalInfo", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label className="font-semibold">Password Protect Reports</Label>
                        <p className="text-sm text-muted-foreground">Require password to access reports</p>
                      </div>
                      <Switch
                        checked={form.watch("passwordProtectedReport")}
                        onCheckedChange={(checked) => form.setValue("passwordProtectedReport", checked)}
                      />
                    </div>

                    {form.watch("passwordProtectedReport") && (
                      <div className="ml-6">
                        <Label>Password Rule</Label>
                        <Select
                          value={form.watch("passwordRule")}
                          onValueChange={(value) => form.setValue("passwordRule", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NAME4_DOB">Name (4 chars) + DOB</SelectItem>
                            <SelectItem value="NAME6_PHONE">Name (6 chars) + Phone</SelectItem>
                            <SelectItem value="EMAIL">Email Address</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label>Cover Page</Label>
                        <p className="text-sm text-muted-foreground">Include cover page</p>
                      </div>
                      <Switch
                        checked={form.watch("coverPage")}
                        onCheckedChange={(checked) => form.setValue("coverPage", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label>Summary Pages</Label>
                        <p className="text-sm text-muted-foreground">Include summary pages</p>
                      </div>
                      <Switch
                        checked={form.watch("summaryPages")}
                        onCheckedChange={(checked) => form.setValue("summaryPages", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label>Blank Pages</Label>
                        <p className="text-sm text-muted-foreground">Add blank pages between sections</p>
                      </div>
                      <Switch
                        checked={form.watch("blankPage")}
                        onCheckedChange={(checked) => form.setValue("blankPage", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <Label>Section Images</Label>
                        <p className="text-sm text-muted-foreground">Include section images</p>
                      </div>
                      <Switch
                        checked={form.watch("sectionImages")}
                        onCheckedChange={(checked) => form.setValue("sectionImages", checked)}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Content Management */}
            <AccordionItem value="content" className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">Content Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage messages, about section, and signatures
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6 pt-4">
                  <div>
                    <Label className="text-base font-semibold">Welcome Message</Label>
                    <RichTextEditor
                      value={form.watch("welcomeMessage") || ""}
                      onChange={(html) => form.setValue("welcomeMessage", html)}
                      placeholder="Write a welcome message for the report..."
                      minHeight={200}
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">About Section</Label>
                    <RichTextEditor
                      value={form.watch("about") || ""}
                      onChange={(html) => form.setValue("about", html)}
                      placeholder="Tell about your company..."
                      minHeight={250}
                    />
                  </div>

                  <div>
                    <ImageUploader
                      label="About Section Image"
                      value={form.watch("aboutImgName") || ""}
                      onChange={(url) => form.setValue("aboutImgName", url)}
                      folder="vendor-about-images"
                    />
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Legal Disclaimer</Label>
                    <RichTextEditor
                      value={form.watch("legalDisContent") || ""}
                      onChange={(html) => form.setValue("legalDisContent", html)}
                      placeholder="Legal disclaimer text..."
                      minHeight={150}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-semibold">Signature Configuration</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <Label>Signature Title</Label>
                        <Input placeholder="e.g., Chief Scientific Officer" {...form.register("sigTitle")} />
                      </div>
                      <div>
                        <Label>Signature Name</Label>
                        <Input placeholder="e.g., Dr. John Doe" {...form.register("sigName")} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <ImageUploader
                        label="Signature Image"
                        value={form.watch("sigImgName") || ""}
                        onChange={(url) => form.setValue("sigImgName", url)}
                        folder="vendor-signatures"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Notifications */}
            <AccordionItem value="notifications" className="border rounded-lg bg-card overflow-hidden">
              <AccordionTrigger className="hover:no-underline px-6 py-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure notification recipients
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-semibold">Report Release Notifications</Label>
                  </div>
                  <Select
                    value={form.watch("notifyTarget")}
                    onValueChange={(value: any) => form.setValue("notifyTarget", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUBJECT">Patient Only</SelectItem>
                      <SelectItem value="BUSINESS_PARTNER">Business Partner Only</SelectItem>
                      <SelectItem value="BOTH">Both Patient & Business Partner</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Choose who should receive notifications when reports are released
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </div>
  );
}