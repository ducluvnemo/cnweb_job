import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "../ui/toast";
import { COMPANY_API_END_POINT } from "../utils/constant";
import { useNavigate } from "react-router-dom";

const PendingCompaniesAdmin = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${COMPANY_API_END_POINT}/admin/pending`, {
        withCredentials: true,
      });

      setCompanies(res.data?.companies || []);
    } catch (err) {
      toast({
        title:
          err?.response?.data?.message ||
          `Không lấy được danh sách công ty chờ duyệt (HTTP ${
            err?.response?.status || "?"
          })`,
        status: "error",
        action: <ToastAction altText="OK">OK</ToastAction>,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const approve = async (id) => {
    await axios.put(
      `${COMPANY_API_END_POINT}/admin/${id}/approve`,
      {},
      { withCredentials: true }
    );
    fetchPendingCompanies();
  };

  const reject = async (id) => {
    await axios.put(
      `${COMPANY_API_END_POINT}/admin/${id}/reject`,
      {},
      { withCredentials: true }
    );
    fetchPendingCompanies();
  };

  const remove = async (id) => {
    await axios.delete(`${COMPANY_API_END_POINT}/admin/${id}`, {
      withCredentials: true,
    });
    fetchPendingCompanies();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">
            Duyệt công ty
          </h1>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white"
          >
            Quay về Dashboard
          </button>
        </div>

        {loading && <div>Loading...</div>}

        {!loading && companies.length === 0 && (
          <div>Không có công ty nào đang PENDING.</div>
        )}

        <div className="space-y-3">
          {companies.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between rounded border bg-white p-4"
            >
              <div className="pr-4">
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">
                  Status: {c.status} | Recruiter: {c.userId?.email || "N/A"}
                </div>
                {c.website && (
                  <div className="text-sm">Website: {c.website}</div>
                )}
                {c.location && (
                  <div className="text-sm">Location: {c.location}</div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => approve(c._id)}>Approve</Button>
                <Button variant="secondary" onClick={() => reject(c._id)}>
                  Reject
                </Button>
                <Button variant="destructive" onClick={() => remove(c._id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingCompaniesAdmin;
