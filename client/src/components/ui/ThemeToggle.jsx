import { motion as m } from 'motion/react'
import useThemeStore from '../../store/useThemeStore'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  const raysVariants = {
    visible: {
      strokeOpacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
    hidden: {
      strokeOpacity: 0,
    },
  }

  const rayVariant = {
    visible: {
      pathLength: 1,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        // Customize timing for each property
        pathLength: { duration: 0.3 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      },
    },
    hidden: {
      pathLength: 0,
      opacity: 0,
      scale: 0,
    },
  }

  const shineVariant = {
    visible: {
      opacity: [0, 1, 0],
      strokeDashoffset: [0, -50, -100],
      // No CSS filter here — Safari does not support filter on SVG child elements.
      // Blur is applied via a native SVG <feGaussianBlur> filter attribute instead.
      transition: {
        duration: 0.75,
        ease: 'linear',
      },
    },
    hidden: {
      opacity: 0,
      scale: 2,
      strokeDasharray: '30, 1000',
      strokeDashoffset: 0,
    },
  }

  const sunPath =
    'M48.5 67.5C58.9934 67.5 67.5 58.9934 67.5 48.5C67.5 38.0066 58.9934 29.5 48.5 29.5C38.0066 29.5 29.5 38.0066 29.5 48.5C29.5 58.9934 38.0066 67.5 48.5 67.5Z'
  const moonPath =
    'M48.5 67.5C58.9934 67.5 67.5 58.9934 67.5 48.5C49.4492 54.786 42.3163 45.0026 48.5 29.5C38.0066 29.5 29.5 38.0066 29.5 48.5C29.5 58.9934 38.0066 67.5 48.5 67.5Z'

  return (
    <button onClick={toggleTheme} className="flex size-8 items-center justify-center md:size-10">
      <m.svg
        viewBox="0 0 97 97"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        strokeWidth="4"
        strokeLinecap="round"
        className="relative size-8 md:size-10"
      >
        {/* SVG-native blur filter — works in Safari unlike CSS filter on child elements */}
        <defs>
          <filter id="moonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Moon shine overlay — blur via SVG filter attribute, not CSS filter */}
        <m.path
          variants={shineVariant}
          d={moonPath}
          className="stroke-blue-100"
          filter="url(#moonGlow)"
          initial="hidden"
          animate={isDark ? 'visible' : 'hidden'}
        />

        <m.g
          variants={raysVariants}
          initial="hidden"
          animate={isDark ? 'hidden' : 'visible'}
          className="stroke-yellow-600 stroke-6"
          style={{ strokeLinecap: 'round' }}
        >
          <m.path variants={rayVariant} d="M48 12V3" />
          <m.path variants={rayVariant} d="M73 23L80 16" />
          <m.path variants={rayVariant} d="M84 48H93" />
          <m.path variants={rayVariant} d="M73 73L80 80" />
          <m.path variants={rayVariant} d="M48 84V93" />
          <m.path variants={rayVariant} d="M23 73L16 80" />
          <m.path variants={rayVariant} d="M12 48H3" />
          <m.path variants={rayVariant} d="M23 23L16 16" />
        </m.g>

        <m.path
          d={sunPath}
          fill="transparent"
          transition={{ duration: 1, type: 'spring' }}
          initial={{ fillOpacity: 0, strokeOpacity: 0 }}
          animate={
            isDark
              ? {
                  d: moonPath,
                  rotate: -360,
                  scale: 2,
                  stroke: 'var(--color-blue-400)',
                  fill: 'var(--color-blue-400)',
                  fillOpacity: 0.35,
                  strokeOpacity: 1,
                  transition: { delay: 0.1 },
                }
              : {
                  d: sunPath,
                  rotate: 0,
                  stroke: 'var(--color-yellow-600)',
                  fill: 'var(--color-yellow-600)',
                  fillOpacity: 0.35,
                  strokeOpacity: 1,
                }
          }
        />
      </m.svg>
    </button>
  )
}
