export default function Skeleton({ isLoading, element, className }) {
  if (isLoading) return <div className={`animate-pulse rounded ${className}`}></div>
  return element
}
