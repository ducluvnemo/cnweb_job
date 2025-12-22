import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

async function fetchPendingJobs() {
  const res = await fetch("/api/v1/job/admin/pending", {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed");
  return json.jobs;
}

async function approveJobApi(id) {
  const res = await fetch(`/api/v1/job/admin/${id}/approve`, {
    method: "PUT",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed");
  return json.job;
}

async function rejectJobApi({ id, reason }) {
  const res = await fetch(`/api/v1/job/admin/${id}/reject`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || "Failed");
  return json.job;
}

const AdminPendingJobs = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminJobsPending"],
    queryFn: fetchPendingJobs,
    retry: 0,
  });

  const approveMutation = useMutation({
    mutationFn: approveJobApi,
    onSuccess: () => queryClient.invalidateQueries(["adminJobsPending"]),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectJobApi,
    onSuccess: () => queryClient.invalidateQueries(["adminJobsPending"]),
  });

  const handleReject = (id) => {
    const reason = rejectReason.trim() || "Not suitable";
    rejectMutation.mutate({ id, reason });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            Duyệt job (PENDING)
          </h1>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
          >
            Quay về Dashboard
          </button>
        </div>

        <div className="mb-3 flex gap-2 text-sm">
          <span className="mt-1 text-slate-700">Lý do reject:</span>
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Nhập lý do hoặc để trống"
          />
        </div>

        {isLoading && <div>Loading...</div>}
        {error && (
          <div className="text-sm text-rose-600">{error.message}</div>
        )}

        <div className="overflow-auto rounded-xl border bg-white">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-slate-600">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Người đăng</th>
                <th className="px-3 py-2">Ngày tạo</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((j) => (
                <tr key={j._id} className="border-b">
                  <td className="px-3 py-2">{j.title}</td>
                  <td className="px-3 py-2">{j.company?.name}</td>
                  <td className="px-3 py-2">
                    {j.created_by?.fullName} ({j.created_by?.email})
                  </td>
                  <td className="px-3 py-2">
                    {new Date(j.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    <button
                      onClick={() => approveMutation.mutate(j._id)}
                      className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(j._id)}
                      className="rounded bg-rose-600 px-3 py-1 text-xs font-medium text-white"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {data && data.length === 0 && !isLoading && (
                <tr>
                  <td
                    className="px-3 py-4 text-center text-slate-500"
                    colSpan={5}
                  >
                    Không có job nào đang chờ duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPendingJobs;
