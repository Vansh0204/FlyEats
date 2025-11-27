import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  console.log('Seeding database...')

  // Clean up existing data
  // Clean up existing data
  await prisma.delivery.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.outlet.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.gate.deleteMany()
  await prisma.airport.deleteMany()
  await prisma.user.deleteMany()
  await prisma.outlet.deleteMany()
  await prisma.gate.deleteMany()
  await prisma.airport.deleteMany()
  await prisma.user.deleteMany()
  console.log('Cleaned up existing data')
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
      latitude: 28.5562,
      longitude: 77.1000,
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
      latitude: 19.0896,
      longitude: 72.8656,
      gates: {
        create: [
          { number: '1', terminal: 'T2', latitude: 19.0896, longitude: 72.8656 },
          { number: '15', terminal: 'T2', latitude: 19.0900, longitude: 72.8660 },
          { number: '25', terminal: 'T2', latitude: 19.0890, longitude: 72.8650 },
        ],
      },
    },
  })

  const puneAirport = await prisma.airport.upsert({
    where: { code: 'PNQ' },
    update: {},
    create: {
      name: 'Pune International Airport',
      code: 'PNQ',
      city: 'Pune',
      country: 'India',
      latitude: 18.5822,
      longitude: 73.9197,
      gates: {
        create: [
          { number: '1', terminal: 'T1', latitude: 18.5822, longitude: 73.9197 },
          { number: '2', terminal: 'T1', latitude: 18.5825, longitude: 73.9200 },
          { number: '3', terminal: 'T1', latitude: 18.5820, longitude: 73.9195 },
        ],
      },
    },
  })

  console.log('Created airports:', [delhiAirport.name, mumbaiAirport.name, puneAirport.name])

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
      image: 'https://placehold.co/600x400/orange/white?text=Starbucks',
      openTime: '05:00',
      closeTime: '23:00',
      menuItems: {
        create: [
          { name: 'Cappuccino', description: 'Rich espresso with steamed milk', price: 250, category: 'Beverage', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop' },
          { name: 'Latte', description: 'Smooth espresso with steamed milk', price: 280, category: 'Beverage', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop' },
          { name: 'Croissant', description: 'Buttery French croissant', price: 120, category: 'Pastry', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop' },
          { name: 'Sandwich', description: 'Fresh chicken sandwich', price: 350, category: 'Food', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=800&h=600&fit=crop' },
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
      image: 'https://placehold.co/600x400/red/white?text=McDonalds',
      openTime: '06:00',
      closeTime: '22:00',
      menuItems: {
        create: [
          { name: 'Big Mac', description: 'Two all-beef patties with special sauce', price: 199, category: 'Main Course', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop' },
          { name: 'McChicken', description: 'Crispy chicken burger', price: 149, category: 'Main Course', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop' },
          { name: 'French Fries', description: 'Crispy golden fries', price: 89, category: 'Sides', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop' },
          { name: 'McFlurry', description: 'Ice cream with toppings', price: 129, category: 'Dessert', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop' },
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
      image: 'https://placehold.co/600x400/red/white?text=Pizza+Hut',
      openTime: '07:00',
      closeTime: '23:00',
      menuItems: {
        create: [
          { name: 'Margherita Pizza', description: 'Classic cheese pizza', price: 399, category: 'Main Course', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop' },
          { name: 'Pepperoni Pizza', description: 'Pepperoni with cheese', price: 499, category: 'Main Course', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop' },
          { name: 'Garlic Bread', description: 'Fresh baked garlic bread', price: 179, category: 'Sides', image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9f15?w=800&h=600&fit=crop' },
          { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon', price: 449, category: 'Main Course', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop' },
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
      image: 'https://placehold.co/600x400/brown/white?text=CCD',
      openTime: '05:30',
      closeTime: '23:30',
      menuItems: {
        create: [
          { name: 'Cappuccino', description: 'Italian coffee classic', price: 180, category: 'Beverage', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop' },
          { name: 'Espresso', description: 'Strong Italian coffee', price: 150, category: 'Beverage', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=600&fit=crop' },
          { name: 'Chocolate Brownie', description: 'Rich chocolate brownie', price: 120, category: 'Dessert', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop' },
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
      image: 'https://placehold.co/600x400/green/white?text=Subway',
      openTime: '06:00',
      closeTime: '22:00',
      menuItems: {
        create: [
          { name: 'Italian BMT', description: 'Pepperoni, salami, and ham', price: 299, category: 'Main Course', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop' },
          { name: 'Veggie Delite', description: 'Fresh vegetables', price: 249, category: 'Main Course', image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&h=600&fit=crop' },
          { name: 'Cookie', description: 'Fresh baked cookie', price: 45, category: 'Dessert', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop' },
        ],
      },
    },
  })

  // Create outlets for Pune Airport
  const puneStarbucks = await prisma.outlet.create({
    data: {
      name: 'Starbucks',
      description: 'Coffee, tea, and light snacks',
      category: 'Coffee',
      terminal: 'T1',
      airportId: puneAirport.id,
      latitude: 18.5823,
      longitude: 73.9198,
      image: 'https://placehold.co/600x400/orange/white?text=Starbucks',
      openTime: '05:00',
      closeTime: '23:00',
      menuItems: {
        create: [
          { name: 'Cappuccino', description: 'Rich espresso with steamed milk', price: 250, category: 'Beverage', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop' },
          { name: 'Latte', description: 'Smooth espresso with steamed milk', price: 280, category: 'Beverage', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop' },
          { name: 'Croissant', description: 'Buttery French croissant', price: 120, category: 'Pastry', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop' },
          { name: 'Sandwich', description: 'Fresh chicken sandwich', price: 350, category: 'Food', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=800&h=600&fit=crop' },
        ],
      },
    },
  })

  const punePizzaHut = await prisma.outlet.create({
    data: {
      name: 'Pizza Hut',
      description: 'Fresh pizzas and Italian favorites',
      category: 'Italian',
      terminal: 'T1',
      airportId: puneAirport.id,
      latitude: 18.5824,
      longitude: 73.9199,
      image: 'https://placehold.co/600x400/red/white?text=Pizza+Hut',
      openTime: '07:00',
      closeTime: '23:00',
      menuItems: {
        create: [
          { name: 'Margherita Pizza', description: 'Classic cheese pizza', price: 399, category: 'Main Course', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop' },
          { name: 'Pepperoni Pizza', description: 'Pepperoni with cheese', price: 499, category: 'Main Course', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop' },
          { name: 'Garlic Bread', description: 'Fresh baked garlic bread', price: 179, category: 'Sides', image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9f15?w=800&h=600&fit=crop' },
          { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon', price: 449, category: 'Main Course', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop' },
        ],
      },
    },
  })

  const puneCafe = await prisma.outlet.create({
    data: {
      name: "Café Coffee Day",
      description: 'A lot can happen over coffee',
      category: 'Coffee',
      terminal: 'T1',
      airportId: puneAirport.id,
      latitude: 18.5825,
      longitude: 73.9200,
      image: 'https://placehold.co/600x400/brown/white?text=CCD',
      openTime: '05:30',
      closeTime: '23:30',
      menuItems: {
        create: [
          { name: 'Cappuccino', description: 'Italian coffee classic', price: 180, category: 'Beverage', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop' },
          { name: 'Espresso', description: 'Strong Italian coffee', price: 150, category: 'Beverage', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&h=600&fit=crop' },
          { name: 'Chocolate Brownie', description: 'Rich chocolate brownie', price: 120, category: 'Dessert', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop' },
          { name: 'Dal Khichdi', description: 'Comforting rice and lentil dish with ghee', price: 200, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop' },
          { name: 'Butter Paratha', description: 'Flaky layered flatbread with butter', price: 80, category: 'Main Course', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop' },
          { name: 'Poha', description: 'Flattened rice with onions, peanuts, and spices', price: 120, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop' },
        ],
      },
    },
  })

  // Add more diverse dishes to existing outlets
  await prisma.menuItem.create({
    data: { name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken and spices', price: 450, category: 'Main Course', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop', outletId: mcdonalds.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables and soy sauce', price: 320, category: 'Main Course', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop', outletId: pizzaHut.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Chicken Roll', description: 'Spiced chicken wrapped in paratha with fresh veggies', price: 180, category: 'Main Course', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop', outletId: subway.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Chicken Shawarma', description: 'Marinated chicken with tahini and fresh vegetables', price: 280, category: 'Main Course', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&h=600&fit=crop', outletId: subway.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Chocolate Ice Cream', description: 'Rich chocolate ice cream with toppings', price: 150, category: 'Dessert', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop', outletId: starbucks.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Dal Khichdi', description: 'Comforting rice and lentil dish with ghee', price: 200, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', outletId: cafeCoffeeDay.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Penne Arrabbiata', description: 'Spicy tomato pasta with herbs', price: 380, category: 'Main Course', image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop', outletId: pizzaHut.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Butter Paratha', description: 'Flaky layered flatbread with butter', price: 80, category: 'Main Course', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop', outletId: cafeCoffeeDay.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Chocolate Shake', description: 'Creamy chocolate milkshake with whipped cream', price: 200, category: 'Beverage', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&h=600&fit=crop', outletId: starbucks.id, isAvailable: true },
  }).catch(() => { })

  await prisma.menuItem.create({
    data: { name: 'Poha', description: 'Flattened rice with onions, peanuts, and spices', price: 120, category: 'Main Course', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop', outletId: cafeCoffeeDay.id, isAvailable: true },
  }).catch(() => { })

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

