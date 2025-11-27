import { useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
    message: string
    type: ToastType
    onClose: () => void
    duration?: number
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const icons = {
        success: <FaCheckCircle className="text-green-500" />,
        error: <FaExclamationCircle className="text-red-500" />,
        info: <FaInfoCircle className="text-blue-500" />,
        warning: <FaExclamationCircle className="text-yellow-500" />,
    }

    const backgrounds = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200',
        warning: 'bg-yellow-50 border-yellow-200',
    }

    const textColors = {
        success: 'text-green-800',
        error: 'text-red-800',
        info: 'text-blue-800',
        warning: 'text-yellow-800',
    }

    return (
        <div className={`${backgrounds[type]} border rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in-right`}>
            <div className="text-xl">{icons[type]}</div>
            <p className={`${textColors[type]} flex-1 font-medium text-sm`}>{message}</p>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <FaTimes />
            </button>
        </div>
    )
}
