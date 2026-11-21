import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link className="footer-brand" to="/"><BrandLogo /></Link>
        <p>Trusted credentials. Simple verification.</p>
        <span>© {new Date().getFullYear()} CredVault · Digital certificate services</span>
      </div>
    </footer>
  );
}
