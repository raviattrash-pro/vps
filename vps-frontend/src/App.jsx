import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Attendance from './components/Attendance';
import CreateContent from './components/CreateContent';
import Syllabus from './components/Syllabus';
import Login from './components/Login';
import Homework from './components/Homework';
import Notices from './components/Notices';
import StudyMaterial from './components/StudyMaterial';
import Question from './components/Question';
import ComingSoon from './components/ComingSoon';
import AdminDashboard from './components/AdminDashboard';
import LiveClass from './components/LiveClass';
import MarkSheet from './components/MarkSheet';
import Reports from './components/Reports';
import Payment from './components/Payment';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

import { DesktopSidebar, MobileBottomNav } from './components/Navigation';

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) return children; // No layout for login page

  return (
    <div className="app-wrapper">
      {/* Desktop Sidebar (Left) */}
      <div className="hide-on-mobile">
        <DesktopSidebar />
      </div>

      {/* Main Content (Center) */}
      <div className="main-content">
        {children}
      </div>

      {/* Mobile Bottom Nav (Fixed Bottom) */}
      <div className="hide-on-desktop">
        <MobileBottomNav />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/attendance" element={
            <PrivateRoute><Attendance /></PrivateRoute>
          } />
          <Route path="/create-content" element={
            <PrivateRoute><CreateContent /></PrivateRoute>
          } />
          <Route path="/syllabus" element={
            <PrivateRoute><Syllabus /></PrivateRoute>
          } />
          <Route path="/homework" element={
            <PrivateRoute><Homework /></PrivateRoute>
          } />
          <Route path="/notices" element={
            <PrivateRoute><Notices /></PrivateRoute>
          } />
          <Route path="/study-material" element={
            <PrivateRoute><StudyMaterial /></PrivateRoute>
          } />
          <Route path="/question" element={
            <PrivateRoute><Question /></PrivateRoute>
          } />
          <Route path="/marks" element={<PrivateRoute><MarkSheet /></PrivateRoute>} />
          <Route path="/live" element={<PrivateRoute><LiveClass /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/coming-soon" element={<PrivateRoute><ComingSoon /></PrivateRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
