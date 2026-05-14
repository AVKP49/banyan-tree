const PREFIX = 'banyan:'

export function getStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // localStorage full or unavailable
  }
}

export function removeStorage(key: string): void {
  localStorage.removeItem(`${PREFIX}${key}`)
}

export function getDeviceId(): string {
  let id = getStorage<string>('deviceId')
  if (!id) {
    id = crypto.randomUUID()
    setStorage('deviceId', id)
  }
  return id
}

export function resetAllData(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX))
  keys.forEach((k) => localStorage.removeItem(k))
}
