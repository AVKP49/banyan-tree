export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (import.meta.env.DEV) {
    console.log('[analytics]', name, props)
  }
}
