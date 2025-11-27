import { useState, useEffect } from 'react'
import { FaRobot, FaSpinner } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

interface AIRecommendationsProps {
    outletId: string
}

export default function AIRecommendations({ outletId }: AIRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<string[]>([])
    const [reasoning, setReasoning] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRecommendations()
    }, [outletId])

    const fetchRecommendations = async () => {
        try {
            setLoading(true)
            const response = await apiFetch('/api/ai/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outletId }),
            })

            if (response.ok) {
                const data = await response.json()
                setRecommendations(data.recommendations || [])
                setReasoning(data.reasoning || '')
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="glass p-6 rounded-2xl mb-8 border border-white/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                        <FaRobot className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 font-display">AI Recommendations</h3>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                    <FaSpinner className="animate-spin" />
                    <span>Getting personalized recommendations...</span>
                </div>
            </div>
        )
    }

    if (recommendations.length === 0) {
        return null
    }

    return (
        <div className="glass p-6 rounded-2xl mb-8 border border-white/50 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                    <FaRobot className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display">AI Recommendations for You</h3>
            </div>

            <p className="text-gray-600 mb-4 text-sm italic">
                ✨ {reasoning}
            </p>

            <div className="flex flex-wrap gap-2">
                {recommendations.map((item, index) => (
                    <div
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-full text-purple-700 font-medium text-sm hover:shadow-md transition-shadow"
                    >
                        {item}
                    </div>
                ))}
            </div>
        </div>
    )
}
