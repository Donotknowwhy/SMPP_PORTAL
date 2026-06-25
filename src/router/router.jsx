import { createBrowserRouter, Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import RequireAuth from './RequireAuth'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../components/LoginPage'
import HomeContent from '../components/HomeContent'
import ProvidersContent from '../components/ProvidersContent'
import ReportsContent from '../components/ReportsContent'
import SmsRequestSection from '../components/SmsRequestSection'
import RoutingRulesContent from '../components/RoutingRulesContent'
import GatewayConfigContent from '../components/GatewayConfigContent'
import BrandnameDeclarationContent from '../components/BrandnameDeclarationContent'
import PricingManagementContent from '../components/PricingManagementContent'
import AccountManagementContent from '../components/AccountManagementContent'
import ReconciliationContent from '../components/ReconciliationContent'
import MessageLookupContent from '../components/MessageLookupContent'
import { useAuth } from '../context/AuthContext'
import { calculateDistribution } from '../utils/providerUtils'

// Pages below this line need data shared by MainLayout (provider list/modals)
// or the auth token, which they read via useOutletContext()/useAuth() instead
// of prop drilling through the route config.

function HomePage() {
  const ctx = useOutletContext()
  return (
    <HomeContent
      providers={ctx.providers}
      totalPercentage={ctx.totalPercentage}
      totalMessages={ctx.totalMessages}
      setTotalMessages={ctx.setTotalMessages}
      showDistribution={ctx.showDistribution}
      setShowDistribution={ctx.setShowDistribution}
      calculateDistribution={() => calculateDistribution(ctx.providers, ctx.totalMessages, ctx.totalPercentage)}
    />
  )
}

function ProvidersPage() {
  const ctx = useOutletContext()
  return (
    <ProvidersContent
      providers={ctx.providers}
      totalPercentage={ctx.totalPercentage}
      openAddModal={ctx.openAddModal}
      distributeEvenly={ctx.distributeEvenly}
      openEditModal={ctx.openEditModal}
      deleteProvider={ctx.deleteProvider}
    />
  )
}

function ReportsPage() {
  const ctx = useOutletContext()
  return <ReportsContent providers={ctx.providers} totalPercentage={ctx.totalPercentage} />
}

function SendSmsPage() {
  const { authToken } = useAuth()
  return <SmsRequestSection authToken={authToken} />
}

function LoginRoute() {
  const { authToken, login } = useAuth()
  const navigate = useNavigate()

  if (authToken) {
    return <Navigate to="/" replace />
  }

  const handleLoginSuccess = (token, username) => {
    login(token, username)
    navigate('/', { replace: true })
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}

function NotFoundPage() {
  return (
    <div className="feature-developing">
      <div className="feature-developing-icon">🚧</div>
      <h2 className="feature-developing-title">Tính năng đang phát triển</h2>
      <p className="feature-developing-text">Chức năng này sẽ sớm được ra mắt. Vui lòng quay lại sau.</p>
    </div>
  )
}

// Single source of truth: one entry per page/route in the app.
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/routing" replace /> },
      { path: 'dashboard', element: <HomePage /> },
      { path: 'home', element: <Navigate to="/dashboard" replace /> },
      { path: 'providers', element: <ProvidersPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'send-sms', element: <SendSmsPage /> },
      { path: 'routing', element: <RoutingRulesContent /> },
      { path: 'gateway', element: <GatewayConfigContent /> },
      { path: 'brandname', element: <BrandnameDeclarationContent /> },
      { path: 'pricing', element: <PricingManagementContent /> },
      { path: 'account', element: <AccountManagementContent /> },
      { path: 'reconcile', element: <ReconciliationContent /> },
      { path: 'lookup', element: <MessageLookupContent /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
