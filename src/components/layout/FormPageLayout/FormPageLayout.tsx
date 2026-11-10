import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer/PageContainer";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

interface FormPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export default function FormPageLayout({
  title,
  description,
  children,
  action,
}: FormPageLayoutProps) {
  return (
    <PageContainer>
      <PageHeader title={title} description={description} action={action} />

      {children}
    </PageContainer>
  );
}
