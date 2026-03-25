import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Product from "./pages/Product/Product";
import Tables from "./pages/Tables";
import Reports from "./pages/Reports";
import PriceSetting from "./pages/Product/PriceSetting";
import CheckInventory from "./pages/Product/CheckInventory";
import Export from "./pages/Transaction/Export";
import Invoices from "./pages/Transaction/Invoices";
import Import from "./pages/Transaction/Import";
import ReturnGood from "./pages/Transaction/ReturnGood";
import StaffList from "./pages/Employee/StaffList";
import TimeSheet from "./pages/Employee/TimeSheet";
import Schedule from "./pages/Employee/Schedule";
import Salary from "./pages/Employee/Salary";
import StaffSetup from "./pages/Employee/StaffSetup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products/list" element={<Product />} />
        <Route path="/products/price-setting" element={<PriceSetting />} />
        <Route path="/products/check-inventory" element={<CheckInventory />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/transactions/invoices" element={<Invoices />} />
        <Route path="/transactions/imports" element={<Import />} />
        <Route path="/transactions/return-imports" element={<ReturnGood />} />
        <Route path="/transactions/exports" element={<Export />} />
        <Route path="/staff/list" element={<StaffList />} />
        <Route path="/staff/schedule" element={<Schedule />} />
        <Route path="/staff/time-sheet" element={<TimeSheet />} />
        <Route path="/staff/payroll" element={<Salary />} />
        <Route path="/staff/settings" element={<StaffSetup />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
