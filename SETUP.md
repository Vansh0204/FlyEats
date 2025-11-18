# FlyEats Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   The `.env` file should contain:
   ```
   DATABASE_URL="file:./dev.db"
   ```

3. **Initialize Database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Create database schema
   npm run db:push
   
   # Seed sample data (optional but recommended)
   npm run db:seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Register a new account or use the test account:
     - Email: `test@example.com`
     - Password: `password123`

## Database Management

- **View Database**: Run `npm run db:studio` to open Prisma Studio
- **Reset Database**: Delete `prisma/dev.db` and run `npm run db:push` again

## Features to Test

1. **Browse Airports**: Navigate to `/airports` to see available airports
2. **Select Gate**: Choose a boarding gate to find nearby outlets
3. **Browse Menu**: Click on any outlet to see its menu
4. **Add to Cart**: Add items to cart and proceed to checkout
5. **Pre-Order**: Set a delivery time when checking out
6. **Track Order**: Monitor your order status in real-time

## Troubleshooting

- If you see "Cannot find module" errors, make sure you've run `npm install`
- If database errors occur, ensure you've run `npm run db:push`
- Clear browser cache if you see stale data

