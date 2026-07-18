import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion'

/**
 * Smoothly animates numeric values with ping-pong waiting behavior & instant fetch completion.
 *
 * Behavior:
 *   1. While waiting for data/fetch (target is 0, empty, or equal to middle):
 *      - Runs a ping-pong animation endlessly between highVal and lowVal.
 *   2. When data/fetch completes (target becomes a real final price):
 *      - Stops ping-pong animation immediately.
 *      - Snaps directly to final target value in 1 tick (no count-up animation).
 *   3. Normal updates (between real non-placeholder prices):
 *      - Animates smoothly from current value to target.
 *
 * @param {number}  target                   The target number to count toward.
 * @param {object}  [options]
 * @param {number}  [options.middle=0]       The middle/placeholder target while waiting for fetch.
 * @param {number}  [options.duration=0.65]  Animation duration in seconds per direction.
 * @param {string}  [options.easing='easeInOut'] Motion easing preset.
 * @returns {number} Current animated value (float – round before display).
 */
export function useCountUp(target, { duration = 0.65, easing = 'easeInOut', middle = 0 } = {}) {
  const [current, setCurrent] = useState(target)
  const currentRef = useRef(target) // live displayed float value
  const stopRef = useRef(null)
  const wasWaitingRef = useRef(false) // persistent flag across effect cleanup

  useEffect(() => {
    // Waiting state: target is 0, null, undefined, or matches middle
    const isWaitingState = target === 0 || target === middle || target == null

    // 1. Fetch completed while ping-ponging (previous state was waiting, new target is real price)
    if (wasWaitingRef.current && !isWaitingState) {
      // console.log(
      //   `[CountUp Fetch Done] Halted ping-pong at: ${Math.round(currentRef.current)} -> Snapping directly to target: ${target}`
      // )
      stopRef.current?.()
      stopRef.current = null
      wasWaitingRef.current = false
      currentRef.current = target
      setCurrent(target)
      return
    }

    // 2. Waiting state: start ping-pong loop highVal <-> lowVal
    if (isWaitingState) {
      const from = currentRef.current
      const targetMiddle = middle > 0 ? middle : 0

      // High and low bounds for the ping-pong loop
      const lowVal = targetMiddle
      const highVal = from !== targetMiddle ? from : targetMiddle + 50000

      // console.log(
      //   `[CountUp Waiting] Starting infinite ping-pong [${Math.round(highVal)} <-> ${Math.round(lowVal)}]`
      // )
      stopRef.current?.()
      wasWaitingRef.current = true

      const { stop } = animate(highVal, lowVal, {
        duration,
        easing,
        repeat: Infinity,
        direction: 'alternate',
        onUpdate: (v) => {
          currentRef.current = v
          setCurrent(v)
          // console.log(`[CountUp PingPong Tick] ${Math.round(v)}`)
        },
      })

      stopRef.current = stop

      return () => {
        stop()
      }
    }

    // 3. Target same as current value: snap
    if (currentRef.current === target) {
      setCurrent(target)
      currentRef.current = target
      return
    }

    // 4. Normal animation between two real prices
    const from = currentRef.current
    // console.log(`[CountUp Start] Animating from ${Math.round(from)} -> ${target}`)
    stopRef.current?.()
    wasWaitingRef.current = false

    const { stop } = animate(from, target, {
      duration,
      easing,
      onUpdate: (v) => {
        currentRef.current = v
        setCurrent(v)
        // console.log(`[CountUp Tick] ${Math.round(v)}`)
      },
      onComplete: () => {
        // console.log(`[CountUp Complete] Reached target: ${target}`)
      },
    })

    stopRef.current = stop

    return () => {
      stop()
    }
  }, [target, duration, easing, middle])

  return current
}
