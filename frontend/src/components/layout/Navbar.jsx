import React from "react";
import { Link, NavLink } from "react-router-dom";
import './Navbar.css';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="toolbar">
          <Link to="/" className="logo-link">
            <span>🚀</span> OSS Configurator
          </Link>

          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Inicio
            </NavLink>

            <NavLink to="/recomendador" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Recomendador
            </NavLink>

            {isAuthenticated ? (
              <button className="action-button" onClick={logout}>
                Log out
              </button>
            ) : (
              <NavLink to="/login" className="action-button">
                Acceder
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;