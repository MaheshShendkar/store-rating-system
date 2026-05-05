import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { getRoleFromToken } from "../utils/auth";

const initialForm = {
  rating: "5",
  comment: "",
  storeId: "",
  userId: "",
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;

function AddReview() {
  const [form, setForm] = useState(initialForm);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const role = getRoleFromToken();

  const navigate = useNavigate();

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);

    const [storesResult, usersResult] = await Promise.allSettled([
      API.get("/stores"),
      API.get("/users"),
    ]);

    if (storesResult.status === "fulfilled") {
      setStores(storesResult.value.data?.data || []);
    } else {
      setStatus({
        type: "error",
        message: getErrorMessage(storesResult.reason, "Unable to load stores."),
      });
    }

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value.data?.data || []);
    } else {
      setUsers([]);
    }

    setLoadingOptions(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadOptions);
  }, [loadOptions]);

  const selectedStore = useMemo(
    () => stores.find((store) => String(store.id) === String(form.storeId)),
    [form.storeId, stores],
  );

  const selectedUser = useMemo(
    () => users.find((user) => String(user.id) === String(form.userId)),
    [form.userId, users],
  );

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);

    try {
      const response = await API.post("/reviews", {
        storeId: Number(form.storeId),
        userId: Number(form.userId),
        rating: Number(form.rating),
        comment: form.comment,
      });

      setStatus({
        type: "success",
        message: response.data?.message || "Review added successfully.",
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message: getErrorMessage(error, "Error adding review. Check the store and user."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-review-page">
      <Navbar workspace={role === "USER" ? "user" : "admin"} />

      <main className="add-review-wrap">
        <section className="add-review-header">
          <div>
            <p className="eyebrow">Reviews API</p>
            <h1>Add a review</h1>
            <p>
              Create a rating record by connecting an existing user to an
              existing store through the backend review endpoint.
            </p>
          </div>

          <button className="ghost-button" type="button" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </button>
        </section>

        <section className="add-review-grid">
          <form className="add-review-card" onSubmit={handleSubmit}>
            <div className="form-header">
              <p className="eyebrow">New feedback</p>
              <h2>Review details</h2>
            </div>

            {status.message && (
              <div className={`form-alert ${status.type}`} role="alert">
                {status.message}
              </div>
            )}

            <label className="field">
              <span>Store</span>
              <select
                name="storeId"
                value={form.storeId}
                onChange={updateField}
                disabled={loadingOptions}
                required
              >
                <option value="">
                  {loadingOptions ? "Loading stores..." : "Select store"}
                </option>
                {stores.map((store) => (
                  <option value={store.id} key={store.id}>
                    #{store.id} {store.name}
                  </option>
                ))}
              </select>
            </label>

            {users.length ? (
              <label className="field">
                <span>User</span>
                <select name="userId" value={form.userId} onChange={updateField} required>
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option value={user.id} key={user.id}>
                      #{user.id} {user.name || user.email}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="field">
                <span>User ID</span>
                <input
                  name="userId"
                  type="number"
                  min="1"
                  placeholder="Enter user ID"
                  value={form.userId}
                  onChange={updateField}
                  required
                />
              </label>
            )}

            <label className="field">
              <span>Rating</span>
              <select name="rating" value={form.rating} onChange={updateField}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option value={rating} key={rating}>
                    {rating} stars
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Comment</span>
              <textarea
                name="comment"
                placeholder="Write concise customer feedback"
                value={form.comment}
                onChange={updateField}
                required
              />
            </label>

            <div className="add-review-actions">
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Add review"}
              </button>
              <button className="ghost-button" type="button" onClick={() => setForm(initialForm)}>
                Clear
              </button>
            </div>
          </form>

          <aside className="add-review-side">
            <div className="rating-preview">
              <span>{form.rating}/5</span>
              <div>
                <h2>{selectedStore?.name || "Review preview"}</h2>
                <p>{form.comment || "Your review comment will appear here."}</p>
              </div>
            </div>

            <div className="add-review-meta">
              <span>POST /api/reviews</span>
              <strong>{selectedUser?.name || selectedUser?.email || `User #${form.userId || "-"}`}</strong>
              <small>{selectedStore?.location || "Select a store to show location"}</small>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default AddReview;
