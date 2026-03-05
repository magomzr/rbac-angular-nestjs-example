export interface Element {
  id: string;
  name: string;
  description: string;
  createdBy: string; // user.sub del JWT
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}
