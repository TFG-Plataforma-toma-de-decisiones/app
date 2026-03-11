import React from "react";
import { Link, NavLink } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Stack } from "@mui/material";
import { styled } from '@mui/material/styles';
import { useAuth } from '../hooks/useAuth';
const LogoLink = styled(Typography)(({ theme }) => ({
  flexGrow: 1, 
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textDecoration: 'none',
  color: theme.palette.text.primary,
  fontWeight: 700,
}));
const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          
          {/* Usamos nuestro componente estilizado */}
          <LogoLink variant="h6" component={Link} to="/">
            <span>🚀</span> OSS Configurator
          </LogoLink>

          {/* <Stack> de MUI reemplaza a flexbox. Alinea todo horizontalmente con un espacio (spacing) */}
          <Stack direction="row" spacing={1} alignItems="center">
            
            <Button component={NavLink} to="/" end>
              Inicio
            </Button>

            <Button component={NavLink} to="/recomendador">
              Recomendador
            </Button>

            {isAuthenticated ? (
              // Usamos nuestro botón estilizado para la acción final
              <ActionButton variant="outlined" onClick={logout}>
                Log out
              </ActionButton>
            ) : (
              <ActionButton component={NavLink} to="/login" >
                Acceder
              </ActionButton>
            )}

          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;