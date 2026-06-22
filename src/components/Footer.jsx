import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <p className="footer-copy">© {new Date().getFullYear()} HACA TRAINING. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
