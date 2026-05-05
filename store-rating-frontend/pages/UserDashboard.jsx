import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { getEmailFromToken, getRoleFromToken, getUserIdFromToken } from "../utils/auth";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [query, setQuery] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const email = getEmailFromToken();
  const role = getRoleFromToken();
  const userId = getUserIdFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "ADMIN") navigate("/dashboard", { replace: true });
    if (role === "OWNER") navigate("/owner-dashboard", { replace: true });
  }, [navigate, role]);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    setNotice({ type: "", message: "" });

    const [storesResult, reviewsResult] = await Promise.allSettled([
      API.get("/stores"),
      API.get("/reviews"),
    ]);

    if (storesResult.status === "fulfilled") {
      setStores(storesResult.value.data?.data || []);
    } else {
      setNotice({
        type: "error",
        message: getErrorMessage(storesResult.reason, "Unable to load stores."),
      });
    }

    setReviews(reviewsResult.status === "fulfilled" ? reviewsResult.value.data?.data || [] : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadUserData);
  }, [loadUserData]);

  const selectedStore = useMemo(
    () => stores.find((store) => String(store.id) === String(selectedStoreId)),
    [selectedStoreId, stores],
  );

  const visibleStores = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return stores;

    return stores.filter((store) => {
      const searchable = `${store.name || ""} ${store.description || ""} ${store.location || ""}`;
      return searchable.toLowerCase().includes(term);
    });
  }, [query, stores]);

  const myReviews = useMemo(
    () => reviews.filter((review) => String(review.user?.id) === String(userId)),
    [reviews, userId],
  );

  const metrics = [
    { label: "Stores", value: stores.length, hint: "Available to review" },
    { label: "My reviews", value: myReviews.length, hint: "Submitted by this account" },
    { label: "All reviews", value: reviews.length, hint: "Platform feedback" },
    { label: "Selected", value: selectedStore ? `#${selectedStore.id}` : "-", hint: "Current store" },
  ];

  const submitReview = async (event) => {
    event.preventDefault();

    if (!userId) {
      setNotice({
        type: "error",
        message: "Please log out and log in again so your user id is included in the session.",
      });
      return;
    }

    try {
      const response = await API.post("/reviews", {
        storeId: Number(selectedStoreId),
        userId: Number(userId),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      setNotice({
        type: "success",
        message: response.data?.message || "Review added successfully.",
      });
      setReviewForm({ rating: "5", comment: "" });
      loadUserData();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to submit review."),
      });
    }
  };

  return (
    <div className="user-dashboard-page">
      <Navbar workspace="user" />

      <main className="user-console">
        <section className="user-hero">
          <div>
            <p className="eyebrow">User Dashboard</p>
            <h1>Find stores and share ratings</h1>
            <p>
              Browse the store catalog, choose a store, and add a review using
              your signed-in user account.
            </p>
          </div>
          <div className="user-session">
            <span>Signed in user</span>
            <strong>{email || "Authenticated user"}</strong>
            <button className="ghost-button" type="button" onClick={loadUserData}>
              Refresh
            </button>
          </div>
        </section>

        {notice.message && (
          <div className={`form-alert ${notice.type} user-alert`} role="alert">
            {notice.message}
          </div>
        )}

        <section className="owner-metrics user-metrics" aria-label="User overview">
          {metrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.hint}</small>
            </article>
          ))}
        </section>

        <section className="user-dashboard-grid">
          <div className="user-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Stores API</p>
                <h2>Choose a store</h2>
              </div>
              <label className="table-search">
                <span>Search</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, location, or description"
                />
              </label>
            </div>

            {loading ? (
              <div className="empty-state">Loading stores...</div>
            ) : (
              <div className="user-store-list">
                {visibleStores.map((store) => (
                  <button
                    className={String(selectedStoreId) === String(store.id) ? "selected" : ""}
                    type="button"
                    onClick={() => setSelectedStoreId(store.id)}
                    key={store.id}
                  >
                    <span className="store-avatar">{store.name?.charAt(0) || "S"}</span>
                    <div>
                      <strong>{store.name}</strong>
                      <small>{store.location || "Location not listed"}</small>
                      <p>{store.description || "No description added."}</p>
                    </div>
                  </button>
                ))}
                {!visibleStores.length && <div className="empty-state">No stores found.</div>}
              </div>
            )}
          </div>

          <form className="user-panel user-review-form" onSubmit={submitReview}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Reviews API</p>
                <h2>Submit review</h2>
              </div>
            </div>

            <div className="user-selected-store">
              <span className="store-avatar">{selectedStore?.name?.charAt(0) || "S"}</span>
              <div>
                <strong>{selectedStore?.name || "Select a store"}</strong>
                <small>{selectedStore?.location || "Choose a store before submitting"}</small>
              </div>
            </div>

            <label className="field">
              <span>Rating</span>
              <select
                value={reviewForm.rating}
                onChange={(event) =>
                  setReviewForm({ ...reviewForm, rating: event.target.value })
                }
              >
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
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm({ ...reviewForm, comment: event.target.value })
                }
                placeholder="Share your experience"
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={!selectedStoreId}>
              Submit review
            </button>
          </form>
        </section>

        <section className="user-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">My Activity</p>
              <h2>My recent reviews</h2>
            </div>
            <span className="count-badge">{myReviews.length}</span>
          </div>
          <div className="review-admin-list">
            {myReviews.map((review) => (
              <article key={review.id}>
                <strong>{review.rating}/5</strong>
                <div>
                  <span>{review.store?.name || "Store"}</span>
                  <p>{review.comment || "No comment provided."}</p>
                </div>
              </article>
            ))}
            {!myReviews.length && <div className="empty-state">No reviews submitted yet.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;
