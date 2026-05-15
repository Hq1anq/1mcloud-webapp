import { usePopConfirm } from '../../context/PopConfirmContext'

/**
 * ControlMenuContent — pure content for the VPS action menu popup.
 *
 * Action shape:
 *  {
 *    label:     string
 *    icon:      ReactNode
 *    className: string       — color class, e.g. 'text-green'
 *    onAction:  () => void   — callback when action is executed
 *    confirm?:  { title: string }  — if present, shows a PopConfirm first
 *  }
 *
 * Props:
 *  actions  — array of action descriptors (see above)
 *  onClose  — closes the MENU popup (only called after confirmed action)
 */
export default function ControlMenuContent({ actions, onClose }) {
  const { show: showConfirm } = usePopConfirm()

  return (
    <>
      {actions.filter(Boolean).map((action) => (
        <button
          key={action.label}
          className={`group hover:bg-bg-hover flex cursor-pointer items-center rounded-md p-2 ${action.className ?? ''}`}
          onClick={(e) => {
            if (action.confirm) {
              // Anchor the confirm to THIS button row via e.currentTarget.
              // The menu stays open behind the confirm (independent contexts).
              showConfirm(e.currentTarget, {
                title: action.confirm.title,
                direction: [0, -1],
                onConfirm: () => {
                  // User said Yes → close the menu, then run the action
                  onClose()
                  action.onAction?.()
                },
                // No onCancel — usePopConfirm hides itself automatically.
                // The menu stays open, user can choose another action.
              })
            } else {
              // Non-confirm action → close menu immediately and run action
              onClose()
              action.onAction?.()
            }
          }}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </>
  )
}
