import express from 'express'
// Restart server for DB change
import cors from 'cors'
import authRoutes from './routes/auth'
import airportsRoutes from './routes/airports'
import outletsRoutes from './routes/outlets'
import ordersRoutes from './routes/orders'
import deliveryRoutes from './routes/delivery'
import dishesRoutes from './routes/dishes'
import pnrRoutes from './routes/pnr'
import aiRoutes from './routes/ai'

const app = express()
const PORT = process.env.PORT || 5001

// Configure CORS to allow production domain and optional env-defined origins
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://fly-eats.vercel.app'
]
const allowedOrigins = (process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : defaultAllowedOrigins)

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser requests without Origin and any configured origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/airports', airportsRoutes)
app.use('/api/outlets', outletsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/dishes', dishesRoutes)
app.use('/api/pnr', pnrRoutes)
app.use('/api/ai', aiRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FlyEats API is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
