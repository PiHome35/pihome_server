import { Family } from 'prisma/generated';
import { User } from 'prisma/generated';

export interface UserWithFamily extends User {
  family: Family;
}
