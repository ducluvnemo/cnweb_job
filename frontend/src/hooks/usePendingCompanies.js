import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "../queryKeys/adminKeys";

export function usePendingCompanies() {
  return useQuery({
    queryKey: adminKeys.pendingCompanies(),
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/v1/company/admin/pending", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Failed");
      return json;
    },
  });
}
