import { useCallback, useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { getRoleFromToken } from "../utils/auth";

function Stores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = getRoleFromToken();

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/stores");
      setStores(res.data.data || []);
    } catch {
      setError("Unable to load stores. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchStores);
  }, [fetchStores]);

  const filteredStores = stores.filter((store) => {
    const searchable = `${store.name || ""} ${store.description || ""} ${store.location || ""}`;
    return searchable.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="stores-page">
      <Navbar workspace={role === "OWNER" ? "owner" : role === "USER" ? "user" : "app"} />

      <main className="stores-wrap">
        <section className="stores-header">
          <div>
            <p className="eyebrow">Store Directory</p>
            <h1>Discover rated stores</h1>
            <p>
              Browse every store available through the backend catalog and find
              the right place by name, description, or location.
            </p>
          </div>

          <div className="stores-summary" aria-label="Store count">
            <span>Total stores</span>
            <strong>{stores.length}</strong>
          </div>
        </section>

        <section className="stores-toolbar" aria-label="Store tools">
          <label className="stores-search">
            <span>Search stores</span>
            <input
              type="search"
              placeholder="Search by name, location, or description"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <button className="ghost-button" type="button" onClick={fetchStores}>
            Refresh
          </button>
        </section>

        {error && (
          <div className="form-alert error stores-alert" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="stores-grid">
            {[1, 2, 3].map((item) => (
              <div className="store-tile skeleton" key={item} />
            ))}
          </div>
        ) : filteredStores.length ? (
          <section className="stores-grid" aria-label="Stores">
            {filteredStores.map((store) => (
              <article className="store-tile" key={store.id}>
                <div className="store-tile-top">
                  <span className="store-avatar">{store.name?.charAt(0) || "S"}</span>
                  <span className="store-id">#{store.id}</span>
                </div>

                <h2>{store.name}</h2>
                <p>{store.description || "No description has been added for this store."}</p>

                <div className="store-meta">
                  <span>{store.location || "Location not listed"}</span>
                  {store.owner?.name && <span>Owner: {store.owner.name}</span>}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="empty-state stores-empty">
            No stores match your search.
          </div>
        )}
      </main>
    </div>
  );
}

export default Stores;
