import React from "react";

export default function NoPermission() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      backgroundColor: "#f5f5f5",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "48px", color: "#d9534f", marginBottom: "10px" }}>
        403
      </h1>

      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        Bạn không có quyền truy cập trang này
      </h2>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.
      </p>

      <a
        href="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#0275d8",
          color: "#fff",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "16px"
        }}
      >
        Quay về trang chủ
      </a>
    </div>
  );
}
