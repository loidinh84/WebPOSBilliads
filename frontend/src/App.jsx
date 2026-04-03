import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product/Product";
import Tables from "./pages/Tables";
import RevenueReport from "./pages/Reports/RevenueReport";
import CostReport from "./pages/Reports/CostReport";
import PriceSetting from "./pages/Product/PriceSetting";
import CheckInventory from "./pages/Product/CheckInventory";
import Export from "./pages/Transaction/Export";
import Invoices from "./pages/Transaction/Invoices";
import Import from "./pages/Transaction/Import";
import ReturnImportedGood from "./pages/Transaction/ReturnImportedGood";
import StaffList from "./pages/Employee/StaffList";
import TimeSheet from "./pages/Employee/TimeSheet";
import Schedule from "./pages/Employee/Schedule";
import Salary from "./pages/Employee/Salary";
import StaffSetup from "./pages/Employee/StaffSetup";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import Kitchen from "./pages/Kitchen";
import Cashier from "./pages/Cashier";
import PrintTemplate from "./pages/SetupAdmin/PrintTemplate";
import UserManagement from "./pages/SetupAdmin/UserManagement";
import ActionHistory from "./pages/SetupAdmin/ActionHistory";
import StoreSetup from "./pages/SetupAdmin/StoreSetup";
import Discount from "./pages/SetupAdmin/Discount";
import CreateImport from "./pages/Transaction/CreateImport";
import CreateReturnImport from "./pages/Transaction/CreateReturnImport";

// Component bảo vệ Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" />;

  // Nếu không đủ quyền, đẩy về dashboard
  if (!allowedRoles.includes(user.QUYENHAN)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard chung */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Quản lý", "Nhà bếp", "Thu ngân"]}
            >
              <Account />
            </ProtectedRoute>
          }
        />

        {/* --- PHÂN QUYỀN CÁC TRANG CHUYÊN BIỆT --- */}
        <Route
          path="/settings/store"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <StoreSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/print-templates"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <PrintTemplate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/users"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/discount"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Discount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/history"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ActionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["Nhà bếp", "Quản lý", "Admin"]}>
              <Kitchen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={["Thu ngân", "Quản lý", "Admin"]}>
              <Cashier />
            </ProtectedRoute>
          }
        />

        {/* Quản lý Sản phẩm */}
        <Route path="/products/list" element={<Product />} />
        <Route path="/products/price-setting" element={<PriceSetting />} />
        <Route path="/products/check-inventory" element={<CheckInventory />} />

        {/* Quản lý Bàn & Giao dịch */}
        <Route path="/tables" element={<Tables />} />
        <Route path="/transactions/invoices" element={<Invoices />} />
        <Route path="/transactions/imports" element={<Import />} />
        <Route
          path="/transactions/return-imports"
          element={<ReturnImportedGood />}
        />
        <Route path="/transactions/exports" element={<Export />} />
        <Route path="/import/create" element={<CreateImport />} />
        <Route path="/return-imports/create" element={<CreateReturnImport />} />

        {/* Quản lý Nhân sự */}
        <Route path="/staff/list" element={<StaffList />} />
        <Route path="/staff/schedule" element={<Schedule />} />
        <Route path="/staff/time-sheet" element={<TimeSheet />} />
        <Route path="/staff/payroll" element={<Salary />} />
        <Route path="/staff/settings" element={<StaffSetup />} />

        {/* Báo cáo */}
        <Route path="/reports/revenue" element={<RevenueReport />} />
        <Route path="/reports/cost" element={<CostReport />} />
        <Route path="/reports" element={<RevenueReport />} />
      </Routes>
    </Router>
  );
}

export default App;
