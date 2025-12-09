import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../services/api'; 
import { toast } from 'react-toastify'; 
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa'; 

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',     
        email: '',    
        password: '', 
        confirmPassword: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            // Gọi API đăng ký
            await authApi.register(formData.name, formData.email, formData.password);
            
            toast.success("Đăng ký thành công! Hãy đăng nhập.");
            navigate('/login'); 

        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            const errorMsg = error.response?.data?.message || "Đăng ký thất bại.";
            toast.error(errorMsg);
        }
    };

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            minHeight: '100vh', backgroundColor: '#f0f2f5' 
        }}>
            <form onSubmit={handleRegister} style={{ 
                padding: '40px', background: 'white', borderRadius: '10px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '350px'
            }}>
                <h2 style={{ textAlign: 'center', color: '#1890ff', marginBottom: '20px' }}>
                    <FaUserPlus style={{ marginRight: '10px' }}/> Đăng Ký
                </h2>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={{fontWeight: 'bold'}}>Họ và tên</label>
                    <input 
                        name="name" type="text" placeholder="Nhập tên hiển thị"
                        onChange={handleChange} required 
                        style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{fontWeight: 'bold'}}>Email</label>
                    <input 
                        name="email" type="email" placeholder="example@gmail.com"
                        onChange={handleChange} required 
                        style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{fontWeight: 'bold'}}>Mật khẩu</label>
                    <input 
                        name="password" type="password" placeholder="Nhập mật khẩu"
                        onChange={handleChange} required 
                        style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{fontWeight: 'bold'}}>Nhập lại mật khẩu</label>
                    <input 
                        name="confirmPassword" type="password" placeholder="Xác nhận mật khẩu"
                        onChange={handleChange} required 
                        style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '5px' }} 
                    />
                </div>

                <button type="submit" style={{ 
                    width: '100%', padding: '12px', backgroundColor: '#1890ff', 
                    color: 'white', border: 'none', borderRadius: '5px', 
                    cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                }}>
                    Đăng Ký Ngay
                </button>

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    Đã có tài khoản? <Link to="/login" style={{color: '#1890ff', textDecoration: 'none', fontWeight: 'bold'}}>Đăng nhập</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;