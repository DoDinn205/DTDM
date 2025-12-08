import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import các trang mình đã tạo
import Login from './pages/Auth/Login'; //Login
import Register from './pages/Auth/Register'; //Register
import Home from './pages/Dashboard/Home'; //Home
import Trash from './pages/Dashboard/Trash'; //Trash 

// Hàm bảo vệ: Nếu chưa có token (chưa đăng nhập) thì tự đá về trang Login
const PrivateRoute = ({ children }) => {
  // Lưu ý: Kiểm tra lại xem lúc Login bạn lưu là 'token' hay 'accessToken'
  // Nếu chưa chắc thì cứ để code này, lát test sau.
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
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

        {/* Đường dẫn trang chủ (được bảo vệ) */}
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/trash" element={
          <PrivateRoute>
            <Trash />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;