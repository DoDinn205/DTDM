import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { fileApi } from "../services/api";

export default function ShareFile() {
  const { fileId } = useParams();   // ← LẤY ID TỪ URL
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await fileApi.getFileInfo(fileId);
        setFile(res.data);
      } catch (err) {
        setError("File không tồn tại hoặc link đã bị xoá.");
      }
    };

    fetchFile();
  }, [fileId]);

  if (error) return <h2 style={{ textAlign: "center", marginTop: 50 }}>{error}</h2>;
  if (!file) return <h3 style={{ textAlign: "center", marginTop: 50 }}>Đang tải file...</h3>;

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h2>File được chia sẻ</h2>

      <div style={{ border: "1px solid #ddd", padding: 20, borderRadius: 10 }}>
        <p><b>Tên file:</b> {file.filename || file.name}</p>
        <p><b>Loại:</b> {file.mimetype || file.mime}</p>
        <p><b>Kích thước:</b> {(file.size / 1024 / 1024).toFixed(2)} MB</p>

        {/* Preview ẢNH */}
        {file.mimetype?.startsWith("image/") && (
          <img src={file.s3Url} alt={file.filename || file.name}
            style={{ width: "100%", marginTop: 15, borderRadius: 10, border: "1px solid #ddd" }} />
        )}

        {/* Preview VIDEO */}
        {file.mime?.startsWith("video/") && (
          <video controls style={{ width: "100%", marginTop: 15, borderRadius: 10 }}>
            <source src={file.url} type={file.mime} />
          </video>
        )}

        {/* Preview PDF */}
        {file.mime === "application/pdf" && (
          <iframe src={file.url}
            width="100%" height="500px"
            style={{ marginTop: 15, borderRadius: 10 }}>
          </iframe>
        )}

        {/* Nút download */}
        <button onClick={async () => {
        let key = file.s3Url.split(".amazonaws.com/")[1].split("?")[0];
        key = decodeURIComponent(key);

        // POST lên BE
        const res = await fileApi.download(key);
        const downloadUrl = res.data.url;

        const fileRes = await fetch(downloadUrl);
        console.log("fileRes:", fileRes);
        const blob = await fileRes.blob();

        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = file.filename || file.name || "download";
        a.click();
        URL.revokeObjectURL(href);
        }}
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            borderRadius: 6,
            textDecoration: "none"
          }}>
          Tải xuống
        </button>
      </div>
    </div>
  );
}
