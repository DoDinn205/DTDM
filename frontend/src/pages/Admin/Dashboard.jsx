import React, { useEffect, useState } from "react";
import axios from "axios";
import { fileApi, authApi } from '../../services/api';

const API = "http://localhost:3000/api/users";

export default function AdminAccount() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    refreshToken: "",
    role: "user",
    storageUsed: 0,
    storageLimit: 1,
    plan: "Free",
    planStorage: 0,
    planExpire: "",
    lastUpgrade: "",
  });

  const [editingId, setEditingId] = useState(null);
  const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("role");

  window.location.href = "/login"; // redirect nhanh và reset state React
};
  // Lấy danh sách user
  const fetchUsers = async () => {
    const res = await authApi.getAllUsers();
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý input form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Thêm user
  const addUser = async () => {
    await authApi.register(form.name, form.email, form.password, form.role, form.plan);
    fetchUsers();
    resetForm();
  };

  // Cập nhật user
  const updateUser = async () => {
    await authApi.update(editingId, form.name, form.email, form.password, form.role, form.storageLimit, form.plan);
    fetchUsers();
    resetForm();
    setEditingId(null);
  };

  // Xóa user
  const deleteUser = async (id) => {
    console.log("Deleting user with id:", id);
    await authApi.delete(id);
    fetchUsers();
  };

  // Load dữ liệu user lên form để sửa
  const editUser = (u) => {
    setEditingId(u._id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      storageLimit: u.storageLimit,
      plan: u.plan
    });
  };
 const format = (bytes = 0) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
     }
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      refreshToken: "",
      role: "user",
      storageUsed: 0,
      storageLimit: 0,
      plan: "Free",
      planStorage: 0,
      planExpire: "",
      lastUpgrade: "",
    });
  };

  return (
    <div style={{ padding: "20px" }}>
        <button
    onClick={logout}
  >
    Logout
  </button>
      <h2>Admin - Quản lý tài khoản</h2>
      
      <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px"}}>
        <h3>{editingId ? "Cập nhật User" : "Thêm User mới"}</h3>

        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange} />

        <select name="role" value={form.role} onChange={handleChange}>
          <option value="admin">admin</option>
          <option value="user">user</option>
        </select>

        {/* <input name="storageLimit" type="number" value={form.storageLimit } onChange={handleChange} placeholder=" LIMIT GB" /> */}

        <select name="plan" value={form.plan} onChange={handleChange}>
          <option value="Free">Free</option>
        <option value="Basic">Basic</option>
          <option value="Pro">Pro</option>
        </select>

{/* 
        <label>Plan Expire</label>
        <input name="planExpire" type="date" value={form.planExpire} onChange={handleChange} />

        <label>Last Upgrade</label>
        <input name="lastUpgrade" type="date" value={form.lastUpgrade} onChange={handleChange} /> */}

        <div style={{ marginTop: "10px" }}>
          {editingId ? (
            <button onClick={updateUser}>Cập nhật</button>
          ) : (
            <button onClick={addUser}>Thêm</button>
          )}
          <button onClick={resetForm}>Clear</button>
        </div>
      </div>

      <h3>Danh sách tài khoản</h3>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Storage</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.plan}</td>
              <td>{format(u.storageUsed)} / {format(u.storageLimit)}</td>
              <td>
                <button onClick={() => editUser(u)}>Sửa</button>
                <button onClick={() => deleteUser(u.email)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
