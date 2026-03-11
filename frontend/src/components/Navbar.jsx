import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
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
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Inicio
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/recomendador" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Recomendador
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/login" 
              className={({ isActive }) => `nav-link login-btn ${isActive ? 'active' : ''}`}
            >
              Acceder
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;