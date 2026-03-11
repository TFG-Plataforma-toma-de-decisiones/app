import {useAuth} from "../hooks/useAuth";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import { useState } from "react";
import apiClient from '../services/api';
import { useGlobalError } from '../hooks/useGlobalError';
import { useNavigate } from "react-router-dom";
export default function Login() {
    const { setToken } = useAuth();
    const {showError}=useGlobalError()
    const [form, setForm] = useState({
        username: "",
        password: ""
    });
    const navigate=useNavigate()
    const  login = async() =>{
        try {
            const { data } = await apiClient.post("/login", form);
            setToken(data.access);
            navigate("/")
          } catch (error) {
            showError(error.response?.data?.detail || "Error while logging in");
          }
        }
    return (
        <Box className="login-container">
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={form.username}
                onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                }
            />

            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={form.password}
                onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                }
            />

            <Button
                variant="contained"
                fullWidth
                onClick={() => login(form)}
            >
                Login
            </Button>
        </Box>
    );
}