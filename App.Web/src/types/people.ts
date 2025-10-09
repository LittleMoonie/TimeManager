export type PersonStatus = 'Active' | 'On leave' | 'Inactive';

export interface Person {
  id: string;
  name: string;
  role: string;
  team: string;
  status: PersonStatus;
  initials: string;
}
