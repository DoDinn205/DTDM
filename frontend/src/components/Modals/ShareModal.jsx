import { useState, useEffect } from 'react';
import { fileApi } from '../../services/api';
import { toast } from 'react-toastify';
import { FaGlobe, FaLock, FaCopy, FaTimes, FaFolder, FaFileAlt } from 'react-icons/fa';
const ShareModal = ({ file, onClose }) => {
    // --- SỬA LẠI LOGIC NHẬN DIỆN (Giống hệt Home.jsx) ---
    // 1. Nếu type là 'folder' hoặc 'dir' -> Là Folder
    // 2. Nếu tên file KHÔNG có dấu chấm (.) -> Khả năng cao là Folder
    // 3. Các trường hợp còn lại (có dấu chấm .png, .jpg...) -> Là File

    const IP ="http://localhost:5173";
    const isFolder = file.type === 'folder' || file.type === 'dir' || !file.name.includes('.');
    
    // Xác định endpoint đúng
    const shareType = isFolder ? 'folder' : 'file'; 

    const [isPublic, setIsPublic] = useState(file.visibility === 'public');
    
    // Link mẫu
    const [link, setLink] = useState(
        isPublic ? `${IP}/share/${shareType}/${file._id || file.id}` : ''
    );

    const handleToggle = async () => {
        const newMode = isPublic ? 'private' : 'public';
        try {
            await fileApi.setVisibility(file._id || file.id, newMode);
            setIsPublic(!isPublic);
            
            if (newMode === 'public') {
                setLink(`${IP}/share/${shareType}/${file._id || file.id}`);
            } else {
                setLink('');
            }
            toast.success(`Đã chuyển sang ${newMode}`);
        } catch (error) { 
            toast.error("Lỗi cập nhật trạng thái"); 
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link);
        toast.success("Đã copy link!");
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <button onClick={onClose} style={closeBtnStyle}><FaTimes /></button>
                
                {/* TIÊU ĐỀ + ICON */}
                <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#333'}}>
                    {isFolder ? <FaFolder color="#faad14" size={28}/> : <FaFileAlt color="#1890ff" size={28}/>}
                    {isFolder ? 'Chia sẻ Thư mục' : 'Chia sẻ File'}
                </h3>
                
                <p style={{marginBottom:'20px', color: '#666', fontWeight: '500', wordBreak: 'break-word'}}>
                    {file.name || file.filename}
                </p>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '8px'}}>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        {isPublic ? <FaGlobe color="#52c41a" size={24}/> : <FaLock color="#f5222d" size={24}/>}
                        <div>
                            <strong style={{display: 'block', marginBottom: '3px'}}>
                                {isPublic ? 'Đang Công khai (Public)' : 'Đang Riêng tư (Private)'}
                            </strong>
                            <span style={{fontSize: '12px', color: '#888'}}>
                                {isPublic ? 'Bất kỳ ai có link đều xem được' : 'Chỉ mình bạn xem được'}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleToggle} style={{
                        padding: '8px 16px', 
                        background: isPublic ? '#fff1f0' : '#e6f7ff', 
                        color: isPublic ? '#ff4d4f' : '#1890ff', 
                        border: `1px solid ${isPublic ? '#ffccc7' : '#91d5ff'}`, 
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                    }}>
                        {isPublic ? 'Tắt' : 'Bật'}
                    </button>
                </div>

                {isPublic && (
                    <div style={{background: '#fff', padding: '5px', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #d9d9d9'}}>
                        <input type="text" value={link} readOnly style={{flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#333', padding: '8px'}} />
                        <button onClick={copyToClipboard} title="Copy Link" style={{cursor: 'pointer', border: 'none', background: '#f0f0f0', padding: '8px 12px', borderRadius: '4px', transition: '0.2s'}}>
                            <FaCopy color="#555"/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '500px', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' };
const closeBtnStyle = { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' };

export default ShareModal;