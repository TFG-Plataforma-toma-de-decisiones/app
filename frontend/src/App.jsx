import Navbar from './components/Navbar';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Projects from './projects/Projects';
import Home from './home/HomePage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/projects" element={<Projects />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
