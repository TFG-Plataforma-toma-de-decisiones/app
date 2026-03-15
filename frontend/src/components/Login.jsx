import { useState } from "react";
import './Login.css';
import { useAuth } from "../hooks/useAuth";
import useAction from "../hooks/useAction";

export default function Login() {
    const { login,addUser } = useAuth();
    const {run}=useAction()
    const [form, setForm] = useState({
        username: "",
        password: ""
    });
    const handleLogin = async (e) => {
        e.preventDefault();
        const token=await run({endpoint:"/login",body:form,updateState:(token)=>login(token)});
        if(!token){
            return ;
        }
        await(run({endpoint:"/users/me",updateState:(user)=>addUser(user),navigateURL:("/"),method:"GET"}))
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