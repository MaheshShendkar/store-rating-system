import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { getEmailFromToken, getRoleFromToken } from "../utils/auth";

const emptyUser = { name: "", email: "", password: "", role: "USER" };
const emptyReview = { storeId: "", userId: "", rating: "5", comment: "" };

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;

const unwrap = (response) => response.data?.data || [];

function Dashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [storeReviews, setStoreReviews] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminReady, setAdminReady] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [userForm, setUserForm] = useState(emptyUser);
  const [reviewForm, setReviewForm] = useState(emptyReview);

  const email = getEmailFromToken();
  const role = getRoleFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "OWNER") {
      navigate("/owner-dashboard", { replace: true });
    } else if (role === "USER") {
      navigate("/user-dashboard", { replace: true });
    }
  }, [navigate, role]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setNotice({ type: "", message: "" });

    const [usersResult, storesResult, reviewsResult] = await Promise.allSettled([
      API.get("/users"),
      API.get("/stores"),
      API.get("/reviews"),
    ]);

    if (usersResult.status === "fulfilled") {
      setUsers(unwrap(usersResult.value));
      setAdminReady(true);
    } else {
      setUsers([]);
      setAdminReady(false);
    }

    if (storesResult.status === "fulfilled") {
      setStores(unwrap(storesResult.value));
    } else {
      setNotice({
        type: "error",
        message: getErrorMessage(storesResult.reason, "Unable to load stores."),
      });
    }

    setReviews(reviewsResult.status === "fulfilled" ? unwrap(reviewsResult.value) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadDashboard);
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const ratings = reviews.map((review) => Number(review.rating)).filter(Boolean);
    const average = ratings.length
      ? (ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1)
      : "0.0";

    return [
      { label: "Users", value: users.length || "0", hint: "Admin-only accounts API" },
      { label: "Stores", value: stores.length || "0", hint: "Global store catalog" },
      { label: "Reviews", value: reviews.length || "0", hint: "Platform feedback" },
      { label: "Average", value: average, hint: "Review score" },
    ];
  }, [reviews, stores, users]);

  const visibleStores = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return stores;

    return stores.filter((store) => {
      const value = `${store.name || ""} ${store.description || ""} ${
        store.location || ""
      } ${store.owner?.name || ""}`;
      return value.toLowerCase().includes(term);
    });
  }, [search, stores]);

  const recentReviews = reviews.slice(0, 5);
  const recentStores = stores.slice(0, 5);

  const setSuccess = (message) => setNotice({ type: "success", message });
  const setError = (message) => setNotice({ type: "error", message });

  const createUser = async (event) => {
    event.preventDefault();
    try {
      await API.post("/auth/register", userForm);
      setUserForm(emptyUser);
      setSuccess("User created successfully.");
      loadDashboard();
    } catch (error) {
      setError(getErrorMessage(error, "Unable to create user."));
    }
  };

  const createReview = async (event) => {
    event.preventDefault();
    try {
      await API.post("/reviews", {
        storeId: Number(reviewForm.storeId),
        userId: Number(reviewForm.userId),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm(emptyReview);
      setSuccess("Review added successfully.");
      loadDashboard();
    } catch (error) {
      setError(getErrorMessage(error, "Unable to add review."));
    }
  };

  const loadStoreReviews = async (event) => {
    event.preventDefault();
    if (!selectedStoreId) return;

    try {
      const response = await API.get(`/reviews/store/${selectedStoreId}`);
      setStoreReviews(unwrap(response));
      setSuccess(response.data?.message || "Store reviews loaded.");
    } catch (error) {
      setError(getErrorMessage(error, "Unable to load store reviews."));
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", stat: stores.length },
    { id: "users", label: "Users", stat: users.length },
    { id: "stores", label: "Stores", stat: stores.length },
    { id: "reviews", label: "Reviews", stat: reviews.length },
    { id: "actions", label: "Admin Actions", stat: "+" },
  ];

  return (
    <div className="admin-page admin-console-page">
      <Navbar workspace="admin" />

      <main className="admin-console">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <span>AD</span>
            <div>
              <strong>Admin Workspace</strong>
              <small>{adminReady ? "Platform control" : "Limited access"}</small>
            </div>
          </div>

          <nav className="admin-side-nav" aria-label="Admin dashboard sections">
            {navItems.map((item) => (
              <button
                className={activeView === item.id ? "active" : ""}
                type="button"
                onClick={() => setActiveView(item.id)}
                key={item.id}
              >
                <span>{item.label}</span>
                <strong>{item.stat}</strong>
              </button>
            ))}
          </nav>
        </aside>

        <section className="admin-content">
          <header className="admin-command-bar">
            <div>
              <p className="eyebrow">Admin Dashboard</p>
              <h1>Platform operations</h1>
              <p>
                Oversee users, the store catalog, and review activity. Store ownership
                workflows live in the separate owner dashboard.
              </p>
            </div>

            <div className="admin-session compact-session">
              <span>Admin account</span>
              <strong>{email || "Authenticated admin"}</strong>
              <button className="ghost-button" type="button" onClick={loadDashboard}>
                Refresh
              </button>
            </div>
          </header>

          {!adminReady && !loading && (
            <div className="form-alert error admin-alert" role="alert">
              Admin-only user data is unavailable for this account.
            </div>
          )}

          {notice.message && (
            <div className={`form-alert ${notice.type} admin-alert`} role="alert">
              {notice.message}
            </div>
          )}

          {activeView === "overview" && (
            <div className="admin-view-stack">
              <section className="admin-metrics refined-metrics" aria-label="Overview">
                {metrics.map((metric) => (
                  <article key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <small>{metric.hint}</small>
                  </article>
                ))}
              </section>

              <section className="admin-split">
                <div className="admin-panel">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Recent Stores</p>
                      <h2>Catalog snapshot</h2>
                    </div>
                    <button className="ghost-button slim" type="button" onClick={() => setActiveView("stores")}>
                      View all
                    </button>
                  </div>
                  <div className="owner-store-list">
                    {recentStores.map((store) => (
                      <article key={store.id}>
                        <div>
                          <strong>{store.name}</strong>
                          <span>{store.location || "No location"} - {store.owner?.name || "Unknown owner"}</span>
                        </div>
                      </article>
                    ))}
                    {!recentStores.length && <div className="empty-state">No stores loaded.</div>}
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">Recent Reviews</p>
                      <h2>Latest feedback</h2>
                    </div>
                    <button className="ghost-button slim" type="button" onClick={() => setActiveView("reviews")}>
                      View all
                    </button>
                  </div>
                  <div className="review-admin-list">
                    {recentReviews.map((review) => (
                      <article key={review.id}>
                        <strong>{review.rating}/5</strong>
                        <div>
                          <span>{review.store?.name || "Store"}</span>
                          <p>{review.comment || "No comment provided."}</p>
                          <small>{review.user?.name || review.user?.email || "Unknown user"}</small>
                        </div>
                      </article>
                    ))}
                    {!recentReviews.length && <div className="empty-state">No reviews loaded.</div>}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeView === "users" && (
            <section className="admin-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Users API</p>
                  <h2>Registered accounts</h2>
                </div>
                <span className="count-badge">{users.length}</span>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.name || "No name"}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-chip ${String(user.role).toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!users.length && <div className="empty-state">No user data loaded.</div>}
              </div>
            </section>
          )}

          {activeView === "stores" && (
            <section className="admin-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Stores API</p>
                  <h2>Global store catalog</h2>
                </div>
                <label className="table-search">
                  <span>Search</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Name, owner, or location"
                  />
                </label>
              </div>
              {loading ? (
                <div className="empty-state">Loading stores...</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Store</th>
                        <th>Location</th>
                        <th>Owner</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStores.map((store) => (
                        <tr key={store.id}>
                          <td>#{store.id}</td>
                          <td>{store.name}</td>
                          <td>{store.location || "Not listed"}</td>
                          <td>{store.owner?.name || store.owner?.email || "Unknown"}</td>
                          <td>{store.description || "No description"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!visibleStores.length && <div className="empty-state">No stores found.</div>}
                </div>
              )}
            </section>
          )}

          {activeView === "reviews" && (
            <section className="admin-split">
              <div className="admin-panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Reviews API</p>
                    <h2>All feedback</h2>
                  </div>
                  <span className="count-badge">{reviews.length}</span>
                </div>
                <div className="review-admin-list">
                  {reviews.map((review) => (
                    <article key={review.id}>
                      <strong>{review.rating}/5</strong>
                      <div>
                        <span>{review.store?.name || `Store #${review.store?.id || ""}`}</span>
                        <p>{review.comment || "No comment provided."}</p>
                        <small>{review.user?.name || review.user?.email || "Unknown user"}</small>
                      </div>
                    </article>
                  ))}
                  {!reviews.length && <div className="empty-state">No reviews loaded.</div>}
                </div>
              </div>

              <form className="admin-panel" onSubmit={loadStoreReviews}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Store Reviews</p>
                    <h2>Lookup by store</h2>
                  </div>
                </div>
                <div className="lookup-row">
                  <select
                    value={selectedStoreId}
                    onChange={(event) => setSelectedStoreId(event.target.value)}
                    required
                  >
                    <option value="">Select store</option>
                    {stores.map((store) => (
                      <option value={store.id} key={store.id}>
                        #{store.id} {store.name}
                      </option>
                    ))}
                  </select>
                  <button className="primary-button slim-primary" type="submit">
                    Load
                  </button>
                </div>
                <div className="review-admin-list scoped">
                  {storeReviews.map((review) => (
                    <article key={review.id}>
                      <strong>{review.rating}/5</strong>
                      <div>
                        <span>{review.user?.name || review.user?.email || "Unknown user"}</span>
                        <p>{review.comment || "No comment provided."}</p>
                      </div>
                    </article>
                  ))}
                  {!storeReviews.length && <div className="empty-state">Choose a store to inspect its reviews.</div>}
                </div>
              </form>
            </section>
          )}

          {activeView === "actions" && (
            <section className="admin-grid quick-action-grid">
              <form className="admin-panel admin-form" onSubmit={createUser}>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Auth API</p>
                    <h2>Create user</h2>
                  </div>
                </div>
                <label className="field">
                  <span>Name</span>
                  <input value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required />
                </label>
                <label className="field">
                  <span>Role</span>
                  <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                    <option value="USER">User</option>
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <button className="primary-button" type="submit">Create user</button>
              </form>

              <form className="admin-panel admin-form" onSubmit={createReview}>
                <div className="section-heading compact">
                  <div>
                    <p className="eyebrow">Reviews API</p>
                    <h2>Add review</h2>
                  </div>
                </div>
                <label className="field">
                  <span>Store</span>
                  <select value={reviewForm.storeId} onChange={(event) => setReviewForm({ ...reviewForm, storeId: event.target.value })} required>
                    <option value="">Select store</option>
                    {stores.map((store) => (
                      <option value={store.id} key={store.id}>#{store.id} {store.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>User</span>
                  <select value={reviewForm.userId} onChange={(event) => setReviewForm({ ...reviewForm, userId: event.target.value })} required>
                    <option value="">Select user</option>
                    {users.map((user) => (
                      <option value={user.id} key={user.id}>#{user.id} {user.name || user.email}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Rating</span>
                  <select value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option value={rating} key={rating}>{rating}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Comment</span>
                  <input value={reviewForm.comment} onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })} required />
                </label>
                <button className="primary-button" type="submit">Add review</button>
              </form>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
