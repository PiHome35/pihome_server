import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Family, User } from 'prisma/generated';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, passwordHash: string, name: string): Promise<User> {
    const user = await this.prisma.user.create({ data: { email, passwordHash, name } });
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async userExistsWithEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  async getUserFamily(userId: string): Promise<Family> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, familyId: { not: null } },
      include: {
        family: true,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user.family;
  }
}
