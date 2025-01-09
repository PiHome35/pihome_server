export interface Family {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly id: string;
  name: string;
  ownerUserId: string;
  userIds: string[];
  deviceIds: string[];
}

export interface CreateFamilyParams {
  name: string;
  ownerUserId: string;
}

export interface UpdateFamilyParams {
  name?: string;
  ownerUserId?: string;
  userIds?: string[];
  deviceIds?: string[];
}
