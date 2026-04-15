import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import PlaceholderPage from './pages/PlaceholderPage';
import Profile from './pages/Profile';
import QuestionsPage from './pages/Questions';
import QuestionFormPage from './pages/Questions/QuestionFormPage';
import PlayersPage from './pages/Players';
import PlayerDetailPage from './pages/Players/PlayerDetailPage';
import DashboardHome from './pages/Dashboard';
import StorePage from './pages/Store';
import SettingsPage from './pages/Settings';
import MatchesPage from './pages/Matches';
import MatchDetailPage from './pages/Matches/MatchDetailPage';
import NotificationsPage from './pages/Notifications';
import CurrencyPage from './pages/Currency';
import ClansPage from './pages/Clans';
import ClanDetailPage from './pages/Clans/ClanDetail';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="questions" element={<QuestionsPage />} />
          <Route path="questions/new" element={<QuestionFormPage />} />
          <Route path="questions/:id/edit" element={<QuestionFormPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/:id" element={<PlayerDetailPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="matches/:id" element={<MatchDetailPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="currency" element={<CurrencyPage />} />
          <Route path="clans" element={<ClansPage />} />
          <Route path="clans/:id" element={<ClanDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
