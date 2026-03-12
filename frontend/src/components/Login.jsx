import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

import { useAuth } from "../hooks/useAuth";
import { useGlobalError } from '../hooks/useGlobalError';
import apiClient from '../services/api';

export default function Login() {
    const { login } = useAuth();
    const { showError } = useGlobalError();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        password: ""
    });
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await apiClient.post("/login", form);
            login(data);
            navigate("/");
        } catch (error) {
            showError(error.response?.data?.detail || "Error while logging in");
        }
    };
    return (
        <div className="page-container">
            <form className="login-form" onSubmit={handleLogin}>
                <div className="login-header">
                    <h1 className="login-title">Bienvenido</h1>
                    <p className="login-subtitle">
                        Accede a tu cuenta para configurar proyectos
                    </p>
                </div>
                <input
                    className="form-input"
                    placeholder="Usuario"
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <input
                    className="form-input"
                    placeholder="Contraseña"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                    type="submit"
                    className="form-button"
                >
                    Acceder
                </button>
            </form>
        </div>
    );
}