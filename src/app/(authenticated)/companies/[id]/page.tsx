import { redirect } from "next/navigation";

export default async function CompanyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(`/companies/${id}/general`);
}
