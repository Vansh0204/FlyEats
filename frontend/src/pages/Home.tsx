import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaPlane, FaClock, FaMapMarkerAlt, FaShoppingBag, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import DishesCarousel from '../components/DishesCarousel'
import LoadingSplash from '../components/LoadingSplash'

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  // Show splash screen on first visit
  if (showSplash) {
    return <LoadingSplash onLoadingComplete={() => setShowSplash(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 font-sans">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 glass shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-2 rounded-lg text-white transform group-hover:rotate-12 transition-transform duration-300">
              <FaPlane className="text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">
              Fly<span className="text-orange-600">Eats</span>
            </h1>
          </Link>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-orange-50 rounded-full border border-orange-100 hover:bg-orange-100 transition-colors"
                  >
                    <FaUser className="text-orange-500" />
                    <span className="text-sm font-medium">{user.name || user.email}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                        <Link
                          to="/orders"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                        >
                          <FaShoppingBag className="text-orange-500" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        <Link
                          to="/pnr?redirect=/airports"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors"
                        >
                          <FaPlane className="text-orange-500" />
                          <span className="font-medium">Change PNR</span>
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            handleLogout()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FaSignOutAlt />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all transform hover:scale-105 shadow-lg shadow-orange-200 font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left animate-fade-in">
              <div className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6 animate-slide-up">
                ✈️ Smart Airport Dining
              </div>
              <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight font-display">
                Order Food <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                  Before You Board
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Skip the queues and get delicious meals pre ordered directly from ur mobile.
                Experience the future of airport dining today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/airports"
                  className="px-8 py-4 bg-orange-600 text-white text-lg font-semibold rounded-xl hover:bg-orange-700 transition-all transform hover:scale-105 shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
                >
                  Start Ordering <FaPlane className="text-sm" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all border border-gray-200 flex items-center justify-center gap-2"
                >
                  How it Works
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
              <img
                src="/hero-food.png"
                alt="Delicious Food at Airport"
                className="relative rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 border-8 border-white"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaMapMarkerAlt,
                title: 'Find Near Your Gate',
                desc: 'Discover restaurants closest to your boarding gate. No more long walks across terminals!'
              },
              {
                icon: FaClock,
                title: 'Pre-Order & Schedule',
                desc: 'Set your preferred time for delivery. Get your food exactly when you need it!'
              },
              {
                icon: FaShoppingBag,
                title: 'Skip the Queue',
                desc: 'Order ahead and avoid waiting in long lines. Your food will be ready when you are!'
              }
            ].map((feature, idx) => (
              <div key={idx} className="glass p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-300">
                  <feature.icon className="text-orange-500 text-2xl group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 font-display">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dishes Carousel */}
        <div className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 font-display">Popular Choices</h3>
            <DishesCarousel />
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

            <h3 className="text-3xl lg:text-4xl font-bold text-center mb-16 font-display relative z-10">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { step: '1', title: 'Select Airport', desc: 'Choose your current airport' },
                { step: '2', title: 'Enter Gate', desc: 'Tell us your boarding gate number' },
                { step: '3', title: 'Browse & Order', desc: 'Select from nearby restaurants' },
                { step: '4', title: 'Pick Up', desc: 'Skip the queue and collect your order' },
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 border border-white/20 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300 shadow-lg">
                    {item.step}
                  </div>
                  <h4 className="text-xl font-bold mb-3 font-display">{item.title}</h4>
                  <p className="text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg text-white">
                <FaPlane className="text-lg" />
              </div>
              <span className="text-xl font-bold text-gray-900 font-display">FlyEats</span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} FlyEats. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

