import React from 'react';
import { paymentApi } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTimes, FaGem } from 'react-icons/fa';

const PaymentModal = ({ onClose }) => {
    const handlePurchase = async (amount, gb) => {
        try {
            toast.info("Đang tạo đơn hàng...");
            const res = await paymentApi.purchase(amount, gb); 
            if (res.data && res.data.payUrl) {
                window.location.href = res.data.payUrl;
            } else {
                toast.error("Lỗi lấy link thanh toán");
            }
        } catch (error) { toast.error("Lỗi kết nối"); }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <button onClick={onClose} style={closeBtnStyle}><FaTimes /></button>
                <h3 style={{textAlign: 'center', color: '#d91e85'}}>Nâng cấp dung lượng</h3>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
                    <div style={planStyle}>
                        <FaGem size={30} color="#1890ff"/>
                        <h4>Gói Cơ bản</h4>
                        <p>+5 GB</p>
                        <h3 style={{color: '#1890ff'}}>20k</h3>
                        <button onClick={() => handlePurchase(20000, 5)} style={btnStyle}>Mua</button>
                    </div>
                    <div style={{...planStyle, border: '1px solid #d91e85'}}>
                        <FaGem size={30} color="#d91e85"/>
                        <h4>Gói PRO</h4>
                        <p>+20 GB</p>
                        <h3 style={{color: '#d91e85'}}>50k</h3>
                        <button onClick={() => handlePurchase(50000, 20)} style={{...btnStyle, background: '#d91e85'}}>Mua</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { background: 'white', padding: '20px', borderRadius: '10px', width: '500px', position: 'relative' };
const closeBtnStyle = { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' };
const planStyle = { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', flex: 1, textAlign: 'center' };
const btnStyle = { marginTop: '10px', padding: '5px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' };
export default PaymentModal;