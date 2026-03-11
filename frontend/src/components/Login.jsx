import { useAuth } from "../hooks/useAuth";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useState } from "react";
import apiClient from '../services/api';
import { useGlobalError } from '../hooks/useGlobalError';
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
    const { login } = useAuth();
    const { showError } = useGlobalError();
    const [form, setForm] = useState({
        username: "",
        password: ""
    });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevenir recarga del formulario
        try {
            const { data } = await apiClient.post("/login", form);
            login(data);
            navigate("/");
        } catch (error) {
            showError(error.response?.data?.detail || "Error while logging in");
        }
    };

    return (
        <Box className="login-page">
            <Box 
                component="form" 
                className="login-card"
                onSubmit={handleLogin}
            >
                <Box className="login-header">
                    <Typography variant="h5" component="h1" className="login-title">
                        Bienvenido
                    </Typography>
                    <Typography variant="body2" className="login-subtitle">
                        Accede a tu cuenta para configurar proyectos
                    </Typography>
                </Box>

                <TextField
                    label="Usuario"
                    variant="outlined"
                    fullWidth
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                />

                <TextField
                    label="Contraseña"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    className="login-btn-submit"
                >
                    Acceder
                </Button>
            </Box>
        </Box>
    );
}