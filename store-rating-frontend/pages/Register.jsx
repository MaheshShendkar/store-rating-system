import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const res = await API.post("/auth/register", form);
      setStatus({
        type: "success",
        message: res.data.message || "Registered successfully",
      });
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed. Please review your details.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-shell reverse" aria-labelledby="register-title">
        <form className="auth-card" onSubmit={handleRegister}>
          <div className="form-header">
            <p className="eyebrow">Registration</p>
            <h2>Create your account</h2>
          </div>

          {status.message && (
            <div className={`form-alert ${status.type}`} role="alert">
              {status.message}
            </div>
          )}

          <label className="field">
            <span>Full name</span>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={updateField}
              autoComplete="name"
              required
            />
          </label>

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
              placeholder="Create a password"
              value={form.password}
              onChange={updateField}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="field">
            <span>Account role</span>
            <select name="role" value={form.role} onChange={updateField}>
              <option value="USER">User</option>
              <option value="OWNER">Store owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/">Sign in</Link>
          </p>
        </form>

        <div className="auth-panel auth-copy">
          <p className="eyebrow">Join the Portal</p>
          <h1 id="register-title">Start with the right role</h1>
          <p>
            Choose User, Store owner, or Admin so the backend can authorize the
            correct store-rating workflows after login.
          </p>

          <div className="role-list" aria-label="Available roles">
            <span>User reviews stores</span>
            <span>Owners create stores</span>
            <span>Admins oversee users</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Register;
