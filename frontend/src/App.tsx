import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
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
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/orders/:id/track" element={<TrackDelivery />} />
        {/* Catch-all route for old/invalid routes */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App

