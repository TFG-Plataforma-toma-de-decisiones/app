import { Route, Routes } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Project from './components/Project';
import Navbar from './components/Navbar';
import Home from './HomePage';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import UVLProvider from './context/UVLContext';

const AppWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});


const MainContent = styled(Container)(({ theme }) => ({
  flex: 1, 
  paddingTop: theme.spacing(6),    
  paddingBottom: theme.spacing(6),
}));



function App() {
  const { isAuthenticated } = useAuth();
  return (
    <AppWrapper>
      <Navbar />
      <MainContent component="main" maxWidth="lg">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/recomendador" element={<div>Página del Recomendador (En construcción)</div>} />
          
          {!isAuthenticated && (
            <Route path="/login" element={<Login />} />
          )}
          
          {/* Rutas de Administrador */}
          <Route path="/uvl-model" element={<div>Gestión del Modelo UVL</div>} />
          <Route path="/projects/:id" element={<UVLProvider readOnly={false}><Project/></UVLProvider>} /> 
        </Routes>
      </MainContent>
    </AppWrapper>
  );
}

export default App;