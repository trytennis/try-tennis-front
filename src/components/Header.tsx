// src/components/Header.tsx
import React from 'react';
import '../styles/Header.css';
import { Calendar, Ticket, UserCircle, Users, Video, NotebookPen, ListCheck, Store, MessageSquareMoreIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/thetry_logo.png';
import { useMyRole } from '../utils/useMyRole';

const Header = () => {
  const location = useLocation();
  const { role, loading } = useMyRole();

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // 간단 권한 헬퍼
  const canSee = {
    reservation: true,
    reservationManage: role === "super_admin" || role === "facility_admin" || role === "coach",
    schedule: role === "super_admin" || role === "facility_admin" || role === "coach",
    users: role === "super_admin" || role === "facility_admin" || role === "coach",
    videos: true, // 모든 롤
    tickets: role === "super_admin" || role === "facility_admin" || role === "coach",
    my: true,
    facility: role === "super_admin" || role === "facility_admin",
    coaching: role === "super_admin" || role === "facility_admin" || role === "coach",
  };

  // 로딩 중엔 깜빡임 방지
  if (loading) {
    return (
      <header className="header u-surface">
        <div className="header-container"><div className="header-inner">
          <div className="left-group">
            <div className="logo-group">
              <img src={logo} className="logo-header-icon" alt="THE TRY Logo" />
            </div>
          </div>
        </div></div>
      </header>
    );
  }

  return (
    <header className="header u-surface">
      <div className="header-container">
        <div className="header-inner">
          <div className="left-group">
            <div className="logo-group">
              <img src={logo} className="logo-header-icon" alt="THE TRY Logo" />
            </div>

            <nav className="nav">
              {canSee.reservation && (
                <Link to="/reservation" className={`nav-btn ${isActive('/reservation') ? 'active' : ''}`} aria-current={isActive('/reservation') ? 'page' : undefined}>
                  <NotebookPen className="header-icon" />
                  예약
                </Link>
              )}

              {canSee.reservationManage && (
                <Link to="/reservation-manage" className={`nav-btn ${isActive('/reservation-manage') ? 'active' : ''}`} aria-current={isActive('/reservation-manage') ? 'page' : undefined}>
                  <ListCheck className="header-icon" />
                  예약 관리
                </Link>
              )}

              {canSee.schedule && (
                <Link to="/schedule" className={`nav-btn ${isActive('/schedule') ? 'active' : ''}`} aria-current={isActive('/schedule') ? 'page' : undefined}>
                  <Calendar className="header-icon" />
                  일정
                </Link>
              )}

              {canSee.users && (
                <Link to="/users" className={`nav-btn ${isActive('/users') ? 'active' : ''}`} aria-current={isActive('/users') ? 'page' : undefined}>
                  <Users className="header-icon" />
                  회원 관리
                </Link>
              )}

              {canSee.facility && (
                <Link to="/facility" className={`nav-btn ${isActive('/facility') ? 'active' : ''}`} aria-current={isActive('/facility') ? 'page' : undefined}>
                  <Store className="header-icon" />
                  시설 관리
                </Link>
              )}

              {canSee.videos && (
                <Link to="/videos" className={`nav-btn ${isActive('/videos') ? 'active' : ''}`} aria-current={isActive('/videos') ? 'page' : undefined}>
                  <Video className="header-icon" />
                  영상 분석
                </Link>
              )}

              {canSee.coaching && (
                <Link to="/coaching" className={`nav-btn ${isActive('/coaching') ? 'active' : ''}`} aria-current={isActive('/coaching') ? 'page' : undefined}>
                  <MessageSquareMoreIcon className="header-icon" />
                  영상 코칭
                </Link>
              )}

              {canSee.tickets && (
                <Link to="/tickets" className={`nav-btn ${isActive('/tickets') ? 'active' : ''}`} aria-current={isActive('/tickets') ? 'page' : undefined}>
                  <Ticket className="header-icon" />
                  수강권
                </Link>
              )}
            </nav>
          </div>

          <div className="right-group">
            {canSee.my && (
              <Link to="/my" className={`nav-btn ${isActive('/my') ? 'active' : ''}`} aria-current={isActive('/my') ? 'page' : undefined}>
                <UserCircle className="header-icon" />
                내 정보
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
