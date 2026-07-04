export default function ToggleButton({ isOn, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative h-7 w-14 shrink-0 overflow-hidden rounded-full bg-black/40 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] transition-transform outline-none active:scale-95"
    >
      <div
        className={`absolute inset-0 transition-colors duration-500 ${isOn ? 'bg-highlight' : 'bg-white/20'}`}
      />
      <div
        className={`elastic-out absolute top-1 left-1 z-10 size-5 rounded-full bg-white shadow-md transition-all duration-400 group-active:w-8 ${
          isOn ? 'translate-x-7 group-active:translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
