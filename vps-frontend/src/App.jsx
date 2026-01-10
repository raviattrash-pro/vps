import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import CommandPalette from './components/CommandPalette';
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
import ActiveUsers from './components/ActiveUsers';
import SchoolCalendar from './components/SchoolCalendar';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import PageTransition from './components/PageTransition';
import NotFound from './pages/NotFound';
import OfflineIndicator from './components/OfflineIndicator';
import ScrollToTop from './components/ScrollToTop';
import SessionTimeout from './components/SessionTimeout';
import Breadcrumbs from './components/Breadcrumbs';

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
        <Breadcrumbs />
        {children}
      </div>

      {/* Mobile Bottom Nav (Fixed Bottom) */}
      <div className="hide-on-desktop">
        <MobileBottomNav />
      </div>
    </div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/" element={
          <PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>
        } />
        <Route path="/attendance" element={
          <PrivateRoute><PageTransition><Attendance /></PageTransition></PrivateRoute>
        } />
        <Route path="/create-content" element={
          <PrivateRoute><PageTransition><CreateContent /></PageTransition></PrivateRoute>
        } />
        <Route path="/syllabus" element={
          <PrivateRoute><PageTransition><Syllabus /></PageTransition></PrivateRoute>
        } />
        <Route path="/homework" element={
          <PrivateRoute><PageTransition><Homework /></PageTransition></PrivateRoute>
        } />
        <Route path="/notices" element={
          <PrivateRoute><PageTransition><Notices /></PageTransition></PrivateRoute>
        } />
        <Route path="/study-material" element={
          <PrivateRoute><PageTransition><StudyMaterial /></PageTransition></PrivateRoute>
        } />
        <Route path="/question" element={
          <PrivateRoute><PageTransition><Question /></PageTransition></PrivateRoute>
        } />
        <Route path="/marks" element={<PrivateRoute><PageTransition><MarkSheet /></PageTransition></PrivateRoute>} />
        <Route path="/live" element={<PrivateRoute><PageTransition><LiveClass /></PageTransition></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><PageTransition><Reports /></PageTransition></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><PageTransition><Payment /></PageTransition></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><PageTransition><AdminDashboard /></PageTransition></PrivateRoute>} />
        <Route path="/admin/active-users" element={<PrivateRoute><PageTransition><ActiveUsers /></PageTransition></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><PageTransition><SchoolCalendar /></PageTransition></PrivateRoute>} />
        <Route path="/coming-soon" element={<PrivateRoute><PageTransition><ComingSoon /></PageTransition></PrivateRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <HelmetProvider>
        <Helmet>
          <title>Vision Public School</title>
          <meta name="description" content="Official School Management App" />
        </Helmet>
        <Analytics />
        <SpeedInsights />
        <Toaster position="top-right" />
        <OfflineIndicator />
        <ScrollToTop />
        {/* Only show session timeout if user is logged in (handled inside component, but better here) */}
        <Router>
          <SessionTimeout />
          <CommandPalette />
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </Router>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
