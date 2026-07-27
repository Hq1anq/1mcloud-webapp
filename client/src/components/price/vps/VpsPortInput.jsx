import { useState, useEffect, useCallback } from 'react'
import Checkbox from '../../ui/Checkbox.jsx'
import { useTranslation } from '../../../i18n/index.js'

export default function VpsPortInput({ osName = '', onChange }) {
  const t = useTranslation()
  const [randomPort, setRandomPort] = useState(true)
  const [portInput, setPortInput] = useState('')

  // Compute OS-dependent default port rule inside component
  const isWindow = Boolean(osName && /win/i.test(osName))
  const isUbuntuDesktop = Boolean(osName && /ubuntu desktop/i.test(osName))
  const portDefault = isWindow ? 0 : isUbuntuDesktop ? '3389' : '22'

  // Calculate payload values
  const getPortPayload = useCallback(() => {
    const random_remote_port = portDefault ? false : randomPort
    const remote_port = portDefault ? portDefault : randomPort ? undefined : portInput
    return { random_remote_port, remote_port }
  }, [portDefault, randomPort, portInput])

  // Notify parent of payload updates whenever port state or osName changes
  useEffect(() => {
    if (onChange) {
      onChange(getPortPayload())
    }
  }, [getPortPayload, onChange])

  return (
    <label className={`space-y-2 ${portDefault ? 'text-text-muted cursor-not-allowed' : ''}`}>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={portDefault ? false : randomPort}
          disabled={Boolean(portDefault)}
          onChange={(e) => setRandomPort(e.target.checked)}
        />
        <span className="font-medium">{t('buyVps.randomPort')}</span>
      </div>
      {(portDefault || !randomPort) && (
        <div className="flex flex-col gap-1 text-lg">
          <input
            type="number"
            value={portDefault ? portDefault : portInput}
            disabled={Boolean(portDefault)}
            onChange={(e) => setPortInput(e.target.value)}
          />
        </div>
      )}
    </label>
  )
}
