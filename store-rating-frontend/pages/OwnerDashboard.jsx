import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { getEmailFromToken, getRoleFromToken } from "../utils/auth";

const emptyStore = { name: "", description: "", location: "" };

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;

const unwrap = (response) => response.data?.data || [];

function OwnerDashboard() {
  const [activeView, setActiveView] = useState("portfolio");
  const [myStores, setMyStores] = useState([]);
  const [catalogStores, setCatalogStores] = useState([]);
  const [storeReviews, setStoreReviews] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storeForm, setStoreForm] = useState(emptyStore);
  const [editingStore, setEditingStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  const email = getEmailFromToken();
  const role = getRoleFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "ADMIN") navigate("/dashboard", { replace: true });
    if (role === "USER") navigate("/user-dashboard", { replace: true });
  }, [navigate, role]);

  const loadOwnerData = useCallback(async () => {
    setLoading(true);
    setNotice({ type: "", message: "" });

    const [ownedResult, catalogResult] = await Promise.allSettled([
      API.get("/stores/my-stores"),
      API.get("/stores"),
    ]);

    if (ownedResult.status === "fulfilled") {
      setMyStores(unwrap(ownedResult.value));
    } else {
      setNotice({
        type: "error",
        message: getErrorMessage(
          ownedResult.reason,
          "Unable to load your stores. Confirm this account has owner access.",
        ),
      });
      setMyStores([]);
    }

    setCatalogStores(catalogResult.status === "fulfilled" ? unwrap(catalogResult.value) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadOwnerData);
  }, [loadOwnerData]);

  const selectedStore = useMemo(
    () => myStores.find((store) => String(store.id) === String(selectedStoreId)),
    [myStores, selectedStoreId],
  );

  const locations = useMemo(
    () => new Set(myStores.map((store) => store.location).filter(Boolean)).size,
    [myStores],
  );

  const metrics = [
    { label: "Owned stores", value: myStores.length, hint: "Stores linked to this owner" },
    { label: "Catalog size", value: catalogStores.length, hint: "All visible stores" },
    { label: "Locations", value: locations, hint: "Owned store coverage" },
    { label: "Loaded reviews", value: storeReviews.length, hint: "For selected store" },
  ];

  const navItems = [
    { id: "portfolio", label: "Portfolio", stat: myStores.length },
    { id: "manage", label: "Manage Store", stat: editingStore ? "Edit" : "+" },
    { id: "reviews", label: "Store Reviews", stat: storeReviews.length },
  ];

  const updateField = (event) => {
    const { name, value } = event.target;
    setStoreForm((current) => ({ ...current, [name]: value }));
  };

  const startEdit = (store) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name || "",
      description: store.description || "",
      location: store.location || "",
    });
    setActiveView("manage");
  };

  const resetForm = () => {
    setEditingStore(null);
    setStoreForm(emptyStore);
  };

  const saveStore = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice({ type: "", message: "" });

    try {
      if (editingStore) {
        await API.put(`/stores/${editingStore.id}`, storeForm);
        setNotice({ type: "success", message: "Store updated successfully." });
      } else {
        await API.post("/stores", storeForm);
        setNotice({ type: "success", message: "Store created successfully." });
      }

      resetForm();
      loadOwnerData();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to save store."),
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteStore = async (storeId) => {
    setNotice({ type: "", message: "" });

    try {
      await API.delete(`/stores/${storeId}`);
      setNotice({ type: "success", message: "Store deleted successfully." });
      loadOwnerData();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to delete store."),
      });
    }
  };

  const loadReviews = async (event) => {
    event.preventDefault();
    if (!selectedStoreId) return;

    try {
      const response = await API.get(`/reviews/store/${selectedStoreId}`);
      setStoreReviews(unwrap(response));
      setNotice({
        type: "success",
        message: response.data?.message || "Store reviews loaded.",
      });
    } catch (error) {
      setStoreReviews([]);
      setNotice({
        type: "error",
        message: getErrorMessage(
          error,
          "Unable to load reviews for this store. Please try again.",
        ),
      });
    }
  };

  return (
    <div className="owner-dashboard-page">
      <Navbar workspace="owner" />

      <main className="owner-console">
        <aside className="owner-sidebar">
          <div className="admin-sidebar-brand">
            <span>OW</span>
            <div>
              <strong>Owner Workspace</strong>
              <small>{email || "Signed in owner"}</small>
            </div>
          </div>

          <nav className="admin-side-nav" aria-label="Owner dashboard sections">
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

        <section className="owner-content">
          <header className="owner-command-bar">
            <div>
              <p className="eyebrow">Owner Dashboard</p>
              <h1>Manage your store portfolio</h1>
              <p>
                Create listings, update owned stores, remove outdated locations,
                and inspect review access from the backend APIs.
              </p>
            </div>

            <div className="owner-session">
              <span>Owner account</span>
              <strong>{email || "Authenticated owner"}</strong>
              <button className="ghost-button" type="button" onClick={loadOwnerData}>
                Refresh
              </button>
            </div>
          </header>

          {notice.message && (
            <div className={`form-alert ${notice.type} owner-alert`} role="alert">
              {notice.message}
            </div>
          )}

          <section className="owner-metrics" aria-label="Owner overview">
            {metrics.map((metric) => (
              <article key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.hint}</small>
              </article>
            ))}
          </section>

          {activeView === "portfolio" && (
            <section className="owner-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">My Stores API</p>
                  <h2>Owned stores</h2>
                </div>
                <button className="primary-button owner-inline-action" type="button" onClick={() => setActiveView("manage")}>
                  Add store
                </button>
              </div>

              {loading ? (
                <div className="empty-state">Loading your stores...</div>
              ) : myStores.length ? (
                <div className="owner-store-grid">
                  {myStores.map((store) => (
                    <article className="owner-store-card" key={store.id}>
                      <div className="store-tile-top">
                        <span className="store-avatar">{store.name?.charAt(0) || "S"}</span>
                        <span className="store-id">#{store.id}</span>
                      </div>
                      <h3>{store.name}</h3>
                      <p>{store.description || "No description added yet."}</p>
                      <div className="store-meta">
                        <span>{store.location || "Location not listed"}</span>
                      </div>
                      <div className="owner-card-actions">
                        <button className="ghost-button slim" type="button" onClick={() => startEdit(store)}>
                          Edit
                        </button>
                        <button className="danger-button" type="button" onClick={() => deleteStore(store.id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  No owned stores found. Create your first store from Manage Store.
                </div>
              )}
            </section>
          )}

          {activeView === "manage" && (
            <section className="owner-manage-grid">
              <form className="owner-panel owner-form" onSubmit={saveStore}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Stores API</p>
                    <h2>{editingStore ? "Edit store" : "Create store"}</h2>
                  </div>
                  {editingStore && (
                    <button className="ghost-button slim" type="button" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>

                <label className="field">
                  <span>Store name</span>
                  <input
                    name="name"
                    value={storeForm.name}
                    onChange={updateField}
                    placeholder="Urban Fresh Market"
                    required
                  />
                </label>

                <label className="field">
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={storeForm.description}
                    onChange={updateField}
                    placeholder="Short description for customers"
                    required
                  />
                </label>

                <label className="field">
                  <span>Location</span>
                  <input
                    name="location"
                    value={storeForm.location}
                    onChange={updateField}
                    placeholder="City, area, or address"
                    required
                  />
                </label>

                <div className="create-store-actions">
                  <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? "Saving..." : editingStore ? "Save changes" : "Create store"}
                  </button>
                  <button className="ghost-button" type="button" onClick={resetForm}>
                    Clear
                  </button>
                </div>
              </form>

              <aside className="owner-preview">
                <span className="store-avatar">{storeForm.name?.charAt(0) || "S"}</span>
                <h2>{storeForm.name || "Store preview"}</h2>
                <p>{storeForm.description || "Your listing description will preview here."}</p>
                <div className="create-store-meta">
                  <span>{editingStore ? `PUT /api/stores/${editingStore.id}` : "POST /api/stores"}</span>
                  <strong>{storeForm.location || "Location not set"}</strong>
                </div>
              </aside>
            </section>
          )}

          {activeView === "reviews" && (
            <section className="owner-manage-grid">
              <form className="owner-panel" onSubmit={loadReviews}>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Review Lookup</p>
                    <h2>Check store feedback</h2>
                  </div>
                </div>

                <div className="lookup-row">
                  <select
                    value={selectedStoreId}
                    onChange={(event) => setSelectedStoreId(event.target.value)}
                    required
                  >
                    <option value="">Select owned store</option>
                    {myStores.map((store) => (
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
                  {!storeReviews.length && (
                    <div className="empty-state">
                      Select a store to request reviews from the backend.
                    </div>
                  )}
                </div>
              </form>

              <aside className="owner-preview">
                <p className="eyebrow">Selected Store</p>
                <h2>{selectedStore?.name || "No store selected"}</h2>
                <p>{selectedStore?.description || "Choose one of your stores to inspect review access."}</p>
                <div className="create-store-meta">
                  <span>GET /api/reviews/store/{selectedStoreId}</span>
                  <strong>{selectedStore?.location || "Location unavailable"}</strong>
                </div>
              </aside>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default OwnerDashboard;
