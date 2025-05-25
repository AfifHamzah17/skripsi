import React, { useEffect, useState } from "react";
import { handleLogin } from "../presenters/auth-presenter";
import { toast } from "sonner";

export default function LoginView() {
  const [form, setForm] = useState({ email: "", password: "" });
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
    handleLogin(
      form,
      () => {
        toast.success("Login berhasil!");
        window.location.hash = "#/home";
      },
      (errMsg) => {
        setError(errMsg);
        toast.error(errMsg || "Login gagal!");
      }
    );
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="auth-form">
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
 {error && <p id="login-status">{error}</p>}
        <button type="submit">Login</button>
        <div className="auth-switch">
          <span>Belum punya akun? </span>
          <a href="#/register">Register</a>
        </div>
      </form>
    </div>
  );
}
