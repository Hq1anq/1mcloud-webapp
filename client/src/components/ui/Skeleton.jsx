export default function Skeleton({ isLoading, isError = false, element, className }) {
  if (isError)
    return (
      <div className={`bg-red/20! relative overflow-hidden rounded ${className}`}>
        {/* Lớp phủ SVG vẽ đường chéo */}
        <svg
          className="text-red/20 absolute inset-0 h-full w-full" // Đổi màu tại đây
          preserveAspectRatio="none"
        >
          <line
            x1="100%"
            y1="0"
            x2="0"
            y2="100%"
            stroke="currentColor"
            strokeWidth="2" // Chỉnh độ dày của đường gạch chéo tại đây
          />
        </svg>
      </div>
    )
  if (isLoading) return <div className={`animate-pulse rounded ${className}`}></div>
  return element
}
