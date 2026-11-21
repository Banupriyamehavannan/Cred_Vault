export default function BrandLogo({ className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={`${process.env.PUBLIC_URL}/logo.png`}
      alt="CredVault"
    />
  );
}
