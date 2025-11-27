export function CardSkeleton() {
    return (
        <div className="glass p-6 rounded-2xl border border-white/50 animate-pulse">
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded-lg w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    )
}

export function MenuItemSkeleton() {
    return (
        <div className="glass p-4 rounded-xl border border-white/50 animate-pulse">
            <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0"></div>
                <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
            </div>
        </div>
    )
}

export function OutletCardSkeleton() {
    return (
        <div className="glass p-6 rounded-2xl border border-white/50 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0"></div>
                <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        </div>
    )
}
