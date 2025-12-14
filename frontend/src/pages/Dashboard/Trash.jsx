import { useState, useEffect } from 'react';
import { fileApi } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTrashRestore, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Trash = () => {
    const [trashItems, setTrashItems] = useState([]);
    const navigate = useNavigate();

   const fetchTrash = async () => {
    try {
        const res = await fileApi.getTrash();
        const { folders, files } = res.data;

        // 1️⃣ Lấy danh sách folder bị trash
        const trashedFolderIds = folders.map(f => f._id.toString());

        // 2️⃣ Lọc folder top-level (folder cha không bị xóa)
        const topFolders = folders.filter(f =>
            !f.parent || !trashedFolderIds.includes(f.parent.toString())
        ).map(f => ({ ...f, __type: "folder" }));

        // 3️⃣ Lọc file top-level (file có folder cha không bị xóa)
        const topFiles = files.filter(file =>
            !file.folder || !trashedFolderIds.includes(file.folder.toString())
        ).map(f => ({ ...f, __type: "file" }));

        // 4️⃣ Gộp lại để render
        const merged = [...topFolders, ...topFiles];

        // 5️⃣ Sắp xếp theo ngày xóa
        merged.sort((a, b) => new Date(b.trashedAt) - new Date(a.trashedAt));

        setTrashItems(merged);

    } catch (error) {
        console.error(error);
        toast.error("Không tải được thùng rác");
    }
};

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (id) => {
        try {
            await fileApi.restore(id);
            toast.success("Đã khôi phục!");
            fetchTrash();
        } catch (error) {
            toast.error("Lỗi khôi phục");
        }
    };

    const handleDeleteForever = async (id) => {
        if (!window.confirm("Xóa vĩnh viễn?")) return;
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
                <button onClick={() => navigate('/')} style={{ cursor: 'pointer', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                    <FaArrowLeft /> Quay lại
                </button>
                <h2>🗑️ Thùng rác</h2>
            </div>

            {trashItems.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888' }}>Thùng rác trống</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {trashItems.map(item => (
                        <div key={item._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px',
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            background: '#fff0f0'
                        }}>
                            <div>
                                <strong>{item.name || item.filename}</strong>
                                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                                    ({item.__type === "folder" ? "Thư mục" : "File"})
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleRestore(item._id)} style={{ padding: '5px 10px', background: '#52c41a', color: 'white', borderRadius: '4px' }}>
                                    <FaTrashRestore /> Khôi phục
                                </button>
                                <button onClick={() => handleDeleteForever(item._id)} style={{ padding: '5px 10px', background: '#ff4d4f', color: 'white', borderRadius: '4px' }}>
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
