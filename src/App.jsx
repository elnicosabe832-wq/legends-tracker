import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { captureReferralFromUrl } from './lib/referrals';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import PremiumModal from './components/PremiumModal';
import CreateCareerModal from './components/CreateCareerModal';
import AuthModal from './components/AuthModal';
import ErrorModal from './components/ErrorModal';
import LoadingOverlay from './components/LoadingOverlay';
import Analytics from './components/Analytics';
import CargaPage from './pages/CargaPage';
import PeriodicoPage from './pages/PeriodicoPage';
import MuroPage from './pages/MuroPage';
import PrivacidadPage from './pages/PrivacidadPage';
import ComoFuncionaPage from './pages/ComoFuncionaPage';
import CompartirPage from './pages/CompartirPage';
import Footer from './components/Footer';
import './App.css';

function AppRoutes() {
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

  return (
    <>
      <Header />
      <Navigation />
      <main className="main">
        <Routes>
          <Route path="/" element={<CargaPage />} />
          <Route path="/periodico" element={<PeriodicoPage />} />
          <Route path="/muro" element={<MuroPage />} />
          <Route path="/como-funciona" element={<ComoFuncionaPage />} />
          <Route path="/compartir" element={<CompartirPage />} />
          <Route path="/privacidad" element={<PrivacidadPage />} />
        </Routes>
      </main>
      <Footer />
      <PremiumModal />
      <CreateCareerModal />
      <AuthModal />
      <ErrorModal />
      <LoadingOverlay />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Analytics />
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
