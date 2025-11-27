import { GoogleGenerativeAI } from '@google/generative-ai'

function getModel() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

interface MenuItem {
    id: string
    name: string
    description: string | null
    price: number
    category: string | null
}

interface RecommendationContext {
    menuItems: MenuItem[]
    userPreferences?: string[]
    dietaryRestrictions?: string[]
    boardingTime?: string
    currentTime?: string
}

export async function getAIRecommendations(context: RecommendationContext): Promise<{
    recommendations: string[]
    reasoning: string
}> {
    const { menuItems, userPreferences, dietaryRestrictions, boardingTime, currentTime } = context

    const menuList = menuItems.map(item =>
        `- ${item.name} (${item.category}): ${item.description} - ₹${item.price}`
    ).join('\n')

    const prompt = `You are a helpful food recommendation assistant for an airport food ordering app called FlyEats.

Available Menu Items:
${menuList}

User Context:
${userPreferences ? `- Preferences: ${userPreferences.join(', ')}` : ''}
${dietaryRestrictions ? `- Dietary Restrictions: ${dietaryRestrictions.join(', ')}` : ''}
${boardingTime ? `- Boarding Time: ${boardingTime}` : ''}
${currentTime ? `- Current Time: ${currentTime}` : ''}

Please recommend 3-4 menu items from the list above that would be perfect for this user. Consider:
1. Their preferences and dietary restrictions
2. Time until boarding (quick items if boarding soon)
3. Good variety and balance
4. Popular airport food choices

Respond in this exact JSON format:
{
  "recommendations": ["item name 1", "item name 2", "item name 3"],
  "reasoning": "Brief explanation of why these items were chosen (1-2 sentences)"
}

Only recommend items that are in the menu list above.`

    try {
        const model = getModel()
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0])
            return parsed
        }

        // Fallback if parsing fails
        return {
            recommendations: menuItems.slice(0, 3).map(item => item.name),
            reasoning: "Here are some popular choices from the menu."
        }
    } catch (error) {
        console.error('AI Recommendation Error:', error)
        // Fallback recommendations
        return {
            recommendations: menuItems.slice(0, 3).map(item => item.name),
            reasoning: "Here are some popular choices from the menu."
        }
    }
}

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export async function chatWithAI(
    message: string,
    context: {
        menuItems?: MenuItem[]
        userCart?: any[]
        history?: ChatMessage[]
    }
): Promise<string> {
    const { menuItems, userCart, history } = context

    let contextInfo = 'You are a helpful AI assistant for FlyEats, an airport food pre-ordering app.\n\n'

    if (menuItems && menuItems.length > 0) {
        contextInfo += 'Available menu items:\n'
        contextInfo += menuItems.map(item =>
            `- ${item.name}: ${item.description} (₹${item.price})`
        ).join('\n')
        contextInfo += '\n\n'
    }

    if (userCart && userCart.length > 0) {
        contextInfo += 'User\'s current cart:\n'
        contextInfo += userCart.map(item => `- ${item.name} x${item.quantity}`).join('\n')
        contextInfo += '\n\n'
    }

    contextInfo += `User question: ${message}\n\n`
    contextInfo += 'Please provide a helpful, concise response (2-3 sentences max). Be friendly and focus on helping them order food.'

    try {
        const model = getModel()
        const result = await model.generateContent(contextInfo)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('AI Chat Error:', error)
        return "I'm having trouble connecting right now. Please try asking your question again!"
    }
}
