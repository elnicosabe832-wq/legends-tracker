import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import PremiumModal from './components/PremiumModal';
import CreateCareerModal from './components/CreateCareerModal';
import AuthModal from './components/AuthModal';
import ErrorModal from './components/ErrorModal';
import LoadingOverlay from './components/LoadingOverlay';
import CargaPage from './pages/CargaPage';
import PeriodicoPage from './pages/PeriodicoPage';
import MuroPage from './pages/MuroPage';
import './App.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Header />
        <Navigation />
        <main className="main">
          <Routes>
            <Route path="/" element={<CargaPage />} />
            <Route path="/periodico" element={<PeriodicoPage />} />
            <Route path="/muro" element={<MuroPage />} />
          </Routes>
        </main>
        <PremiumModal />
        <CreateCareerModal />
        <AuthModal />
        <ErrorModal />
        <LoadingOverlay />
      </BrowserRouter>
    </AppProvider>
  );
}
