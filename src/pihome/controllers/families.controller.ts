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
import { ApiBody, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FamiliesService } from '../services/families.service';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../services/users.service';
import { CreateFamilyRequestDto, CreateFamilyResponseDto } from '../dto/family/create-family.dto';
import { GetFamilyResponseDto } from '../dto/family/get-family.dto';
import { UpdateFamilyRequestDto, UpdateFamilyResponseDto } from '../dto/family/update-family.dto';
import { ListFamilyUsersResponseDto } from '../dto/family/list-family-users.dto';
import { UserResponseDto } from '../dto/user.dto';
import { CreateFamilyInviteCodeResponseDto } from '../dto/family/create-family-invite-code.dto';

@ApiTags('Families')
@Controller('me/family')
export class FamiliesController {
  constructor(
    private familiesService: FamiliesService,
    private usersService: UsersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a family' })
  @ApiBody({ type: CreateFamilyRequestDto })
  @ApiOkResponse({ type: CreateFamilyResponseDto })
  async createFamily(@Req() req: any, @Body() body: CreateFamilyRequestDto): Promise<CreateFamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.familiesService.createFamily(body.name, currentUser.sub);
    return plainToInstance(CreateFamilyResponseDto, family);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user family' })
  @ApiOkResponse({ type: GetFamilyResponseDto })
  async getFamily(@Req() req: any): Promise<GetFamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    return plainToInstance(GetFamilyResponseDto, family);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user family' })
  @ApiBody({ type: UpdateFamilyRequestDto })
  @ApiOkResponse({ type: UpdateFamilyResponseDto })
  async updateFamily(@Req() req: any, @Body() body: UpdateFamilyRequestDto): Promise<UpdateFamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.getUserFamily(currentUser.sub);
    const updatedFamily = await this.familiesService.updateFamily(family.id, body.name, body.chatModel);
    return plainToInstance(UpdateFamilyResponseDto, updatedFamily);
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
    const users = plainToInstance(UserResponseDto, await this.familiesService.listFamilyUsers(family.id));
    return plainToInstance(ListFamilyUsersResponseDto, { users });
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
    return plainToInstance(UserResponseDto, user);
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
    const inviteCode = await this.familiesService.createFamilyInviteCode(family.id);
    return plainToInstance(CreateFamilyInviteCodeResponseDto, { code: inviteCode });
  }

  @Delete('invite-code')
  @ApiOperation({ summary: 'Delete a family invite code' })
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
