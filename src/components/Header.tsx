import React from 'react';
import '../styles/Header.css';
import { Calendar, Ticket, UserCircle, Users, Video, NotebookPen, ListCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/thetry_logo.png';

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <header className="header u-surface">
      <div className="header-container">
        <div className="header-inner">
          <div className="left-group">
            <div className="logo-group">
              <img src={logo} className="logo-header-icon" alt="THE TRY Logo" />
            </div>

            <nav className="nav">
              <Link
                to="/reservation"
                className={`nav-btn ${isActive('/reservation') ? 'active' : ''}`}
                aria-current={isActive('/reservation') ? 'page' : undefined}
              >
                <NotebookPen className="header-icon" />
                예약
              </Link>

              <Link
                to="/reservation-manage"
                className={`nav-btn ${isActive('/reservation-manage') ? 'active' : ''}`}
                aria-current={isActive('/reservation-manage') ? 'page' : undefined}
              >
                <ListCheck className="header-icon" />
                예약 관리
              </Link>

              <Link
                to="/schedule"
                className={`nav-btn ${isActive('/schedule') ? 'active' : ''}`}
                aria-current={isActive('/schedule') ? 'page' : undefined}
              >
                <Calendar className="header-icon" />
                일정
              </Link>

              <Link
                to="/users"
                className={`nav-btn ${isActive('/users') ? 'active' : ''}`}
                aria-current={isActive('/users') ? 'page' : undefined}
              >
                <Users className="header-icon" />
                회원 관리
              </Link>

              <Link
                to="/videos"
                className={`nav-btn ${isActive('/videos') ? 'active' : ''}`}
                aria-current={isActive('/videos') ? 'page' : undefined}
              >
                <Video className="header-icon" />
                영상 분석
              </Link>

              <Link
                to="/tickets"
                className={`nav-btn ${isActive('/tickets') ? 'active' : ''}`}
                aria-current={isActive('/tickets') ? 'page' : undefined}
              >
                <Ticket className="header-icon" />
                수강권
              </Link>
            </nav>
          </div>

          <div className="right-group">
            <Link
              to="/my"
              className={`nav-btn ${isActive('/my') ? 'active' : ''}`}
              aria-current={isActive('/my') ? 'page' : undefined}
            >
              <UserCircle className="header-icon" />
              내 정보
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
