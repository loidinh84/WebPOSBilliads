import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" replace />;

  // Nếu quyền của user không nằm trong danh sách được phép
  if (!allowedRoles.includes(user.QUYENHAN)) {
    // Trả về trang Dashboard hoặc trang "Không có quyền"
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
