import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FamiliesService } from 'src/families/families.service';
import { CreateFamilyRequestDto, CreateFamilyResponseDto } from './dto/create-family.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PihomeService {
  constructor(
    private readonly familiesService: FamiliesService,
    private readonly usersService: UsersService,
  ) {}

  async createFamily(userId: string, createFamilyDto: CreateFamilyRequestDto): Promise<CreateFamilyResponseDto> {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.familyId) {
      throw new BadRequestException('User already has a family');
    }

    const family = await this.familiesService.create({
      name: createFamilyDto.name,
      ownerUserId: user.id,
    });

    await this.usersService.updateById(userId, { familyId: family.id });

    return { id: family.id };
  }
}
