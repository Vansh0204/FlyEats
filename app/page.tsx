import Link from 'next/link'
import { FaPlane, FaClock, FaMapMarkerAlt, FaShoppingBag } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaPlane className="text-orange-500 text-2xl" />
            <h1 className="text-2xl font-bold text-orange-600">FlyEats</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-orange-600">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Order Food Before You Board
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Skip the queues and get delicious meals delivered directly to your boarding gate. 
            Pre-order from airport outlets and save precious time!
          </p>
          <Link 
            href="/airports" 
            className="inline-block px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FaMapMarkerAlt className="text-orange-500 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">Find Near Your Gate</h3>
            <p className="text-gray-600 text-center">
              Discover restaurants closest to your boarding gate. No more long walks across terminals!
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FaClock className="text-orange-500 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">Pre-Order & Schedule</h3>
            <p className="text-gray-600 text-center">
              Set your preferred time for delivery. Get your food exactly when you need it!
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <FaShoppingBag className="text-orange-500 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-3">Skip the Queue</h3>
            <p className="text-gray-600 text-center">
              Order ahead and avoid waiting in long lines. Your food will be ready when you are!
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 bg-white rounded-xl shadow-lg p-12">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Select Airport', desc: 'Choose your current airport' },
              { step: '2', title: 'Enter Gate', desc: 'Tell us your boarding gate number' },
              { step: '3', title: 'Browse & Order', desc: 'Select from nearby restaurants' },
              { step: '4', title: 'Get Delivered', desc: 'Receive at your gate on time' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 FlyEats. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

