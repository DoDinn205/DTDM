import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các trang mình đã tạo
import Login from './pages/Auth/Login'; //Login
import Register from './pages/Auth/Register'; //Register
import Home from './pages/Dashboard/Home'; //Home
import Trash from './pages/Dashboard/Trash'; //Trash 
import AdminAccount from './pages/Admin/Dashboard'; //Admin Dashboard 
import ShareFile from "./pages/ShareFile";
// Hàm bảo vệ: Nếu chưa có token (chưa đăng nhập) thì tự đá về trang Login
import NoPermission from './pages/NoPermission';
 
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (role !== "admin") return <Navigate to="/no-permission" replace />;

  return children;
};
function App() {
  return (
    <BrowserRouter>
      {/* Khung hiển thị thông báo popup */}
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>
        {/* Đường dẫn trang Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/no-permission" element={<NoPermission />} />
        {/* Đường dẫn trang chủ (được bảo vệ) */}
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
         <Route path="/share/file/:fileId" element={
          <PrivateRoute>
            <ShareFile />
          </PrivateRoute>
        } />
      
        <Route path="/trash" element={
          <PrivateRoute>
            <Trash />
          </PrivateRoute>
        } />

        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminAccount />
          </AdminRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;