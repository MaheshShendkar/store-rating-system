import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function CreateStore() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const response = await API.post("/stores", form);
      setStatus({
        type: "success",
        message: response.data?.message || "Store created successfully.",
      });
      navigate("/stores");
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data ||
          "Error creating store. Check your owner/admin permission.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-store-page">
      <Navbar workspace="owner" />

      <main className="create-store-wrap">
        <section className="create-store-header">
          <div>
            <p className="eyebrow">Stores API</p>
            <h1>Create a store</h1>
            <p>
              Add a new store record for the signed-in owner account. The backend
              will attach ownership from the authenticated JWT.
            </p>
          </div>

          <button className="ghost-button" type="button" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </button>
        </section>

        <section className="create-store-grid">
          <form className="create-store-card" onSubmit={handleSubmit}>
            <div className="form-header">
              <p className="eyebrow">New listing</p>
              <h2>Store details</h2>
            </div>

            {status.message && (
              <div className={`form-alert ${status.type}`} role="alert">
                {status.message}
              </div>
            )}

            <label className="field">
              <span>Store name</span>
              <input
                name="name"
                placeholder="Urban Fresh Market"
                value={form.name}
                onChange={updateField}
                required
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                name="description"
                placeholder="Short summary of what customers can expect"
                value={form.description}
                onChange={updateField}
                required
              />
            </label>

            <label className="field">
              <span>Location</span>
              <input
                name="location"
                placeholder="City, area, or full address"
                value={form.location}
                onChange={updateField}
                required
              />
            </label>

            <div className="create-store-actions">
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create store"}
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => setForm({ name: "", description: "", location: "" })}
              >
                Clear
              </button>
            </div>
          </form>

          <aside className="create-store-side">
            <div>
              <span className="store-avatar">{form.name?.charAt(0) || "S"}</span>
              <h2>{form.name || "Store preview"}</h2>
              <p>{form.description || "The description will appear here as you type."}</p>
            </div>

            <div className="create-store-meta">
              <span>POST /api/stores</span>
              <strong>{form.location || "Location not set"}</strong>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default CreateStore;
