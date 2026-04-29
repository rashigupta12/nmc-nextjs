/*eslint-disable @typescript-eslint/no-unused-vars */
// src/components/admin/VendorForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createVendor } from "@/actions/admin/vendor-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Country, State, City } from "country-state-city";

const pointOfContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const vendorSchema = z.object({
  name: z.string().min(2, "Company Name is required"),
  address: z.string().min(5, "Address is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactNo: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  pointOfContacts: z.array(pointOfContactSchema).min(1, "At least one Point of Contact is required"),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  onSuccess?: () => void;
}

export function VendorForm({ onSuccess }: VendorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      address: "",
      email: "",
      contactNo: "",
      website: "",
      gstNumber: "",
      city: "",
      state: "",
      country: "India",
      zipCode: "",
      pointOfContacts: [
        { name: "", designation: "", email: "", phoneNumber: "", isPrimary: true }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pointOfContacts",
  });

  async function onSubmit(data: VendorFormValues) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Append scalar fields
      if (data.name) formData.append('name', data.name);
      if (data.address) formData.append('address', data.address);
      if (data.email) formData.append('email', data.email);
      if (data.contactNo) formData.append('contactNo', data.contactNo);
      if (data.website) formData.append('website', data.website);
      if (data.gstNumber) formData.append('gstNumber', data.gstNumber);
      if (data.city) formData.append('city', data.city);
      if (data.state) formData.append('state', data.state);
      if (data.country) formData.append('country', data.country);
      if (data.zipCode) formData.append('zipCode', data.zipCode);
      
      // Append array field as JSON
      formData.append('pointOfContacts', JSON.stringify(data.pointOfContacts));

      const result = await createVendor(formData);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        toast({
          title: "Success",
          description: result.message,
        });
        form.reset();
        onSuccess?.();
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the Business Partner's basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input placeholder="GST number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              Business Partner's registered office address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {Country.getAllCountries().map((country: any) => (
                          <SelectItem key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => {
                  const selectedCountry = useWatch({
                    control: form.control,
                    name: "country"
                  });
                  const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : [];
                  
                  useEffect(() => {
                    field.onChange("");
                    form.setValue("city", "");
                  }, [selectedCountry]);

                  return (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedCountry}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {states.map((state: any) => (
                            <SelectItem key={state.isoCode} value={state.isoCode}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => {
                  const selectedCountry = useWatch({
                    control: form.control,
                    name: "country"
                  });
                  const selectedState = useWatch({
                    control: form.control,
                    name: "state"
                  });
                  const cities = selectedCountry && selectedState ? City.getCitiesOfState(selectedCountry, selectedState) : [];
                  
                  useEffect(() => {
                    field.onChange("");
                  }, [selectedState]);

                  return (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedState}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {cities.map((city: any) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Zip code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Point of Contacts</CardTitle>
                <CardDescription>
                  Add contact persons for this Business Partner. At least one contact is required.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ name: "", designation: "", email: "", phoneNumber: "", isPrimary: false })}
              >
                + Add Contact
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border p-4 rounded-lg bg-gray-50">
                <FormField
                  control={form.control}
                  name={`pointOfContacts.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`pointOfContacts.${index}.designation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Designation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`pointOfContacts.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`pointOfContacts.${index}.phoneNumber`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  {fields.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}

          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Business Partner
          </Button>
        </div>
      </form>
    </Form>
  );
}