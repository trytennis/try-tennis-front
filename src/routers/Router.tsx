// routers/Router.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import VideoAnalysisPage from '../pages/VideoAnalysisPage';
import TicketsPage from '../pages/TicketsPage';
import AddTicketPage from '../pages/AddTicketPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import UsersPage from '../pages/UsersPage';
import UserDetailPage from '../pages/UserDetailPage';
import PersonalLessonPage from '../pages/PersonalLessonPage';
import ReservationManagePage from '../pages/ReservationManagementPage';
import UserProfileCreatePage from '../pages/UserProfileCreatePage';
import CoachCalendar from '../pages/CoachCalenderPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import ProtectedRoute, { RoleRoute } from './ProtectedRouter';
import SignUpPage from '../pages/SignUpPage';
import LoginPage from '../pages/LoginPage';
import MyPage from '../pages/MyPage';
import FacilityManagementPage from '../pages/FacilityManagementPage';
import CoachingPage from '../pages/CoachingPage';
import ScreenManagementPage from '../pages/ScreenManagementPage';
import TabletScreenBookingPage from '../pages/TabletScreenBookingPage';
import AuditLogPage from '../pages/AuditLogPage';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute redirectTo="/login" requireActive>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="videos" replace />} />
          <Route path="schedule" element={<CoachCalendar />} />
          <Route path="reservation" element={<PersonalLessonPage />} />
          <Route path="reservation-manage" element={<ReservationManagePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/new" element={<UserProfileCreatePage />} />
          <Route path="users/:userId" element={<UserDetailPage />} />
          <Route path="audit-logs" element={<RoleRoute roles={["super_admin", "facility_admin"]}><AuditLogPage /></RoleRoute>} />
          <Route path="facility" element={<RoleRoute roles={["super_admin", "facility_admin"]}><FacilityManagementPage /></RoleRoute>} />
          <Route path="screens" element={<RoleRoute roles={["super_admin", "facility_admin", "coach"]}><ScreenManagementPage /></RoleRoute>} />
          <Route path="videos" element={<VideoAnalysisPage />} />
          <Route path="coaching" element={<CoachingPage />} />
          <Route path="tickets" element={<RoleRoute roles={["super_admin", "facility_admin"]}><TicketsPage /></RoleRoute>} />
          <Route path="tickets/add" element={<RoleRoute roles={["super_admin", "facility_admin"]}><AddTicketPage /></RoleRoute>} />
          <Route path="tickets/:ticketId" element={<RoleRoute roles={["super_admin", "facility_admin"]}><TicketDetailPage /></RoleRoute>} />
          <Route path="my" element={<MyPage />} />
        </Route>

        {/* 인증 콜백은 공개 라우트 */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/tablet/screen-booking/:facilityId" element={<TabletScreenBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
