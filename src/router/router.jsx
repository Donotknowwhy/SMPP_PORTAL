import { createBrowserRouter, Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import RequireAuth from './RequireAuth'
import MainLayout from '../layouts/MainLayout'
import LoginPage from '../pages/LoginPage'
// import HomeContent from '../pages/HomeContent'
import ProvidersContent from '../pages/ProvidersContent'
import ReportsContent from '../pages/ReportsContent'
import SmsRequestSection from '../pages/SmsRequestSection'
// import RoutingRulesContent from '../pages/RoutingRulesContent'
import GatewayConfigContent from '../pages/GatewayConfigContent'
import BrandnameDeclarationContent from '../pages/BrandnameDeclarationContent'
// import PricingManagementContent from '../pages/PricingManagementContent'
// import AccountManagementContent from '../pages/AccountManagementContent'
import ReconciliationContent from '../pages/ReconciliationContent'
import MessageLookupContent from '../pages/MessageLookupContent'
import { useAuth } from '../context/AuthContext'
// import { calculateDistribution } from '../utils/providerUtils'

// Pages below this line need data shared by MainLayout (provider list/modals)
// or the auth token, which they read via useOutletContext()/useAuth() instead
// of prop drilling through the route config.

// function HomePage() {
//   const ctx = useOutletContext()
//   return (
//     <HomeContent
//       providers={ctx.providers}
//       totalPercentage={ctx.totalPercentage}
//       totalMessages={ctx.totalMessages}
//       setTotalMessages={ctx.setTotalMessages}
//       showDistribution={ctx.showDistribution}
//       setShowDistribution={ctx.setShowDistribution}
//       calculateDistribution={() => calculateDistribution(ctx.providers, ctx.totalMessages, ctx.totalPercentage)}
//     />
//   )
// }

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
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <NotFoundPage /> },
      { path: 'home', element: <Navigate to="/dashboard" replace /> },
      { path: 'providers', element: <ProvidersPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'send-sms', element: <SendSmsPage /> },
      { path: 'routing', element: <NotFoundPage /> },
      { path: 'gateway', element: <GatewayConfigContent /> },
      { path: 'brandname', element: <BrandnameDeclarationContent /> },
      { path: 'pricing', element: <NotFoundPage /> },
      { path: 'account', element: <NotFoundPage /> },
      { path: 'reconcile', element: <ReconciliationContent /> },
      { path: 'lookup', element: <MessageLookupContent /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
