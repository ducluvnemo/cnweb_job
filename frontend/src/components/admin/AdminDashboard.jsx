import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BriefcaseBusiness,
  FileText,
  ShieldAlert,
  RefreshCcw,
  Bell,
  Search,
  ChevronDown,
  X,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ======= UI primitives =======
function Card({ className = "", children }) {
  return (
    <div
      className={[
        "rounded-2xl bg-white shadow-sm border border-slate-100",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function CardBody({ className = "", children }) {
  return <div className={["px-5 py-4", className].join(" ")}>{children}</div>;
}

function Pill({ children, tone = "slate" }) {
  const map = {
    slate: "bg-slate-100 text-slate-700",
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        map[tone] || map.slate,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={["animate-pulse rounded-xl bg-slate-100", className].join(" ")}
    />
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ======= Notification helpers =======
const LS_READ_KEY = "admin_notif_read_ids_v1";

function loadReadSet() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_READ_KEY) || "[]");
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function saveReadSet(set) {
  try {
    localStorage.setItem(LS_READ_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

async function ensureDesktopPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  const p = await Notification.requestPermission();
  return p;
}

function ActivityTone(type) {
  if (!type) return "slate";
  if (type.includes("REJECT")) return "rose";
  if (type.includes("APPROVE") || type.includes("APPROVED")) return "emerald";
  if (type.includes("CREATED")) return "sky";
  return "slate";
}

// ======= API =======
async function fetchAdminDashboard(days) {
  const res = await fetch(`/api/v1/admin/dashboard?days=${days}`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json?.success)
    throw new Error(json?.message || "Request failed");
  return json;
}

async function fetchDashboardDetails({ type, days }) {
  const res = await fetch(
    `/api/v1/admin/dashboard/details?type=${type}&days=${days}&limit=50`,
    { credentials: "include" }
  );
  const json = await res.json();
  if (!res.ok || !json?.success)
    throw new Error(json?.message || "Request failed");
  return json;
}

async function fetchAdminActivity(days) {
  const res = await fetch(`/api/v1/admin/activity?days=${days}&limit=20`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json?.success) throw new Error(json?.message || "Failed");
  return json.items || [];
}

async function fetchPendingJobsQuick() {
  const res = await fetch(`/api/v1/admin/jobs/pending?limit=10`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok || !json?.success) throw new Error(json?.message || "Failed");
  return json.jobs || [];
}

const titleByType = {
  newRecruiters: "Recruiter mới",
  newJobSeekers: "Người tìm việc mới",
  jobsApproved: "Job đang APPROVED",
  jobsRejected: "Job bị REJECTED",
};

// ======= helpers =======
function MiniSpark({ dataKey = "value", color = "#ffffff", data = [] }) {
  return (
    <div className="h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCardPremium({
  label,
  value,
  hint,
  icon: Icon,
  gradient,
  onClick,
  sparkData,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
    >
      <div
        className={[
          "group rounded-2xl p-4 text-white shadow-sm transition-all duration-200",
          "hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
          gradient,
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider opacity-90">
              {label}
            </div>
            <div className="mt-2 text-3xl font-semibold leading-none">
              {value}
            </div>
            <div className="mt-2 text-[11px] opacity-90">{hint}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Icon size={18} />
          </div>
        </div>

        <div className="mt-3 opacity-90">
          <MiniSpark dataKey="value" color="#ffffff" data={sparkData} />
        </div>

        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold opacity-90">
          Xem chi tiết <ArrowUpRight size={14} />
        </div>
      </div>
    </div>
  );
}

// ======= NEW: normalize search text (bỏ dấu) =======
const normalizeText = (s = "") =>
  String(s)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();


export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(30);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readSet, setReadSet] = useState(() => loadReadSet());
  const [desktopPerm, setDesktopPerm] = useState("default");
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!e.target.closest("[data-notif-root]")) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Check desktop notification permission
  useEffect(() => {
    if (!("Notification" in window)) {
      setDesktopPerm("unsupported");
    } else {
      setDesktopPerm(Notification.permission);
    }
  }, []);

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["adminDashboard", { days }],
    queryFn: () => fetchAdminDashboard(days),
    staleTime: 0,
    retry: 0,
  });

  const detailsQuery = useQuery({
    queryKey: ["adminDashboardDetails", { type: detailType, days }],
    enabled: detailOpen && !!detailType,
    queryFn: () => fetchDashboardDetails({ type: detailType, days }),
    staleTime: 0,
    retry: 0,
  });

  const activityQuery = useQuery({
    queryKey: ["adminActivity", { days }],
    queryFn: () => fetchAdminActivity(days),
    retry: 0,
  });

  console.log("ADMIN_ACTIVITY", activityQuery.data);

  const pendingJobsQuery = useQuery({
    queryKey: ["adminPendingJobsQuick"],
    queryFn: fetchPendingJobsQuick,
    retry: 0,
  });

  console.log("PENDING_JOBS", pendingJobsQuery.data);

  // Notification logic
  const activityItems = activityQuery.data || [];

  // NEW: Filter activity properly (không slice ở đây)
const activityFiltered = useMemo(() => activityItems, [activityItems]);

const notifItems = useMemo(
  () => activityFiltered.slice(0, 10),
  [activityFiltered]
);

  const unreadCount = useMemo(() => {
    let c = 0;
    for (const a of activityItems) {
      if (a?._id && !readSet.has(a._id)) c++;
    }
    return Math.min(c, 99);
  }, [activityItems, readSet]);

  const markAsRead = useCallback((id) => {
    if (!id) return;
    setReadSet((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadSet(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadSet((prev) => {
      const next = new Set(prev);
      for (const a of activityItems) {
        if (a?._id) next.add(a._id);
      }
      saveReadSet(next);
      return next;
    });
  }, [activityItems]);

  // Search pending jobs (NEW: normalize)
 const pendingJobsFiltered = useMemo(
  () => pendingJobsQuery.data || [],
  [pendingJobsQuery.data]
);


  // NEW: total results (không bị giới hạn top 10)
const totalSearchResults = 0;

  const kpi = useMemo(() => {
    const k = data?.kpi || {};
    return {
      newRecruiters: k.newRecruiters ?? 0,
      newJobSeekers: k.newJobSeekers ?? 0,
      jobsActive: k.jobsActive ?? 0,
      jobsRejected: k.jobsRejected ?? 0,
      rejectionRate: k.rejectionRate ?? 0,
    };
  }, [data]);

  const seriesUsers = useMemo(() => {
    const list = data?.charts?.usersDaily || [];
    return list.map((x) => ({
      name: (x.date || "").slice(5),
      student: x.student ?? 0,
      recruiter: x.recruiter ?? 0,
    }));
  }, [data]);

  const seriesJobs = useMemo(() => {
    const list = data?.charts?.jobsDaily || [];
    return list.map((x) => ({
      name: (x.date || "").slice(5),
      value: x.jobs ?? 0,
    }));
  }, [data]);

  const seriesApplications = useMemo(() => {
    const list = data?.charts?.applicationsDaily || [];
    return list.map((x) => ({
      name: (x.date || "").slice(5),
      value: x.applications ?? 0,
    }));
  }, [data]);

  const loading = isLoading || isFetching;
  const errMsg = error?.message || "";

  const openDetails = (type) => {
    setDetailType(type);
    setDetailOpen(true);
  };

  const sparkJobs = useMemo(() => seriesJobs.slice(-10), [seriesJobs]);
  const sparkApps = useMemo(() => seriesApplications.slice(-10), [seriesApplications]);
  const sparkRecruiters = useMemo(
    () =>
      seriesUsers
        .slice(-10)
        .map((x) => ({ name: x.name, value: x.recruiter })),
    [seriesUsers]
  );
  const sparkStudents = useMemo(
    () =>
      seriesUsers.slice(-10).map((x) => ({ name: x.name, value: x.student })),
    [seriesUsers]
  );

  const refreshAll = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0]?.startsWith("admin"),
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar với Search + Notification */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-900">Dashboard</div>
            <div className="hidden text-xs text-slate-400 sm:block">
              Control panel
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification dropdown */}
            <div className="relative" data-notif-root>
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                aria-label="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center min-w-[20px] rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white shadow-sm">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[380px] max-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
                    <div className="text-sm font-semibold text-slate-900">
                      Notifications
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={async () => {
                          const p = await ensureDesktopPermission();
                          setDesktopPerm(p);
                        }}
                        className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                        title="Desktop notifications"
                      >
                        🔔 {desktopPerm === "granted" ? "ON" : "OFF"}
                      </button>
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Read all
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[400px] overflow-auto">
                    {activityQuery.isLoading ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        <Skeleton className="mx-auto h-4 w-32 mb-2" />
                        <Skeleton className="mx-auto h-4 w-20" />
                      </div>
                    ) : activityQuery.error ? (
                      <div className="p-4 text-sm text-rose-600 border-t border-slate-100">
                        {activityQuery.error.message}
                      </div>
                    ) : notifItems.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No notifications found
                      </div>
                    ) : (
                      notifItems.map((a) => {
                        const unread = a?._id && !readSet.has(a._id);
                        return (
                          <button
                            key={a._id}
                            type="button"
                            onClick={() => {
                              markAsRead(a._id);
                              if (String(a.type || "").startsWith("JOB_")) {
                                navigate("/admin/pending-jobs");
                              } else if (
                                String(a.type || "").startsWith("COMPANY_")
                              ) {
                                navigate("/admin/pending-companies");
                              }
                              setNotifOpen(false);
                            }}
                            className={[
                              "w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 focus:outline-none focus:bg-sky-50",
                              unread
                                ? "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100"
                                : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-800 truncate">
                                  {a.message || a.type}
                                </div>
                                <div className="mt-0.5 text-[11px] text-slate-500">
                                  {a.actor?.fullName || "System"}
                                  {a.company?.name && ` • ${a.company.name}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Pill tone={ActivityTone(a.type)}>{a.type}</Pill>
                                {unread && (
                                  <div className="w-2 h-2 bg-sky-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            <div className="mt-1 text-[10px] text-slate-400">
                              {new Date(a.createdAt).toLocaleString("vi-VN")}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar */}
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 text-xs font-semibold text-white flex items-center justify-center">
                A
              </div>
              <span className="text-xs text-slate-700">Admin</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xl font-semibold text-slate-900 leading-tight">
              Tổng quan hệ thống
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Thống kê trong {days} ngày gần nhất{" "}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/pending-companies")}
              className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-800 transition-colors"
            >
              Duyệt công ty
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/pending-jobs")}
              className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-yellow-700 transition-colors"
            >
              Duyệt job
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/listUser")}   
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white border border-slate-200 shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Danh sách tài khoản
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/jobs")}  // route tới trang danh sách job
              className="rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-white border border-slate-200 shadow-sm hover:bg-cyan-700 transition-colors"
            >
              Danh sách job
            </button>
            <Pill tone="slate">Days</Pill>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-sm outline-none hover:border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value={7}>7 ngày</option>
              <option value={14}>14 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={90}>90 ngày</option>
            </select>

            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>

        {errMsg ? (
          <Card className="mb-6">
            <CardHeader
              title="Không tải được dữ liệu"
              subtitle="Kiểm tra lại API /api/v1/admin/dashboard hoặc quyền admin."
              right={<Pill tone="rose">Error</Pill>}
            />
            <CardBody>
              <div className="text-sm text-rose-600">{errMsg}</div>
            </CardBody>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr,2fr]">
          {/* LEFT - Charts & KPIs */}
          <div className="space-y-6">
            {/* KPI Cards */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <KpiCardPremium
                  label="Recruiter mới"
                  value={kpi.newRecruiters}
                  hint={`Trong ${days} ngày`}
                  icon={BriefcaseBusiness}
                  gradient="bg-gradient-to-br from-sky-500 to-indigo-600"
                  onClick={() => openDetails("newRecruiters")}
                  sparkData={sparkRecruiters}
                />
                <KpiCardPremium
                  label="Người tìm việc mới"
                  value={kpi.newJobSeekers}
                  hint={`Trong ${days} ngày`}
                  icon={Users}
                  gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                  onClick={() => openDetails("newJobSeekers")}
                  sparkData={sparkStudents}
                />
                <KpiCardPremium
                  label="Job APPROVED"
                  value={kpi.jobsActive}
                  hint="Đang hiển thị"
                  icon={FileText}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                  onClick={() => openDetails("jobsApproved")}
                  sparkData={sparkJobs}
                />
                <KpiCardPremium
                  label="Tỉ lệ REJECT"
                  value={`${kpi.rejectionRate}%`}
                  hint={`${kpi.jobsRejected} job`}
                  icon={ShieldAlert}
                  gradient="bg-gradient-to-br from-rose-500 to-pink-600"
                  onClick={() => openDetails("jobsRejected")}
                  sparkData={sparkApps}
                />
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader
                  title="Hoạt động user"
                  subtitle="Student & Recruiter theo ngày"
                  right={
                    <div className="flex items-center gap-2">
                      <Pill tone="emerald">Student</Pill>
                      <Pill tone="sky">Recruiter</Pill>
                    </div>
                  }
                />
                <CardBody className="h-[300px]">
                  {loading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={seriesUsers}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tickMargin={8}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="student"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="recruiter"
                          stroke="#0ea5e9"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardBody>
              </Card>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader
                    title="Jobs tạo mới"
                    subtitle="Số job mỗi ngày"
                    right={<Pill tone="sky">Jobs</Pill>}
                  />
                  <CardBody className="h-[260px]">
                    {loading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={seriesJobs}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#38bdf8"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader
                    title="Applications"
                    subtitle="Số application mỗi ngày"
                    right={<Pill tone="emerald">Apps</Pill>}
                  />
                  <CardBody className="h-[260px]">
                    {loading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={seriesApplications}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={8}
                          />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#22c55e"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>

          {/* RIGHT - Profile + Activity + Pending Jobs */}
          <div className="space-y-6">
            <Card>
              <CardBody className="flex items-center gap-3 p-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  A
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Admin</div>
                  <div className="text-xs text-slate-500">System Administrator</div>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader
                title="Recent Activity"
                subtitle="Cập nhật gần đây"
                right={<Pill tone="emerald">Live</Pill>}
              />
              <CardBody className="space-y-2 p-0">
                {activityQuery.isLoading ? (
                  <div className="p-4">
                    <Skeleton className="h-12 mb-2" />
                    <Skeleton className="h-12" />
                  </div>
                ) : activityQuery.error ? (
                  <div className="p-4 text-sm text-rose-600">
                    {activityQuery.error.message}
                  </div>
                ) : activityItems.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Chưa có hoạt động
                  </div>
                ) : (
                  activityItems.slice(0, 5).map((a) => {
                    const unread = a?._id && !readSet.has(a._id);
                    return (
                      <button
                        key={a._id}
                        type="button"
                        className={[
                          "w-full text-left p-4 hover:bg-slate-50 focus:outline-none focus:bg-sky-50",
                          unread
                            ? "bg-sky-50 border-r-4 border-sky-400"
                            : "hover:bg-slate-50",
                        ].join(" ")}
                        onClick={() => {
                          markAsRead(a._id);
                          if (String(a.type || "").startsWith("JOB_"))
                            navigate("/admin/pending-jobs");
                          if (String(a.type || "").startsWith("COMPANY_"))
                            navigate("/admin/pending-companies");
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-slate-900 truncate">
                              {a.message || a.type}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {new Date(a.createdAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <Pill tone={ActivityTone(a.type)}>{a.type}</Pill>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardBody>
            </Card>

            {/* Pending Jobs */}
            <Card>
              <CardHeader
                title="Jobs chờ duyệt"
                subtitle={`${pendingJobsFiltered.length} job`}
                right={<Pill tone="amber">PENDING</Pill>}
              />
              <CardBody className="space-y-3 p-0">
                {pendingJobsQuery.isLoading ? (
                  <div className="p-4">
                    <Skeleton className="h-14 mb-2" />
                    <Skeleton className="h-14" />
                  </div>
                ) : pendingJobsQuery.error ? (
                  <div className="p-4 text-sm text-rose-600">
                    {pendingJobsQuery.error.message}
                  </div>
                ) : pendingJobsFiltered.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Không có job chờ duyệt
                  </div>
                ) : (
                  pendingJobsFiltered.map((j) => (
                    <button
                      key={j._id}
                      type="button"
                      className="w-full text-left rounded-xl border border-slate-100 bg-white p-4 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      onClick={() => navigate("/admin/pending-jobs")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {j.title}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {j.company?.name || "N/A"} •{" "}
                            {new Date(j.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        <Pill tone="amber">PENDING</Pill>
                      </div>
                    </button>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => navigate("/admin/pending-jobs")}
                  className="w-full rounded-xl border-2 border-dashed border-slate-200 p-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                >
                  Xem tất cả {pendingJobsQuery.data?.length || 0} job pending
                </button>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Details Modal */}
        <Modal
          open={detailOpen}
          title={titleByType[detailType] || "Chi tiết"}
          onClose={() => setDetailOpen(false)}
        >
          {detailsQuery.isLoading ? (
            <div className="grid gap-3 p-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : detailsQuery.error ? (
            <div className="p-8 text-center text-sm text-rose-600">
              {detailsQuery.error.message}
            </div>
          ) : (
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 pl-4 pr-6 text-left font-semibold text-slate-700">
                      Tên/Title
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-slate-700">
                      Email/Status
                    </th>
                    <th className="py-3 pr-4 text-left font-semibold text-slate-700">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(detailsQuery.data?.items || []).map((it) => (
                    <tr
                      key={it._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 pl-4 pr-6 text-slate-900 font-medium">
                        {it.fullName || it.title || "-"}
                      </td>
                      <td className="py-3 px-6 text-slate-700">
                        {it.email || it.status || "-"}
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-500">
                        {new Date(it.createdAt || it.updatedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(detailsQuery.data?.items || []).length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  Không có dữ liệu
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
