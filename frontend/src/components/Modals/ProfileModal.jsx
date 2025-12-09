import React from 'react';
import { FaUserCircle, FaHdd, FaTimes } from 'react-icons/fa';

const ProfileModal = ({ user, onClose }) => {
    if (!user) return null;
   // const limitGB = (user.storageLimit / (1024 * 1024 * 1024)).toFixed(2);
   // const usedGB = (user.storageUsed / (1024 * 1024 * 1024)).toFixed(2);
    const percent = Math.min((user.storageUsed / user.storageLimit) * 100, 100) || 0;
     const format = (bytes = 0) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
     }
    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <button onClick={onClose} style={closeBtnStyle}><FaTimes /></button>
                <h3 style={{textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Hồ sơ cá nhân</h3>
                <div style={{textAlign: 'center', margin: '20px 0'}}>
                    <FaUserCircle size={60} color="#1890ff" />
                    <h3>{user.name}</h3>
                    <p style={{color: '#666'}}>{user.email}</p>
                </div>
                <div style={{background: '#f9f9f9', padding: '15px', borderRadius: '8px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px'}}>
                        <FaHdd color="#52c41a"/> <strong>Dung lượng</strong>
                    </div>
                    <div style={{width: '100%', height: '8px', background: '#ddd', borderRadius: '4px', overflow: 'hidden'}}>
                        <div style={{width: `${percent}%`, height: '100%', background: percent > 90 ? 'red' : '#1890ff'}}></div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px'}}>
                        <span>Dùng: {format(user.storageUsed)}</span>
                        <span>Tổng: {format(user.storageLimit)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { background: 'white', padding: '20px', borderRadius: '10px', width: '350px', position: 'relative' };
const closeBtnStyle = { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' };
export default ProfileModal;