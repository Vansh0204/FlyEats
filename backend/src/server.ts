import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import airportsRoutes from './routes/airports'
import outletsRoutes from './routes/outlets'
import ordersRoutes from './routes/orders'
import deliveryRoutes from './routes/delivery'
import dishesRoutes from './routes/dishes'
import pnrRoutes from './routes/pnr'

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/airports', airportsRoutes)
app.use('/api/outlets', outletsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/delivery', deliveryRoutes)
app.use('/api/dishes', dishesRoutes)
app.use('/api/pnr', pnrRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FlyEats API is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

