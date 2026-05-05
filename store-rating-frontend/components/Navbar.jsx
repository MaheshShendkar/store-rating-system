import { NavLink, useNavigate } from "react-router-dom";
import { getEmailFromToken, getRoleFromToken } from "../utils/auth";

function Navbar({ workspace = "app" }) {
  const navigate = useNavigate();
  const email = getEmailFromToken();
  const role = getRoleFromToken();
  const resolvedWorkspace =
    workspace !== "app"
      ? workspace
      : role === "OWNER"
        ? "owner"
        : role === "USER"
          ? "user"
          : "admin";
  const isOwner = resolvedWorkspace === "owner";
  const isAdmin = resolvedWorkspace === "admin";
  const isUser = resolvedWorkspace === "user";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="app-nav professional-nav">
      <button
        className="brand-button nav-brand"
        onClick={() =>
          navigate(isOwner ? "/owner-dashboard" : isUser ? "/user-dashboard" : "/dashboard")
        }
      >
        <span>{isOwner ? "OW" : isUser ? "US" : isAdmin ? "AD" : "SR"}</span>
        <div>
          <strong>StoreRating</strong>
          <small>
            {isOwner ? "Owner Console" : isUser ? "User Console" : isAdmin ? "Admin Console" : "Portal"}
          </small>
        </div>
      </button>

      <nav aria-label="Primary navigation">
        {isOwner ? (
          <NavLink className="nav-link" to="/owner-dashboard">
            Owner Dashboard
          </NavLink>
        ) : isUser ? (
          <NavLink className="nav-link" to="/user-dashboard">
            User Dashboard
          </NavLink>
        ) : (
          <NavLink className="nav-link" to="/dashboard">
            Admin Dashboard
          </NavLink>
        )}
        <NavLink className="nav-link" to="/stores">
          Stores
        </NavLink>
        {isOwner && (
          <NavLink className="nav-link" to="/create-store">
            Create Store
          </NavLink>
        )}
        {(isAdmin || isUser) && (
          <NavLink className="nav-link" to="/add-review">
            Add Review
          </NavLink>
        )}
      </nav>

      <div className="nav-account">
        <span>{email || "Signed in"}</span>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
