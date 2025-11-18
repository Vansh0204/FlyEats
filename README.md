# FlyEats - Airport Food Pre-Ordering Platform

FlyEats is a fullstack web application that allows travelers to pre-order food from airport outlets and get it delivered directly to their boarding gate. Skip the queues and save time!

## Features

- 🛫 **Airport Selection**: Browse and select from available airports
- 🚪 **Gate-Based Filtering**: Find restaurants closest to your boarding gate
- 📱 **Pre-Order System**: Schedule your order for a specific time before boarding
- 🛒 **Shopping Cart**: Easy cart management with real-time updates
- 🚚 **Delivery Tracking**: Real-time delivery status updates
- 🍔 **Multiple Categories**: Filter restaurants by cuisine type
- 💳 **Order Management**: Track all your orders in one place

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM with SQLite (easily switchable to PostgreSQL)
- **Authentication**: Custom JWT-less auth (session-based)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Flyeats
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Create .env file
cp .env.example .env

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

4. (Optional) Seed sample data:
```bash
# You can add a seed script later to populate airports, outlets, and menu items
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Flyeats/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── airports/          # Airport selection and details
│   ├── outlets/           # Restaurant/outlet pages
│   ├── orders/            # Order tracking
│   ├── checkout/          # Checkout page
│   ├── login/             # Authentication
│   └── register/
├── lib/                    # Utility functions
├── prisma/                 # Database schema
└── public/                 # Static assets
```

## Key Features Implementation

### Location-Based Filtering
The app calculates distances between boarding gates and restaurants using the Haversine formula, helping users find the closest options.

### Pre-Order Scheduling
Users can set a specific time for their order to be prepared and delivered, perfect for travelers with connecting flights or specific boarding times.

### Real-Time Tracking
Delivery status is polled every 5-10 seconds to keep users informed about their order's progress.

## Database Schema

- **Users**: Customer accounts
- **Airports**: Airport information
- **Gates**: Boarding gates with coordinates
- **Outlets**: Restaurants/food outlets
- **MenuItems**: Food items per outlet
- **Orders**: Customer orders
- **OrderItems**: Individual items in orders
- **Delivery**: Delivery tracking information

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/airports` - List all airports
- `GET /api/airports/[id]` - Airport details
- `GET /api/outlets` - List outlets (with filters)
- `GET /api/outlets/[id]` - Outlet details with menu
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/[id]` - Order details
- `GET /api/delivery/[orderId]/track` - Track delivery

## Future Enhancements

- Payment gateway integration (Stripe, Razorpay)
- Push notifications for order updates
- Mobile app (React Native)
- Admin dashboard for managing outlets and orders
- Reviews and ratings
- Loyalty program
- Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

