import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      phone: '+1234567890',
    },
  })
  console.log('Created user:', user.email)

  // Create airports
  const delhiAirport = await prisma.airport.upsert({
    where: { code: 'DEL' },
    update: {},
    create: {
      name: 'Indira Gandhi International Airport',
      code: 'DEL',
      city: 'New Delhi',
      country: 'India',
      gates: {
        create: [
          { number: 'A1', terminal: 'T3', latitude: 28.5562, longitude: 77.1000 },
          { number: 'A12', terminal: 'T3', latitude: 28.5565, longitude: 77.1005 },
          { number: 'B5', terminal: 'T3', latitude: 28.5558, longitude: 77.0995 },
          { number: 'C8', terminal: 'T3', latitude: 28.5568, longitude: 77.1010 },
        ],
      },
    },
  })

  const mumbaiAirport = await prisma.airport.upsert({
    where: { code: 'BOM' },
    update: {},
    create: {
      name: 'Chhatrapati Shivaji Maharaj International Airport',
      code: 'BOM',
      city: 'Mumbai',
      country: 'India',
      gates: {
        create: [
          { number: '1', terminal: 'T2', latitude: 19.0896, longitude: 72.8656 },
          { number: '15', terminal: 'T2', latitude: 19.0900, longitude: 72.8660 },
          { number: '25', terminal: 'T2', latitude: 19.0890, longitude: 72.8650 },
        ],
      },
    },
  })

  console.log('Created airports:', [delhiAirport.name, mumbaiAirport.name])

  // Create outlets for Delhi Airport
  const starbucks = await prisma.outlet.create({
    data: {
      name: 'Starbucks',
      description: 'Coffee, tea, and light snacks',
      category: 'Coffee',
      terminal: 'T3',
      airportId: delhiAirport.id,
      latitude: 28.5563,
      longitude: 77.1002,
      openTime: '05:00',
      closeTime: '23:00',
      menuItems: {
        create: [
          { name: 'Cappuccino', description: 'Rich espresso with steamed milk', price: 250, category: 'Beverage' },
          { name: 'Latte', description: 'Smooth espresso with steamed milk', price: 280, category: 'Beverage' },
          { name: 'Croissant', description: 'Buttery French croissant', price: 120, category: 'Pastry' },
          { name: 'Sandwich', description: 'Fresh chicken sandwich', price: 350, category: 'Food' },
        ],
      },
    },
  })

  const mcdonalds = await prisma.outlet.create({
    data: {
      name: "McDonald's",
      description: 'Fast food favorites',
      category: 'Fast Food',
      terminal: 'T3',
      airportId: delhiAirport.id,
      latitude: 28.5566,
      longitude: 77.1006,
      openTime: '06:00',
      closeTime: '22:00',
      menuItems: {
        create: [
          { name: 'Big Mac', description: 'Two all-beef patties with special sauce', price: 199, category: 'Main Course' },
          { name: 'McChicken', description: 'Crispy chicken burger', price: 149, category: 'Main Course' },
          { name: 'French Fries', description: 'Crispy golden fries', price: 89, category: 'Sides' },
          { name: 'McFlurry', description: 'Ice cream with toppings', price: 129, category: 'Dessert' },
        ],
      },
    },
  })

  const pizzaHut = await prisma.outlet.create({
    data: {
      name: 'Pizza Hut',
      description: 'Fresh pizzas and Italian favorites',
      category: 'Italian',
      terminal: 'T3',
      airportId: delhiAirport.id,
      latitude: 28.5559,
      longitude: 77.0996,
      openTime: '07:00',
      closeTime: '23:00',
      menuItems: {
        create: [
          { name: 'Margherita Pizza', description: 'Classic cheese pizza', price: 399, category: 'Main Course' },
          { name: 'Pepperoni Pizza', description: 'Pepperoni with cheese', price: 499, category: 'Main Course' },
          { name: 'Garlic Bread', description: 'Fresh baked garlic bread', price: 179, category: 'Sides' },
          { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon', price: 449, category: 'Main Course' },
        ],
      },
    },
  })

  // Create outlets for Mumbai Airport
  const cafeCoffeeDay = await prisma.outlet.create({
    data: {
      name: "Café Coffee Day",
      description: 'A lot can happen over coffee',
      category: 'Coffee',
      terminal: 'T2',
      airportId: mumbaiAirport.id,
      latitude: 19.0897,
      longitude: 72.8657,
      openTime: '05:30',
      closeTime: '23:30',
      menuItems: {
        create: [
          { name: 'Cappuccino', description: 'Italian coffee classic', price: 180, category: 'Beverage' },
          { name: 'Espresso', description: 'Strong Italian coffee', price: 150, category: 'Beverage' },
          { name: 'Chocolate Brownie', description: 'Rich chocolate brownie', price: 120, category: 'Dessert' },
        ],
      },
    },
  })

  const subway = await prisma.outlet.create({
    data: {
      name: 'Subway',
      description: 'Eat fresh',
      category: 'Fast Food',
      terminal: 'T2',
      airportId: mumbaiAirport.id,
      latitude: 19.0901,
      longitude: 72.8661,
      openTime: '06:00',
      closeTime: '22:00',
      menuItems: {
        create: [
          { name: 'Italian BMT', description: 'Pepperoni, salami, and ham', price: 299, category: 'Main Course' },
          { name: 'Veggie Delite', description: 'Fresh vegetables', price: 249, category: 'Main Course' },
          { name: 'Cookie', description: 'Fresh baked cookie', price: 45, category: 'Dessert' },
        ],
      },
    },
  })

  console.log('Created outlets:', [starbucks.name, mcdonalds.name, pizzaHut.name, cafeCoffeeDay.name, subway.name])
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

