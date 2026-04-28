// components/forms/FormField.tsx
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  error?: string;
}

export function FormField({ label, required, children, hint, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}