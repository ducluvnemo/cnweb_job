import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Login from "./components/auth/login";
import SignUp from "./components/auth/SignUp";
import Home from "./components/Home";
import Jobs from "./components/Jobs";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import JobDescription from "./components/JobDescription";
import CompanyAdmin from "./components/admin/CompanyAdmin";
import CreateCompany from "./components/admin/CreateCompany";
import CompanySetupData from "./components/admin/CompanySetupData";
import JobsAdmin from "./components/admin/JobsAdmin";
import CreateJob from "./components/admin/CreateJob";
import Applicants from "./components/admin/Applicants";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import ProtectedRouteUser from "./components/ProtectedRouteUser";
import EditJob from "./components/admin/EditJob";
import ForgotPassword from "./components/auth/ForgotPassword";
import ForgotPasswordOtp from "./components/auth/ForgotPasswordOtp";
import ResetPassword from "./components/auth/ResetPassword";
import CreateUserAdmin from "./components/admin/CreateUserAdmin";
import ListUserAdmin from "./components/admin/ListUserAdmin";
import CreateCV from "./components/CreateCV";
import PendingCompaniesAdmin from "./components/admin/PendingCompaniesAdmin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminPendingJobs from "./components/admin/AdminPendingJobs";


import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "./components/redux/authSlice";
import { USER_API_END_POINT } from "./components/utils/constant";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "./components/ui/toast";

const appRouter = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/forgot-password/otp", element: <ForgotPasswordOtp /> },
  { path: "/reset-password/:email", element: <ResetPassword /> },
  { path: "/jobs", element: <Jobs /> },
  { path: "/brower", element: <Browse /> },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },

  // ADMIN routes
  {
    path: "/admin/pending-companies",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <PendingCompaniesAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/pending-jobs",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminPendingJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/createUser",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <CreateUserAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/listUser",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <ListUserAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/description/:id",
    element: (
      <ProtectedRouteUser>
        <JobDescription />
      </ProtectedRouteUser>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRouteUser>
        <Profile />
      </ProtectedRouteUser>
    ),
  },
  {
    path: "/create-cv",
    element: (
      <ProtectedRouteUser>
        <CreateCV />
      </ProtectedRouteUser>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRouteUser>
        <Home />
      </ProtectedRouteUser>
    ),
  },

  // RECRUITER routes (giữ path cũ của bạn)
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute roles={["recruiter", "admin"]}>
        <CompanyAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute roles={["recruiter", "admin"]}>
        <CreateCompany />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute roles={["recruiter", "admin"]}>
        <CompanySetupData />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute roles={["recruiter", "admin"]}>
        <JobsAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id",
    element: (
      <ProtectedRoute roles={["recruiter", "admin"]}>
        <EditJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute roles={["recruiter", "admin"]}>
        <CreateJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute roles={["recruiter", "admin"]}>
        <Applicants />
      </ProtectedRoute>
    ),
  },

  // ADMIN routes (admin thật sự)
  {
    path: "/admin/pending-companies",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <PendingCompaniesAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/createUser",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <CreateUserAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/listUser",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <ListUserAdmin />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const url = new URL(window.location.href);
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      toast({
        title: `Đăng nhập ${oauthError} thất bại`,
        status: "error",
        action: <ToastAction altText="Đóng">Đóng</ToastAction>,
      });
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }

    const fetchMe = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/me`, {
          withCredentials: true,
        });

        if (res.data?.user) {
          dispatch(setAuthUser(res.data.user));
        }
      } catch (err) {
        // Không cần toast ở đây để khỏi spam khi chưa login
      }
    };

    fetchMe();
  }, [dispatch]);

  return <RouterProvider router={appRouter} />;
}

export default App;
