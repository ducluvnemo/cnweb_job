import { notification } from "antd";
import { OctagonAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";

const ProtectedRouteUser = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    fetch("http://localhost:3000/api/v1/auth/me", {
      method: "GET",
      credentials: "include", // quan trọng: gửi cookie connect.sid
    })
      .then(async (res) => {
        if (res.ok) setAllowed(true);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate("/");
      notification.open({
        message: "Bạn phải đăng nhập để xem nội dung này!",
        icon: <OctagonAlert className="mt-3 text-red-600" />,
        className: "font-bold text-xl",
      });
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!allowed) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRouteUser;
