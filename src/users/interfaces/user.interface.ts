export interface User {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly id: string;
  email: string;
  passwordHash: string;
  name: string;
  familyId?: string;
}

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserParams {
  email?: string;
  password?: string;
  name?: string;
  familyId?: string;
}
