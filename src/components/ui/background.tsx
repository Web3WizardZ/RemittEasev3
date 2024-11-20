// src/components/ui/background.tsx
export function Background() {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 32V.5H32"
                fill="none"
                stroke="rgba(0, 0, 0, 0.05)"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.05)" />
              <stop offset="50%" stopColor="rgba(0, 0, 0, 0.02)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradient)" />
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* World map pattern */}
        <div
          className="absolute inset-0 bg-[url('/world-pattern.svg')] bg-center bg-no-repeat opacity-[0.03] bg-[length:140%]"
          style={{ filter: 'blur(1px)' }}
        />
      </div>
    );
  }