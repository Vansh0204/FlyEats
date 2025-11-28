import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './components/ToastProvider'
import AIChatbot from './components/AIChatbot'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Airports from './pages/Airports'
import AirportDetail from './pages/AirportDetail'
import Outlets from './pages/Outlets'
import OutletDetail from './pages/OutletDetail'
import Checkout from './pages/Checkout'
import OrderDetail from './pages/OrderDetail'
import TrackDelivery from './pages/TrackDelivery'
import PnrInput from './pages/PnrInput'
import MyOrders from './pages/MyOrders'
import OrderQueue from './pages/OrderQueue'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pnr" element={<PnrInput />} />
            <Route path="/airports" element={<Airports />} />
            <Route path="/airports/:id" element={<AirportDetail />} />
            <Route path="/airports/:id/outlets" element={<Outlets />} />
            <Route path="/outlets/:id" element={<OutletDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders/:id/track" element={<TrackDelivery />} />
            <Route path="/orders/:id/queue" element={<OrderQueue />} />
            {/* Catch-all route for old/invalid routes */}
            <Route path="*" element={<Home />} />
          </Routes>
          <AIChatbot />
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App


