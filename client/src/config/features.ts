export const FEATURE_FLAGS = {
  // Flag to toggle super-user detail view across management tables
  SUPER_USER_DETAIL_VIEW: false,
} as const

export function canAccessDetailView(): boolean {
  return FEATURE_FLAGS.SUPER_USER_DETAIL_VIEW
}

