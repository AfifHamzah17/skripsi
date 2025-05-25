import React, { useEffect, useState } from "react";
import { handleRegister } from "../presenters/auth-presenter";
import { toast } from "sonner";

export default function RegisterView() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleRegister(
      form,
      () => {
        toast.success("Registrasi berhasil!");
        window.location.hash = "#/login";
      },
      (errMsg) => {
        setError(errMsg);
        toast.error(errMsg || "Registrasi gagal!");
      }
    );
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      <form onSubmit={onSubmit} className="auth-form">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={onChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
        />

        <label htmlFor="password">Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
          />
        </div>
      {error && <p id="register-status">{error}</p>}
        <button type="submit">Register</button>
        <div className="auth-switch">
          <span>Sudah punya akun? </span>
          <a href="#/login">Login</a>
        </div>
      </form>
    </div>
  );
}