import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
// import SchedulePage from '../pages/SchedulePage';
// import MembersPage from '../pages/MembersPage';
import VideoAnalysisPage from '../pages/VideoAnalysisPage';
import TicketsPage from '../pages/TicketsPage';
import AddTicketPage from '../pages/AddTicketPage';
import TicketDetailPage from '../pages/TicketDetailPage';
import UsersPage from '../pages/UsersPage';
import UserDetailPage from '../pages/UserDetailPage';
// import UserProfileCreatePage from '../pages/UserProfileCreatePage';
import PersonalLessonPage from '../pages/PersonalLessonPage';
import ReservationManagePage from '../pages/ReservationManagementPage';
// import LoginPage from '../pages/LoginPage';
// import RegisterPage from '../pages/RegisterPage';
// import PrivateRoute from './PrivateRoute';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="videos" replace />} />
          {/* <Route path="schedule" element={<SchedulePage />} /> */}
          <Route path="reservation" element={<PersonalLessonPage />} />
          <Route path="reservation-manage" element={<ReservationManagePage />} />
          <Route path="users" element={<UsersPage />} />
          {/* <Route path="users/new" element={<UserProfileCreatePage />} /> */}
          <Route path="users/:userId" element={<UserDetailPage />} />
          <Route path="videos" element={<VideoAnalysisPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/add" element={<AddTicketPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
