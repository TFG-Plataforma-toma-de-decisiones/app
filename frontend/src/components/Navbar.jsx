import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Lado izquierdo: Logo / Título */}
        <Link to="/" className="navbar-brand">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">OSS Configurator</span>
        </Link>

        {/* Lado derecho: Enlaces */}
        <ul className="navbar-links">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Inicio
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/recomendador" 
              className={`nav-link ${location.pathname === '/recomendador' ? 'active' : ''}`}
            >
              Recomendador
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/login" 
              className={`nav-link login-btn ${location.pathname === '/login' ? 'active' : ''}`}
            >
              Acceder
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;