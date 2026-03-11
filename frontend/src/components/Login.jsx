import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

import { useAuth } from "../hooks/useAuth";
import { useGlobalError } from '../hooks/useGlobalError';
import apiClient from '../services/api';

const PageContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh', 
});

const LoginForm = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),     
  padding: theme.spacing(5), 
  width: '100%',
  maxWidth: '420px',         
}));

const LoginHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(1),
}));

const LoginSubtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
}));
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
        <PageContainer>
            <LoginForm 
                component="form" 
                onSubmit={handleLogin}
                elevation={0} 
            >
                <LoginHeader>
                    <Typography variant="h5" component="h1" fontWeight="bold">
                        Bienvenido
                    </Typography>
                    <LoginSubtitle variant="body2">
                        Accede a tu cuenta para configurar proyectos
                    </LoginSubtitle>
                </LoginHeader>
                <TextField
                    label="Usuario"
                    variant="outlined"
                    fullWidth
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                <TextField
                    label="Contraseña"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                >
                    Acceder
                </Button>
            </LoginForm>
        </PageContainer>
    );
}