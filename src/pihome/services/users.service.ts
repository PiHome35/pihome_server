import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Family, User } from 'prisma/generated';
import { UserWithFamily } from '../interfaces/user.interface';
import { UpdateUserRequestDto } from '../dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, passwordHash: string, name: string): Promise<User> {
    const user = await this.prisma.user.create({ data: { email, passwordHash, name } });
    return user;
  }

  async deleteUser(userId: string): Promise<User> {
    const user = await this.prisma.user.delete({ where: { id: userId }, include: { ownedFamily: true } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.ownedFamily) {
      throw new BadRequestException('User owns a family');
    }
    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserRequestDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateUserDto.name,
        email: updateUserDto.email,
        passwordHash: updateUserDto.password ? await argon2.hash(updateUserDto.password) : undefined,
      },
    });
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
      throw new NotFoundException('User not found');
    }
    return user.family;
  }

  async getUserWithFamily(userId: string): Promise<UserWithFamily> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        family: true,
      },
    });
    return user;
  }

  async joinFamily(userId: string, code: string): Promise<string> {
    const family = await this.prisma.family.findUnique({ where: { inviteCode: code } });
    if (!family) {
      throw new NotFoundException('Invalid invite code');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { familyId: family.id } });
    return family.id;
  }
}
