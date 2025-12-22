import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "../queryKeys/adminKeys";

export function useAdminDashboard(days) {
  return useQuery({
    queryKey: adminKeys.dashboard(days),
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3000/api/v1/admin/dashboard?days=${days}`,
        { credentials: "include" }
      );
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Failed");
      return json;
    },
    staleTime: 0,
  });
}
