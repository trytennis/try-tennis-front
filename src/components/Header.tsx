import React from 'react';
import '../styles/Header.css';
import { Calendar, Ticket, User, UserCircle, Users, Video } from 'lucide-react';

const Header = () => {
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
              <button className="nav-btn">
                <Calendar className='header-icon'/> 
                일정
              </button>
              <button className="nav-btn">
                <Users className='header-icon'/>
                회원 관리
              </button>
              <button className="nav-btn active">
                <Video className='header-icon'/>
                영상 분석
              </button>
              <button className="nav-btn">
                <Ticket className='header-icon' />
                수강권
              </button>
            </nav>
          </div>
          <div className="right-group">
            <button className="user-btn">
                <UserCircle className='header-icon'/>
              김관리자
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
