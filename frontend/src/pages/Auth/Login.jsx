import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState(''); // Sửa username -> email
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await authApi.login(email, password);
            console.log("Kết quả Login:", res.data); // Xem log

            // Kiểm tra xem backend trả về accessToken hay token
            const token = res.data.accessToken || res.data.token;
            const role = res.data.role;
            if (res.data && res.data.accessToken) {
    localStorage.setItem('accessToken', res.data.accessToken); 
    localStorage.setItem('role', res.data.role);
    // Dùng dòng này để ép trình duyệt load lại trang, đảm bảo vào được Home
    window.location.href = role == 'admin' ? '/admin/dashboard' : '/'; 

                
            } else {
                toast.error("Server không trả về Token!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Sai email hoặc mật khẩu");
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <form onSubmit={handleLogin} style={{ padding: '30px', border: '1px solid #ddd', borderRadius: '8px', width: '300px' }}>
                <h2 style={{ textAlign: 'center' }}>Đăng Nhập</h2>
                
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input 
                        type="text" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label>Mật khẩu:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <button type="submit" style={{ width: '100%', padding: '10px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Đăng Nhập
                </button>
                
                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;