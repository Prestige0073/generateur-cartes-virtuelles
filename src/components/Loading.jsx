export default function Loading({ fullscreen = true, message = 'Chargement...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-sky-400 animate-spin" />
        
        {/* Middle pulsing ring */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-r-sky-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center">
          <p className="text-slate-300 font-medium text-sm animate-pulse">
            {message}
          </p>
          <div className="flex gap-1 justify-center mt-3">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      )}
    </div>
  )

  if (!fullscreen) {
    return content
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl px-12 py-16 backdrop-blur-md shadow-2xl">
        {content}
      </div>
    </div>
  )
}
