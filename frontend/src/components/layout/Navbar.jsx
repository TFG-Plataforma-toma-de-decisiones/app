import React from "react";
import { Link, NavLink } from "react-router-dom";
import './Navbar.css';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { isAuthenticated, logout,isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="toolbar">
          <Link to="/" className="logo-link">
           OSS Configurator
          </Link>

          <div className="nav-links">
            <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Inicio
            </NavLink>

            {!isAdmin && (
              <NavLink to="/recomendador" data-cy="nav-recommender" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                Recomendador
              </NavLink>
            )}
            {isAdmin && <NavLink to="/uvl-model" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} data-cy="nav-model">
              Modelo uvl
            </NavLink>}
            {isAuthenticated ? (
              <button className="action-button" onClick={logout} data-cy="nav-logout">
                Cerrar sesión
              </button>
            ) : (
              <NavLink to="/login" className="action-button" data-cy="nav-login">
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
