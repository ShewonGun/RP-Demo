import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Pages/SharedPages/Login.jsx'
import Signup from './Pages/SharedPages/Signup.jsx'
import WaterLoader from './Components/SharedComponents/WaterLoader.jsx'
import { QualityProvider } from './Context/QualityContext.jsx'

// Lazy-load each role's tree so a household never downloads admin code (and vice-versa).
const DashboardLayout = lazy(() => import('./Components/AdminComponents/DashboardLayout.jsx'))
const Dashboard = lazy(() => import('./Pages/AdminPages/Dashboard.jsx'))
const WaterPackages = lazy(() => import('./Pages/AdminPages/WaterPackages.jsx'))
const Devices = lazy(() => import('./Pages/AdminPages/Devices.jsx'))
const Subscriptions = lazy(() => import('./Pages/AdminPages/Subscriptions.jsx'))
const AdminBilling = lazy(() => import('./Pages/AdminPages/Billing.jsx'))
const AdminAlerts = lazy(() => import('./Pages/AdminPages/Alerts.jsx'))
const LeakAnalytics = lazy(() => import('./Pages/AdminPages/LeakAnalytics.jsx'))
const Users = lazy(() => import('./Pages/AdminPages/Users.jsx'))
const DigitalTwin = lazy(() => import('./Pages/AdminPages/DigitalTwin.jsx'))
const IntrusionAlerts = lazy(() => import('./Pages/AdminPages/IntrusionAlerts.jsx'))
const SensorHub = lazy(() => import('./Pages/AdminPages/SensorHub.jsx'))
const StreetRiskMatrix = lazy(() => import('./Pages/AdminPages/StreetRiskMatrix.jsx'))
const AdminProfile = lazy(() => import('./Pages/AdminPages/Profile.jsx'))
const ZoneDetails = lazy(() => import('./Pages/AdminPages/ZoneDetails.jsx'))
const PressureMonitoring = lazy(() => import('./Pages/AdminPages/PressureMonitoring.jsx'))
const AlertsInvestigations = lazy(() => import('./Pages/AdminPages/AlertsInvestigations.jsx'))
const HydraulicDigitalTwin = lazy(() => import('./Pages/AdminPages/HydraulicDigitalTwin.jsx'))

const UserLayout = lazy(() => import('./Components/UserComponents/UserLayout.jsx'))
const Home = lazy(() => import('./Pages/UserPages/Home.jsx'))
const Usage = lazy(() => import('./Pages/UserPages/Usage.jsx'))
const Plans = lazy(() => import('./Pages/UserPages/Plans.jsx'))
const Billing = lazy(() => import('./Pages/UserPages/Billing.jsx'))
const Account = lazy(() => import('./Pages/UserPages/Account.jsx'))
const UserAlerts = lazy(() => import('./Pages/UserPages/Alerts.jsx'))
const WaterSafety = lazy(() => import('./Pages/UserPages/WaterSafety.jsx'))

// The landing route for a role.
const homeFor = (role) => (role === 'admin' ? '/dashboard' : '/app')

// Require a logged-in user; optionally require a specific role.
const RequireRole = ({ role, children }) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!token) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to={homeFor(user?.role)} replace />
  return children
}

const App = () => {
  return (
    <BrowserRouter>
      <QualityProvider>
        <Suspense fallback={<WaterLoader fullscreen />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin console */}
            <Route
              path="/dashboard"
              element={
                <RequireRole role="admin">
                  <DashboardLayout />
                </RequireRole>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="packages" element={<WaterPackages />} />
              <Route path="devices" element={<Devices />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="alerts" element={<AdminAlerts />} />
              <Route path="analytics" element={<LeakAnalytics />} />
              <Route path="hydrotwin" element={<DigitalTwin />} />
              <Route path="risk-matrix" element={<StreetRiskMatrix />} />
              <Route path="quality-alerts" element={<IntrusionAlerts />} />
              <Route path="sensor-hub" element={<SensorHub />} />
              <Route path="users" element={<Users />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            <Route
              path="/zone/:id"
              element={
                <RequireRole role="admin">
                  <DashboardLayout />
                </RequireRole>
              }
            >
              <Route index element={<ZoneDetails />} />
            </Route>

            <Route
              path="/pressure"
              element={
                <RequireRole role="admin">
                  <DashboardLayout />
                </RequireRole>
              }
            >
              <Route index element={<PressureMonitoring />} />
            </Route>

            <Route
              path="/alerts"
              element={
                <RequireRole role="admin">
                  <DashboardLayout />
                </RequireRole>
              }
            >
              <Route index element={<AlertsInvestigations />} />
            </Route>

            <Route
              path="/digital-twin"
              element={
                <RequireRole role="admin">
                  <DashboardLayout />
                </RequireRole>
              }
            >
              <Route index element={<HydraulicDigitalTwin />} />
            </Route>

            {/* Consumer app */}
            <Route
              path="/app"
              element={
                <RequireRole role="user">
                  <UserLayout />
                </RequireRole>
              }
            >
              <Route index element={<Home />} />
              <Route path="usage" element={<Usage />} />
              <Route path="plans" element={<Plans />} />
              <Route path="billing" element={<Billing />} />
              <Route path="account" element={<Account />} />
              <Route path="alerts" element={<UserAlerts />} />
              <Route path="safety" element={<WaterSafety />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </QualityProvider>
    </BrowserRouter>
  )
}

export default App
