import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createJudgesAccount() {
    try {
        // Check if account already exists
        const existing = await prisma.user.findUnique({
            where: { email: 'judges@flyeats.demo' }
        })

        if (existing) {
            console.log('✅ Judges account already exists!')
            console.log('\n📧 Email: judges@flyeats.demo')
            console.log('🔑 Password: demo123')
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('demo123', 10)

        // Create judges account
        const user = await prisma.user.create({
            data: {
                email: 'judges@flyeats.demo',
                password: hashedPassword,
                name: 'Demo Judge',
                phone: '+91-9999999999',
            },
        })

        console.log('✅ Created judges account successfully!')
        console.log('\n📧 Email: judges@flyeats.demo')
        console.log('🔑 Password: demo123')
        console.log(`\n👤 User ID: ${user.id}`)
        console.log('\n🎯 Ready for demo!')
    } catch (error) {
        console.error('Error creating judges account:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createJudgesAccount()
