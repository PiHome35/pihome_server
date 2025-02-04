export interface Note {
  _id?: string;
  content: string;
  tags: string[];
  category?: string;
  userId: string;
  userName: string;
  familyId: string;
  familyName: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
