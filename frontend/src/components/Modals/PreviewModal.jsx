export default function ProfileModal({ file, onClose }) {
  if (!file) return null;

  const url = file.s3Url || "";

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(url);
  const isText = /\.(txt|json|md|log)$/i.test(url);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={headerStyle}>
          <span style={fileNameStyle}>
            {file.name || file.filename}
          </span>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        {/* CONTENT */}
        <div style={contentStyle}>
          {/* IMAGE */}
          {isImage && (
            <img
              src={url}
              alt="preview"
              style={imageStyle}
            />
          )}

          {/* PDF */}
          {isPdf && (
            <iframe
              src={url}
              style={iframeStyle}
              title="pdf-preview"
            />
          )}

          {/* VIDEO */}
          {isVideo && (
            <video
              src={url}
              controls
              style={videoStyle}
            />
          )}

          {/* TEXT */}
          {isText && (
            <iframe
              src={url}
              style={{ ...iframeStyle, background: '#f9fafb' }}
              title="text-preview"
            />
          )}

          {/* FALLBACK */}
          {!isImage && !isPdf && !isVideo && !isText && (
            <div style={fallbackStyle}>
              <p>No preview available</p>
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================
   INLINE STYLES
======================= */

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modalStyle = {
  background: '#fff',
  width: '80%',
  maxWidth: '900px',
  maxHeight: '90vh',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
  overflow: 'hidden'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '14px 18px',
  borderBottom: '1px solid #eee',
  fontWeight: 600
};

const fileNameStyle = {
  fontSize: '15px',
  color: '#333',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '85%'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#666'
};

const contentStyle = {
  padding: '16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  background: '#fafafa'
};

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '70vh',
  objectFit: 'contain',
  borderRadius: '8px'
 
};

const iframeStyle = {
  width: '100%',
  height: '70vh',
  border: 'none',
  borderRadius: '8px'
};

const videoStyle = {
  maxWidth: '100%',
  maxHeight: '70vh',
  borderRadius: '8px',
  background: '#000'
};

const fallbackStyle = {
  textAlign: 'center',
  color: '#666',
  fontSize: '14px'
};

const downloadLinkStyle = {
  display: 'inline-block',
  marginTop: '8px',
  color: '#1890ff',
  textDecoration: 'underline'
};
