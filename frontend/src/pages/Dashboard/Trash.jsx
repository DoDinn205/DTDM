import { useState, useEffect } from 'react';
import { fileApi } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTrashRestore, FaTimes, FaArrowLeft, FaRecycle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Trash = () => {
    const [trashItems, setTrashItems] = useState([]);
    const navigate = useNavigate();

    // Tải danh sách thùng rác
    const fetchTrash = async () => {
        try {
            const res = await fileApi.getTrash();
            // Kiểm tra cấu trúc trả về (có thể là res.data hoặc res.data.files...)
            setTrashItems(res.data.files || res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    // Khôi phục
    const handleRestore = async (id) => {
        try {
            await fileApi.restore(id);
            toast.success("Đã khôi phục!");
            fetchTrash(); // Load lại
        } catch (error) {
            toast.error("Lỗi khôi phục");
        }
    };

    // Xóa vĩnh viễn
    const handleDeleteForever = async (id) => {
        if (!window.confirm("Cảnh báo: Bạn có chắc xóa vĩnh viễn? Không thể lấy lại được nữa!")) return;
        try {
            await fileApi.deletePermanent(id);
            toast.success("Đã xóa vĩnh viễn");
            fetchTrash();
        } catch (error) {
            toast.error("Lỗi xóa vĩnh viễn");
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '10px', background: 'none', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <FaArrowLeft /> Quay lại
                </button>
                <h2>🗑️ Thùng rác</h2>
            </div>

            {trashItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888' }}>Thùng rác trống</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {trashItems.map((item) => (
                        <div key={item._id || item.id} style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#fff0f0'
                        }}>
                            <div>
                                <strong>{item.name || item.filename}</strong>
                                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                                    ({item.type === 'folder' || !item.mimetype ? 'Thư mục' : 'File'})
                                </span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleRestore(item._id || item.id)} title="Khôi phục" style={{ padding: '5px 10px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    <FaTrashRestore /> Khôi phục
                                </button>
                                <button onClick={() => handleDeleteForever(item._id || item.id)} title="Xóa vĩnh viễn" style={{ padding: '5px 10px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    <FaTimes /> Xóa vĩnh viễn
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Trash;