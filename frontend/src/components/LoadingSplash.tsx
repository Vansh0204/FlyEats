import { useEffect, useState } from 'react'
import { FaPlane } from 'react-icons/fa'

interface LoadingSplashProps {
    onLoadingComplete: () => void
}

export default function LoadingSplash({ onLoadingComplete }: LoadingSplashProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setTimeout(onLoadingComplete, 300) // Small delay before transitioning
                    return 100
                }
                return prev + 2
            })
        }, 30)

        return () => clearInterval(interval)
    }, [onLoadingComplete])

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-[10000]">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 text-center">
                {/* Logo */}
                <div className="mb-8 animate-float">
                    <div className="inline-block bg-orange-500 p-8 rounded-3xl shadow-2xl">
                        <FaPlane className="text-white text-6xl transform -rotate-45" />
                    </div>
                </div>

                {/* Brand name */}
                <h1 className="text-6xl font-bold text-white mb-4 font-display animate-fade-in">
                    Fly<span className="text-orange-400">Eats</span>
                </h1>
                <p className="text-white/90 text-xl mb-8 animate-fade-in">
                    Pre-order food at airports
                </p>

                {/* Progress bar */}
                <div className="w-64 mx-auto">
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-lg"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-white/70 text-sm mt-3 font-medium">{Math.round(progress)}%</p>
                </div>
            </div>
        </div>
    )
}
