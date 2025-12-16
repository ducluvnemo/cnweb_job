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
import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from "./components/redux/authSlice";
import { USER_API_END_POINT } from "./components/utils/constant";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "./components/ui/toast";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/forgot-password/otp",
    element: <ForgotPasswordOtp />,
  },
  {
    path: "/reset-password/:email",
    element: <ResetPassword />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
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
    path: "/brower",
    element: <Browse />,
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
    path: "/dashboard",
    element: (
      <ProtectedRouteUser>
        <Home />
      </ProtectedRouteUser>
    ),
  },
  //admin route
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute>
        <CompanyAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/create",
    element: (
      <ProtectedRoute>
        <CreateCompany />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies/:id",
    element: (
      <ProtectedRoute>
        <CompanySetupData />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute>
        <JobsAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id",
    element: (
      <ProtectedRoute>
        <EditJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/create",
    element: (
      <ProtectedRoute>
        <CreateJob />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: (
      <ProtectedRoute>
        <Applicants />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/createUser",
    element: (
      <ProtectedRoute>
        <CreateUserAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/listUser",
    element: (
      <ProtectedRoute>
        <ListUserAdmin />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // bắt lỗi từ OAuth callback (?error=google|github)
    const url = new URL(window.location.href);
    const oauthError = url.searchParams.get("error");
    if (oauthError) {
      toast({
        title: `Đăng nhập ${oauthError} thất bại`,
        status: "error",
        action: <ToastAction altText="Đóng">Đóng</ToastAction>,
      });
      // xóa param để tránh hiện lại
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }

    const fetchMe = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/auth/me`, {
          withCredentials: true,
        });
        console.log("OAuth /auth/me response:", res.data);
        if (res.data?.user) {
          dispatch(setAuthUser(res.data.user));
          toast({
            title: "Đăng nhập thành công",
            status: "success",
          });
        } else {
          toast({
            title: "Chưa đăng nhập",
            status: "error",
          });
        }
      } catch (err) {
        console.error("OAuth /auth/me error:", err);
        toast({
          title: "Không lấy được thông tin người dùng",
          status: "error",
        });
      }
    };
    fetchMe();
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
