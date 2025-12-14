import { useState, useEffect } from 'react';
import { fileApi } from '../../services/api';
import { toast } from 'react-toastify';
import {
    FaGlobe, FaLock, FaCopy, FaTimes,
    FaUserPlus, FaTrash
} from 'react-icons/fa';

const ShareModal = ({ file, onClose }) => {
    const IP = "http://13.250.225.126";
    const isFolder = file.type === 'folder' || file.type === 'dir' || !file.name.includes('.');
    const shareType = isFolder ? 'folder' : 'file';

    const [isPublic, setIsPublic] = useState(file.visibility === 'public');
    const [email, setEmail] = useState('');
    const [sharedWith, setSharedWith] = useState(file.sharedWith || []);

    const [link, setLink] = useState(
        isPublic ? `${IP}/share/${shareType}/${file._id || file.id}` : ''
    );
    useEffect(() => {
       const initData = async () => {
                   try {
                      setSharedWith(file.shareWith)
                   } catch (e) { console.error(e); }
               };
               initData();
    }, []);
    /* ===== TOGGLE PUBLIC / PRIVATE ===== */
    const handleToggle = async () => {
        const newMode = isPublic ? 'private' : 'public';
        try {
            await fileApi.setVisibility(file._id || file.id, newMode);
            setIsPublic(!isPublic);
            setLink(newMode === 'public'
                ? `${IP}/share/${shareType}/${file._id || file.id}`
                : ''
            );
            toast.success(`Đã chuyển sang ${newMode}`);
        } catch {
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    /* ===== ADD EMAIL ===== */
    const handleAddEmail = async () => {
        if (!email) {
            toast.error("Email không hợp lệ");
            return;
        }

        try {
            await fileApi.setVisibility(file._id || file.id, "shared", [email], []);
            setSharedWith([...sharedWith, { userId: email, access: ["view"] }]);
            setEmail('');
            toast.success("Đã chia sẻ");
        } catch {
            toast.error("Không thể chia sẻ");
        }
    };

    /* ===== REMOVE EMAIL ===== */
    const handleRemoveEmail = async (emailToRemove) => {
        try {
            await fileApi.setVisibility(file._id || file.id, "shared", [], [emailToRemove]);

            setSharedWith(sharedWith.filter(s => s.userId !== emailToRemove));
            toast.success("Đã xoá quyền");
        } catch {
            toast.error("Không thể xoá");
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

                <h3>Chia sẻ</h3>
                <p style={{ color: '#666' }}>{file.name || file.filename}</p>

                {/* ===== PUBLIC / PRIVATE ===== */}
                <div style={box}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {isPublic ? <FaGlobe color="#52c41a" /> : <FaLock color="#f5222d" />}
                        <div>
                            <strong>{isPublic ? 'Công khai' : 'Riêng tư'}</strong>
                            <div style={{ fontSize: 12, color: '#888' }}>
                                {isPublic ? 'Ai có link đều xem được' : 'Chỉ mình bạn'}
                            </div>
                        </div>
                    </div>
                    <button onClick={handleToggle} style={toggleBtn(isPublic)}>
                        {isPublic ? 'Tắt' : 'Bật'}
                    </button>
                </div>

                {/* ===== LINK ===== */}
                {isPublic && (
                    <div style={linkBox}>
                        <input value={link} readOnly style={inputStyle} />
                        <button onClick={copyToClipboard}><FaCopy /></button>
                    </div>
                )}

                {/* ===== SHARED WITH ===== */}
                {!isPublic &&
                <>
                <h4 style={{ marginTop: 20 }}>Chia sẻ với người khác</h4>

                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        placeholder="Nhập email..."
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={inputStyle}
                        type='text'
                    />
                    <button onClick={handleAddEmail} style={addBtn}>
                        <FaUserPlus />
                    </button>
                </div>

                {/* ===== LIST EMAILS ===== */}
                {sharedWith.length > 0 && (
                    <div style={listBox}>
                        {sharedWith.map((s, i) => (
                            <div key={i} style={row}>
                                <span>{s.userId}</span>
                                <button onClick={() => handleRemoveEmail(s.userId)}>
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                </>
                }
            </div>
        </div>
    );
};

/* ===== STYLES ===== */
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalStyle = { background: '#fff', padding: 30, borderRadius: 12, width: 500, position: 'relative' };
const closeBtnStyle = { position: 'absolute', top: 15, right: 15, border: 'none', background: 'none', cursor: 'pointer' };
const box = { display: 'flex', justifyContent: 'space-between', padding: 15, background: '#f9f9f9', borderRadius: 8 };
const toggleBtn = (on) => ({ padding: '6px 14px', borderRadius: 6, cursor: 'pointer', border: '1px solid #ddd', background: on ? '#fff1f0' : '#e6f7ff' });
const linkBox = { display: 'flex', marginTop: 10, gap: 10 };
const inputStyle = { flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6 };
const addBtn = { background: '#1890ff', color: '#fff', border: 'none', borderRadius: 6, padding: '0 12px', cursor: 'pointer' };
const listBox = { marginTop: 10, border: '1px solid #eee', borderRadius: 6 };
const row = { display: 'flex', justifyContent: 'space-between', padding: 8, borderBottom: '1px solid #eee' };

export default ShareModal;
