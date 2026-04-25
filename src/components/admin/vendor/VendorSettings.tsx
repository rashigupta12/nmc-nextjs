/*eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/VendorSettings.tsx

"use client";

import { updateVendorSettings } from "@/actions/admin/vendor-settings-actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell, FileText, Layout, Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const settingsSchema = z.object({
  // Deliverables
  deliverable: z.enum(["REPORT", "RAW_DATA", "BOTH"]),
  s3BucketName: z.string().optional(),
  rawDataEmail: z.string().email().optional(),
  
  // Privacy
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
  
  // Notifications
  notifyTarget: z.enum(["SUBJECT", "BUSINESS_PARTNER", "BOTH"]),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface VendorSettingsProps {
  vendorId: string;
  initialSettings: any;
}

export function VendorSettings({ vendorId, initialSettings }: VendorSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialSettings || {
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

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true);
    try {
      const result = await updateVendorSettings(vendorId, data);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Accordion type="single" collapsible defaultValue="general" className="space-y-4">
          
          {/* General Settings Accordion */}
          <AccordionItem value="general" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">General Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure vendor deliverables and data delivery options
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="deliverable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deliverable Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select deliverable type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REPORT">Report Only</SelectItem>
                          <SelectItem value="RAW_DATA">Raw Data Only</SelectItem>
                          <SelectItem value="BOTH">Both Report & Raw Data</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        What should be delivered to the business partner
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("deliverable") !== "REPORT" && (
                  <>
                    <FormField
                      control={form.control}
                      name="s3BucketName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>S3 Bucket Name</FormLabel>
                          <FormControl>
                            <Input placeholder="bucket-name" {...field} />
                          </FormControl>
                          <FormDescription>
                            S3 bucket for raw data delivery
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rawDataEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raw Data Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="data@company.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            Email to send raw data notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Report Settings Accordion */}
          <AccordionItem value="report" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Report Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure report generation and privacy settings
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="hidePersonalInfo"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Hide Personal Information</FormLabel>
                        <FormDescription>
                          Mask patient personal data in reports
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passwordProtectedReport"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Password Protect Reports</FormLabel>
                        <FormDescription>
                          Require password to access generated reports
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("passwordProtectedReport") && (
                  <FormField
                    control={form.control}
                    name="passwordRule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Rule</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select password rule" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NAME4_DOB">Name (4 chars) + DOB</SelectItem>
                            <SelectItem value="NAME6_PHONE">Name (6 chars) + Phone</SelectItem>
                            <SelectItem value="EMAIL">Email Address</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="coverPage"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Cover Page</FormLabel>
                          <FormDescription>Include cover page in report</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summaryPages"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Summary Pages</FormLabel>
                          <FormDescription>Include summary pages</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skinCoverBackPage"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Skin Cover Back Page</FormLabel>
                          <FormDescription>Include skin cover back page</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="blankPage"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Blank Page</FormLabel>
                          <FormDescription>Include blank pages between sections</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sectionImages"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Section Images</FormLabel>
                          <FormDescription>Include section images in reports</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="splitWellnessReport"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Split Wellness Report</FormLabel>
                          <FormDescription>Split wellness report into sections</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Content Settings Accordion */}
          <AccordionItem value="content" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Layout className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Content Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize report content and branding
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="welcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          rows={3}
                          placeholder="Welcome message for report..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Section</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          rows={4}
                          placeholder="About the testing lab..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalDisContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Disclaimer</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          rows={3}
                          placeholder="Legal disclaimer text..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sigTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Chief Scientific Officer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sigName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Dr. John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Notification Settings Accordion */}
          <AccordionItem value="notifications" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure who receives report notifications
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <div className="pt-4">
                <FormField
                  control={form.control}
                  name="notifyTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Recipient</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select notification target" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SUBJECT">Patient Only</SelectItem>
                          <SelectItem value="BUSINESS_PARTNER">Business Partner Only</SelectItem>
                          <SelectItem value="BOTH">Both Patient & Business Partner</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Who should receive report release notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Save Button */}
        <div className="flex justify-end sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-sm">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}