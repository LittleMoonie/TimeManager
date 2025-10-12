export type PersonStatus = 'Active' | 'On leave' | 'Inactive'

export interface Person {
  id: string
  name: string
  role: string
  team: string
  status: PersonStatus
  initials: string
}

export interface ActiveSession {
  id: string
  name: string
  location: string
  current: boolean
  deviceType: 'desktop' | 'mobile' | 'tablet'
}

export interface RecognizedDevice {
  id: string
  name: string
  location: string
  lastActive: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
}
