import axios from 'axios';

const BASE_URL = 'http://52.76.57.239'; 
//const BASE_URL = 'http://localhost:3000'; // Dùng cho phát triển cục bộ
const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// 1. AUTH & USER
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password,role,plan) => api.post('/auth/register', { name, email, password, role, plan }),
    // Hàm này để lấy thông tin Profile
    getProfile: () => api.get('/api/user'), 
    getAllUsers: () => api.get('/auth/all'),
    delete: (id) => api.post(`/auth/delete`,{userId:id}),
    update: (id, name, email, password, role, storageLimit, plan) => 
        api.post('/auth/update', { id, name, email, password, role, plan }),
};

// 2. FILE & FOLDER
export const fileApi = {
    // API lấy cây thư mục
    getTree: (folderId) => folderId ? api.get(`/api/tree/${folderId}`) : api.get('/api/tree'),
    
    // API tìm kiếm
    search: (keyword) => api.get('/search', { params: { kw: keyword } }),
    searchUserItems: (username) => api.get(`/search/user/${username}`),
    createFolder: (name, parentId) => {
        const data = { name };
        // Chỉ gửi parentId nếu nó có giá trị thực
        if (parentId) data.parentId = parentId;
        return api.post('/api/create', data);
    },

   upload: (file, folderId) => {
        const formData = new FormData();
        formData.append('file', file);
        
        if (folderId && folderId !== 'root' && folderId !== 'null') {
            formData.append('folderId', folderId);
        }
        
        return api.post('/api/upload', formData, {
            headers: {
                // QUAN TRỌNG: Set undefined để trình duyệt tự động phát hiện
                // và tự điền 'multipart/form-data; boundary=...'
                'Content-Type': undefined 
            }
        });
    },
    
    rename: (id, newName) => api.post('/api/rename', { id, newName }),
    
    delete: (id) => api.post('/api/delete', { id }),
    
    // API Thùng rác
    getTrash: () => api.get('/api/trash'),
    restore: (id) => api.post('/api/trash/restore', { id }),
    deletePermanent: (id) => api.post('/api/trash/empty', { id }),
    
    // API lấy link file (cho chức năng Download/View)
    getFileInfo: (fileId) => api.post(`/share/file/${fileId}`),

    // API Chia sẻ (Public/Private)
    setVisibility: (id, mode) => api.post('/api/set-visibility', { id, mode }),
    download: (key) => api.post('/api/download', { key })
};


export const paymentApi = {
    purchase: (amount, upStore) => api.post('/payment/purchase', { amount, upStore })
};

export default api;