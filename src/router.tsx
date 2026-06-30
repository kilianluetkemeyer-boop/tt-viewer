import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import KonkurrenzPage from './pages/KonkurrenzPage'
import SpielerPage from './pages/SpielerPage'
import LivePage from './pages/LivePage'
import DashboardPage from './pages/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/dashboard/:id',
    element: <DashboardPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'konkurrenz/:id', element: <KonkurrenzPage /> },
      { path: 'spieler', element: <SpielerPage /> },
      { path: 'live', element: <LivePage /> },
    ],
  },
])
