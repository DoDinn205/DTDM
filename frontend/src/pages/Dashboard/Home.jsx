import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fileApi, authApi } from '../../services/api';
import { toast } from 'react-toastify';

// Import Modal
import ProfileModal from '../../components/Modals/ProfileModal';
import PaymentModal from '../../components/Modals/PaymentModal';
import ShareModal from '../../components/Modals/ShareModal';

import { 
    FaFolder, FaFileAlt, FaSignOutAlt, FaPlus, FaCloudUploadAlt, 
    FaArrowLeft, FaTrash, FaDownload, FaEdit, FaSearch, FaTrashAlt, 
    FaUser, FaShareAlt, FaRocket 
} from 'react-icons/fa';

const Home = () => {
    const [files, setFiles] = useState([]); 
    const [currentFolder, setCurrentFolder] = useState(null); 
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State Modal
    const [user, setUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [shareFile, setShareFile] = useState(null);

    const navigate = useNavigate();

    // 1. Lấy thông tin ban đầu
    useEffect(() => {
        const initData = async () => {
            try {
                const u = await authApi.getProfile();
                setUser(u.data);
            } catch (e) { console.error(e); }
        };
        initData();
    }, []);

    // 2. Tải file (Code an toàn)
    const fetchFiles = async () => {
        try {
            let res;
            if (searchTerm.trim()) {
                res = await fileApi.search(searchTerm);
            } else {
                res = await fileApi.getTree(currentFolder);
            }
            
            let safeData = [];
            // Logic an toàn như cũ
            if (Array.isArray(res.data)) safeData = res.data;
            else if (res.data?.children) safeData = res.data.children;
            else if (res.data?.structure) safeData = res.data.structure;
            else if (res.data?.files) safeData = res.data.files;
            else if (res.data?.data) safeData = res.data.data;

            setFiles(safeData);
        } catch (error) {
            console.error("Lỗi tải file:", error);
            
            // [MỚI] Nếu vào folder bị lỗi 404 (Folder ảo/đã xóa) -> Quay về Root
            if (error.response && error.response.status === 404 && currentFolder) {
                toast.error("Thư mục không tồn tại!");
                setCurrentFolder(null); // Quay về trang chủ
                setHistory([]);
            } else {
                setFiles([]);
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => { fetchFiles(); }, 500);
        return () => clearTimeout(timer);
    }, [currentFolder, searchTerm]);

    // 3. Các chức năng
    const handleCreateFolder = async () => {
        const name = prompt("Tên thư mục:"); if(!name) return;
        try { await fileApi.createFolder(name, currentFolder); toast.success("Tạo xong"); fetchFiles(); } catch(e){ toast.error("Lỗi"); }
    };
    const handleUpload = async (e) => {
        const file = e.target.files[0]; if(!file) return;
        const id = toast.loading("Đang upload...");
        try { await fileApi.upload(file, currentFolder); toast.update(id, { render: "Xong!", type: "success", isLoading: false, autoClose: 2000 }); fetchFiles(); } catch(e){ toast.update(id, { render: "Lỗi!", type: "error", isLoading: false, autoClose: 2000 }); }
    };
    const handleRename = async (e, id, oldName) => {
        e.stopPropagation();
        const newName = prompt("Tên mới:", oldName); if (!newName) return;
        try { await fileApi.rename(id, newName); toast.success("Đổi tên xong"); fetchFiles(); } catch (e) { toast.error("Lỗi"); }
    };
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if(!window.confirm("Xóa vào thùng rác?")) return;
        try { await fileApi.delete(id); toast.success("Đã xóa"); fetchFiles(); } catch (e) { toast.error("Lỗi"); }
    };
    
    const handleDownload = async (e, id) => {
        e.stopPropagation();
        
        // 1. Kiểm tra ID đầu vào
        if (!id) {
            toast.error("Lỗi: Không tìm thấy ID file!");
            return;
        }

        const toastId = toast.loading("Đang lấy link tải...");
        
        try {
            console.log("Đang tải ID:", id);
            const res = await fileApi.getFileInfo(id);
            
            console.log("Backend trả về:", res.data); // Bật F12 xem dòng này

            // 2. Tìm link tải trong mọi ngóc ngách dữ liệu
            // Backend của bạn trả về: { filename, s3Url, mimetype, size }
            // Hoặc có thể nằm trong res.data.data.s3Url
            const data = res.data.data || res.data; 
            const downloadLink = data.s3Url || data.url || data.link;

            if (downloadLink) {
                toast.update(toastId, { render: "Đang mở file...", type: "success", isLoading: false, autoClose: 1000 });
                window.open(downloadLink, '_blank');
            } else {
                toast.update(toastId, { render: "File này chưa có link tải (Lỗi S3)", type: "error", isLoading: false, autoClose: 3000 });
            }
        } catch (error) {
            console.error("Chi tiết lỗi:", error);
            
            // 3. Hiển thị thông báo lỗi cụ thể từ Backend
            let msg = "Lỗi khi tải file";
            if (error.response) {
                if (error.response.status === 404) msg = "File không tồn tại trên hệ thống!";
                else if (error.response.status === 403) msg = "Bạn không có quyền tải file này!";
                else if (error.response.data && error.response.data.message) msg = error.response.data.message;
            }
            
            toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 3000 });
        }
    };
    
    const handleLogout = () => { localStorage.removeItem('accessToken'); window.location.href='/login'; };

    // Điều hướng
    const handleOpenFolder = (id) => { setSearchTerm(''); setHistory([...history, currentFolder]); setCurrentFolder(id); };
    const handleBack = () => { if (history.length === 0) return; setSearchTerm(''); const prev = history[history.length - 1]; setHistory(history.slice(0, -1)); setCurrentFolder(prev); };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            
            {/* --- HEADER: Logo + Search + User Actions --- */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' 
            }}>
                <div style={{display:'flex', alignItems:'center', gap: '20px'}}>
                    <h2 style={{ margin: 0, color: '#1890ff', fontSize: '24px' }}>☁️ Cloud Data Storage</h2>
                    
                    {/* Ô TÌM KIẾM (Đã sửa kích thước cố định 300px) */}
                    <div style={{ position: 'relative', width: '300px' }}>
                        <FaSearch style={{ position: 'absolute', left: '10px', top: '10px', color: '#888' }} />
                        <input 
                            type="text" placeholder="Tìm kiếm file..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                width: '100%', padding: '8px 10px 8px 35px', 
                                borderRadius: '20px', border: '1px solid #ddd', outline: 'none', background: '#f9f9f9' 
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowPayment(true)} style={{ padding: '8px 15px', background: 'linear-gradient(45deg, #d91e85, #722ed1)', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaRocket /> Nâng cấp
                    </button>
                    <button onClick={() => setShowProfile(true)} style={{ padding: '8px 15px', background: 'white', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                        <FaUser /> {user ? user.name : 'User'}
                    </button>
                    <button onClick={() => navigate('/trash')} title="Thùng rác" style={{ padding: '8px 12px', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
                        <FaTrashAlt color="#555"/>
                    </button>
                    <button onClick={handleLogout} title="Đăng xuất" style={{ padding: '8px 12px', background: '#fff1f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
                        <FaSignOutAlt color="#ff4d4f"/>
                    </button>
                </div>
            </div>

            {/* --- TOOLBAR: Back + Upload + Create --- */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                {history.length > 0 && (
                    <button onClick={handleBack} style={{ padding: '8px 15px', cursor: 'pointer', border: '1px solid #ddd', background: 'white', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaArrowLeft /> Quay lại
                    </button>
                )}

                {/* Chỉ hiện nút Upload/Create khi KHÔNG tìm kiếm */}
                {!searchTerm && (
                    <>
                        <label style={{ padding: '8px 20px', background: '#1890ff', color: 'white', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <FaCloudUploadAlt size={18}/> Upload File
                            <input type="file" hidden onChange={handleUpload} />
                        </label>
                        <button onClick={handleCreateFolder} style={{ padding: '8px 20px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <FaPlus size={16}/> Tạo Thư Mục
                        </button>
                    </>
                )}
            </div>

            {/* --- DANH SÁCH FILE --- */}
            {searchTerm && <p style={{marginBottom: '10px', color: '#666'}}>Kết quả tìm kiếm cho: "<strong>{searchTerm}</strong>"</p>}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '20px' }}>
                {files.map((item) => {
                    const isFolder = item.type === 'folder' || item.type === 'dir' || (!item.mimetype && !item.name.includes('.'));
                    return (
                        <div 
                            key={item._id || item.id} 
                            onClick={() => isFolder ? handleOpenFolder(item._id || item.id) : null}
                            style={{ 
                                border: '1px solid #eee', borderRadius: '12px', padding: '20px', 
                                textAlign: 'center', cursor: 'pointer', backgroundColor: isFolder ? '#fffbe6' : 'white',
                                position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', transition: '0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.02)'}
                        >
                            <div style={{ fontSize: '45px', color: isFolder ? '#faad14' : '#1890ff', marginBottom: '15px' }}>
                                {isFolder ? <FaFolder /> : <FaFileAlt />}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '15px' }}>
                                {item.name || item.filename}
                            </div>
                            
                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                                <FaShareAlt className="action-icon" color="#722ed1" title="Chia sẻ" onClick={(e) => { e.stopPropagation(); setShareFile(item); }} />
                                <FaEdit className="action-icon" color="#1890ff" title="Đổi tên" onClick={(e) => handleRename(e, item._id || item.id, item.name || item.filename)} />
                                {!isFolder && <FaDownload className="action-icon" color="#52c41a" title="Tải" onClick={(e) => handleDownload(e, item._id || item.id)} />}
                                <FaTrash className="action-icon" color="#ff4d4f" title="Xóa" onClick={(e) => handleDelete(e, item._id || item.id)} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Màn hình trống */}
            {files.length === 0 && (
                <div style={{textAlign: 'center', marginTop: '50px', color: '#ccc'}}>
                    <FaFolder size={50} />
                    <p>Thư mục trống</p>
                </div>
            )}

            {/* Modals */}
            {showProfile && user && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
            {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
            {shareFile && <ShareModal file={shareFile} onClose={() => setShareFile(null)} />}
            
            {/* CSS nhanh cho icon hover */}
            <style>{`
                .action-icon { cursor: pointer; transition: 0.2s; font-size: 16px; }
                .action-icon:hover { transform: scale(1.2); }
            `}</style>
        </div>
    );
};

export default Home;