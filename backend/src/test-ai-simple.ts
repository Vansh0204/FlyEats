import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyDbh-UZexIw9uVivYafJk_rMoHw3GfCB60'
const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

async function run() {
    try {
        const result = await model.generateContent('Hello')
        console.log(result.response.text())
    } catch (e) {
        console.error(e)
    }
}

run()
