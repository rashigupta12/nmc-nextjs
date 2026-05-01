import { VendorLoginForm } from "@/components/vendor/VendorLoginForm";

interface VendorLoginPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VendorLoginPage({ params }: VendorLoginPageProps) {
  const { slug } = await params;

  return (
    <div className="mt-3 flex items-center">
      <div className="flex-grow">
        <VendorLoginForm slug={slug} />
      </div>
    </div>
  );
}
