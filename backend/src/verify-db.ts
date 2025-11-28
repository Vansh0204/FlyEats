
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const outlets = await prisma.outlet.findMany({
        include: {
            airport: true
        }
    })

    console.log('Total outlets:', outlets.length)
    outlets.forEach(o => {
        console.log(`- ${o.name} (${o.airport.code} ${o.terminal}) - Image: ${o.image}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
