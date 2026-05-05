import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { getRoleFromToken } from "../utils/auth";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const params = new URLSearchParams({
        email: form.email,
        password: form.password,
      });
      const res = await API.post(`/auth/login?${params.toString()}`);

      localStorage.setItem("token", res.data.data);
      setStatus({ type: "success", message: res.data.message || "Login successful" });

      const role = getRoleFromToken();
      if (role === "OWNER") {
        navigate("/owner-dashboard");
      } else if (role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Login failed. Check your email and password.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-labelledby="login-title">
        <div className="auth-panel auth-copy">
          <p className="eyebrow">Store Rating Portal</p>
          <h1 id="login-title">Welcome back</h1>
          <p>
            Sign in to manage stores, add reviews, and keep ratings connected
            to your account role.
          </p>

          <div className="auth-stats" aria-label="Platform highlights">
            <span>
              <strong>3</strong>
              Roles
            </span>
            <span>
              <strong>JWT</strong>
              Secured
            </span>
            <span>
              <strong>API</strong>
              Ready
            </span>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleLogin}>
          <div className="form-header">
            <p className="eyebrow">Login</p>
            <h2>Access your dashboard</h2>
          </div>

          {status.message && (
            <div className={`form-alert ${status.type}`} role="alert">
              {status.message}
            </div>
          )}

          <label className="field">
            <span>Email address</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="auth-switch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
