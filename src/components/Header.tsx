import React from 'react';
import '../styles/Header.css';
import { Calendar, Ticket, UserCircle, Users, Video } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-inner">
          <div className="left-group">
            <div className="logo-group">
              <div className="logo-header-icon">🎾</div>
              <span className="logo-text">Try Tennis</span>
            </div>
            <nav className="nav">
              <Link to="/schedule" className={`nav-btn ${location.pathname === '/schedule' ? 'active' : ''}`}>
                <Calendar className="header-icon" />
                일정
              </Link>
              <Link to="/users" className={`nav-btn ${location.pathname === '/users' ? 'active' : ''}`}>
                <Users className="header-icon" />
                회원 관리
              </Link>
              <Link to="/videos" className={`nav-btn ${location.pathname === '/videos' ? 'active' : ''}`}>
                <Video className="header-icon" />
                영상 분석
              </Link>
              <Link to="/tickets" className={`nav-btn ${location.pathname === '/tickets' ? 'active' : ''}`}>
                <Ticket className="header-icon" />
                수강권
              </Link>
            </nav>
          </div>
          <div className="right-group">
            <button className="user-btn">
              <UserCircle className="header-icon" />
              김관리자
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
