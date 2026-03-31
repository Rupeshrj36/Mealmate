import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">🍽️ <span>MealMate</span></div>
          <p className="footer-desc">The smart mess management system for college students. Never miss a meal, always know what's cooking.</p>
          <div className="footer-socials">
            <a href="#" aria-label="GitHub"><FiGithub /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="Email"><FiMail /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/messes">Mess Listings</Link>
          <Link to="/weekly-menu">Weekly Menu</Link>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/register?role=owner">Register as Owner</Link>
        </div>
        <div className="footer-col">
          <h4>Meal Types</h4>
          <span className="badge badge-breakfast">🌅 Breakfast</span>
          <span className="badge badge-lunch" style={{marginTop:6}}>☀️ Lunch</span>
          <span className="badge badge-dinner" style={{marginTop:6}}>🌙 Dinner</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 MealMate. Built with ❤️ for college students.</span>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </div>
    <style>{`
      .footer { background: var(--gray-900); color: var(--gray-400); padding: 60px 0 0; margin-top: 80px; }
      [data-theme="dark"] .footer { background: #0A0A0A; }
      .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 48px; }
      .footer-logo { display: flex; align-items: center; gap: 8px; font-family: 'Sora', sans-serif; font-weight: 800; font-size: 20px; color: white; margin-bottom: 12px; }
      .footer-desc { font-size: 14px; line-height: 1.7; max-width: 280px; }
      .footer-socials { display: flex; gap: 12px; margin-top: 20px; }
      .footer-socials a { width: 36px; height: 36px; border-radius: 8px; background: var(--gray-800); color: var(--gray-400); display: flex; align-items: center; justify-content: center; transition: var(--transition); font-size: 16px; }
      .footer-socials a:hover { background: var(--primary); color: white; }
      .footer-col { display: flex; flex-direction: column; gap: 10px; }
      .footer-col h4 { color: white; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
      .footer-col a { font-size: 14px; color: var(--gray-400); transition: var(--transition); }
      .footer-col a:hover { color: white; }
      .footer-bottom { border-top: 1px solid var(--gray-800); padding: 20px 0; display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
      .footer-bottom-links { display: flex; gap: 20px; }
      .footer-bottom-links a { color: var(--gray-400); }
      .footer-bottom-links a:hover { color: white; }
      @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } .footer-bottom { flex-direction: column; gap: 10px; text-align: center; } }
      @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
    `}</style>
  </footer>
);

export default Footer;
