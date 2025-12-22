import { notification } from "antd";
import { OctagonAlert } from "lucide-react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Chưa login
    if (!user) {
      navigate("/login", { replace: true });
      notification.open({
        message: "Bạn phải đăng nhập để xem nội dung này!",
        icon: <OctagonAlert className="mt-3 text-red-600" />,
        className: "font-bold text-xl",
      });
      return;
    }

    // 2) Login rồi nhưng sai role
    if (roles.length > 0 && !roles.includes(user.role)) {
      navigate("/", { replace: true });
      notification.open({
        message: "Bạn không có quyền truy cập trang này!",
        icon: <OctagonAlert className="mt-3 text-red-600" />,
        className: "font-bold text-xl",
      });
    }
  }, [user, roles, navigate]);

  // Chặn render nếu chưa đủ điều kiện (tránh nháy UI)
  if (!user) return null;
  if (roles.length > 0 && !roles.includes(user.role)) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
