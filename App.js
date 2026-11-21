import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CitizenProtectedRoute from './components/CitizenProtectedRoute';
import { CitizenAuthProvider } from './context/CitizenAuthContext';
import Home from './pages/Home';
import RequestCertificate from './pages/RequestCertificate';
import TrackApplication from './pages/TrackApplication';
import VerifyCertificate from './pages/VerifyCertificate';
import CitizenLogin from './pages/CitizenLogin';
import CitizenRegister from './pages/CitizenRegister';
import CitizenCertificates from './pages/CitizenCertificates';
import AdminLogin from './pages/AdminLogin';
import AdminApplications from './pages/AdminApplications';
import AdminCertificates from './pages/AdminCertificates';
import './styles/global.css';
import './styles/Forms.css';
import './styles/Admin.css';

function PublicLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="public-main">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CitizenAuthProvider>
        <div className="app-watermark" aria-hidden="true">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="" />
        </div>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><CitizenLogin /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><CitizenRegister /></PublicLayout>} />
          <Route path="/request" element={<PublicLayout><CitizenProtectedRoute><RequestCertificate /></CitizenProtectedRoute></PublicLayout>} />
          <Route path="/track" element={<PublicLayout><TrackApplication /></PublicLayout>} />
          <Route path="/verify" element={<PublicLayout><VerifyCertificate /></PublicLayout>} />
          <Route path="/account/certificates" element={<PublicLayout><CitizenProtectedRoute><CitizenCertificates /></CitizenProtectedRoute></PublicLayout>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/applications" element={<ProtectedRoute><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/certificates" element={<ProtectedRoute><AdminCertificates /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CitizenAuthProvider>
    </BrowserRouter>
  );
}
