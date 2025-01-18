import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Family, User } from 'prisma/generated';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, password: string, name: string): Promise<User> {
    if (await this.userExistsWithEmail(email)) {
      throw new BadRequestException('User with this email already exists');
    }
    const user = await this.prisma.user.create({ data: { email, passwordHash: await argon2.hash(password), name } });
    return user;
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserFamily(userId: string): Promise<Family> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        family: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.family) {
      throw new NotFoundException('User is not in a family');
    }
    return user.family;
  }

  async updateUser(userId: string, name?: string, email?: string, password?: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        passwordHash: password ? await argon2.hash(password) : undefined,
      },
    });
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { ownedFamily: true } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.ownedFamily) {
      throw new BadRequestException('User owns a family');
    }
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async userExistsWithEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  async joinFamily(userId: string, code: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const family = await this.prisma.family.findUnique({ where: { inviteCode: code } });
    if (!family) {
      throw new NotFoundException('Invalid invite code');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { familyId: family.id } });
    return family.id;
  }

  async leaveFamily(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.familyId) {
      throw new BadRequestException('User is not in a family');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { familyId: null } });
  }
}
