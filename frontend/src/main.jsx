import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Lưu ý: Không import './index.css' nữa vì đã xóa file đó rồi

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)