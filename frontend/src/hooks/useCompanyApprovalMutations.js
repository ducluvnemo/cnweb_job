import { useMutation, useQueryClient } from "@tanstack/react-query";

async function apiPut(url) {
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json();
  if (!res.ok || !json?.success) throw new Error(json?.message || "Failed");
  return json;
}

export function useCompanyApprovalMutations() {
  const queryClient = useQueryClient();

  const approveCompany = useMutation({
    mutationFn: (companyId) =>
      apiPut(`http://localhost:3000/api/v1/company/admin/${companyId}/approve`),
    onSuccess: async () => {
      // dashboard + list pending đều stale => refetch
      await queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["pendingCompanies"] });
    },
  });

  const rejectCompany = useMutation({
    mutationFn: (companyId) =>
      apiPut(`http://localhost:3000/api/v1/company/admin/${companyId}/reject`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["pendingCompanies"] });
    },
  });

  return { approveCompany, rejectCompany };
}
