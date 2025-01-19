import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FamiliesService } from '../services/families.service';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../services/users.service';
import { CreateFamilyRequestDto } from '../dto/family/create-family.dto';
import { UpdateFamilyRequestDto } from '../dto/family/update-family.dto';
import { ListFamilyUsersResponseDto } from '../dto/family/list-family-users.dto';
import { UserResponseDto } from '../dto/user.dto';
import { CreateFamilyInviteCodeResponseDto } from '../dto/family/create-family-invite-code.dto';
import { FamilyResponseDto } from '../dto/family.dto';

@ApiTags('Families')
@Controller('me/family')
export class FamiliesController {
  constructor(
    private familiesService: FamiliesService,
    private usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a family' })
  @ApiCreatedResponse({ type: FamilyResponseDto })
  async createFamily(@Req() req: any, @Body() body: CreateFamilyRequestDto): Promise<FamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.familiesService.createFamily(body.name, currentUser.sub);
    return new FamilyResponseDto(family);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user family' })
  @ApiOkResponse({ type: FamilyResponseDto })
  async getFamily(@Req() req: any): Promise<FamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    return new FamilyResponseDto(family);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user family' })
  @ApiOkResponse({ type: FamilyResponseDto })
  async updateFamily(@Req() req: any, @Body() body: UpdateFamilyRequestDto): Promise<FamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const updatedFamily = await this.familiesService.updateFamily(family.id, body.name, body.chatModelKey);
    return new FamilyResponseDto(updatedFamily);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete current user family' })
  @ApiNoContentResponse()
  async deleteFamily(@Req() req: any): Promise<void> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    if (family.ownerId !== currentUser.sub) {
      throw new ForbiddenException('Current user is not the owner of the family');
    }
    await this.familiesService.deleteFamily(family.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users in current user family' })
  @ApiOkResponse({ type: ListFamilyUsersResponseDto })
  async listFamilyUsers(@Req() req: any): Promise<ListFamilyUsersResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const users = await this.familiesService.listFamilyUsers(family.id);
    return new ListFamilyUsersResponseDto({ users });
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get a user in current user family' })
  @ApiOkResponse({ type: UserResponseDto })
  async getFamilyUser(@Req() req: any, @Param('userId') userId: string): Promise<UserResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const user = await this.usersService.getUser(userId);
    if (user.familyId !== family.id) {
      throw new NotFoundException('User not found');
    }
    return new UserResponseDto(user);
  }

  @Post('invite-code')
  @ApiOperation({ summary: 'Create family invite code' })
  @ApiOkResponse({ type: CreateFamilyInviteCodeResponseDto })
  async createFamilyInviteCode(@Req() req: any): Promise<CreateFamilyInviteCodeResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    if (family.ownerId !== currentUser.sub) {
      throw new ForbiddenException('Current user is not the owner of the family');
    }
    const code = await this.familiesService.createFamilyInviteCode(family.id);
    return new CreateFamilyInviteCodeResponseDto({ code });
  }

  @Delete('invite-code')
  @ApiOperation({ summary: 'Delete family invite code' })
  @ApiNoContentResponse()
  async deleteFamilyInviteCode(@Req() req: any): Promise<void> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    if (family.ownerId !== currentUser.sub) {
      throw new ForbiddenException('Current user is not the owner of the family');
    }
    await this.familiesService.deleteFamilyInviteCode(family.id);
  }
}
