import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
// import SchedulePage from '../pages/SchedulePage';
// import MembersPage from '../pages/MembersPage';
import VideoAnalysisPage from '../pages/VideoAnalysisPage';
import TicketsPage from '../pages/TicketsPage';
import AddTicketPage from '../pages/AddTicketPage';
import TicketDetailPage from '../pages/TicketDetailPage';
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
          {/* <Route path="members" element={<MembersPage />} /> */}
          <Route path="videos" element={<VideoAnalysisPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="tickets/add" element={<AddTicketPage />} />
          <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
