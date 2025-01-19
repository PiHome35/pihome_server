import { Body, Controller, Delete, Get, Post, Put, Req } from '@nestjs/common';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { plainToInstance } from 'class-transformer';
import { UpdateUserRequestDto } from '../dto/user/update-user.dto';
import { JoinFamilyRequestDto } from '../dto/user/join-family.dto';
import { UserResponseDto } from '../dto/user.dto';
import { FamilyResponseDto } from '../dto/family.dto';

@ApiTags('Users')
@Controller('me')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: UserResponseDto })
  async getUser(@Req() req: any): Promise<UserResponseDto> {
    const currentUser = req.user as ClientContext;
    const user = await this.usersService.getUser(currentUser.sub);
    return plainToInstance(UserResponseDto, user);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user' })
  @ApiOkResponse({ type: UserResponseDto })
  async updateUser(@Req() req: any, @Body() body: UpdateUserRequestDto): Promise<UserResponseDto> {
    const currentUser = req.user as ClientContext;
    const user = await this.usersService.updateUser(currentUser.sub, body.name, body.email, body.password);
    return plainToInstance(UserResponseDto, user);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete current user' })
  @ApiNoContentResponse()
  async deleteUser(@Req() req: any): Promise<void> {
    const currentUser = req.user as ClientContext;
    await this.usersService.deleteUser(currentUser.sub);
  }

  @Post('join-family')
  @ApiOperation({ summary: 'Join a family' })
  @ApiOkResponse({ type: FamilyResponseDto })
  async joinFamily(@Req() req: any, @Body() body: JoinFamilyRequestDto): Promise<FamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.joinFamily(currentUser.sub, body.code);
    return plainToInstance(FamilyResponseDto, family);
  }

  @Post('leave-family')
  @ApiOperation({ summary: 'Leave current family' })
  @ApiNoContentResponse()
  async leaveFamily(@Req() req: any): Promise<void> {
    const currentUser = req.user as ClientContext;
    await this.usersService.leaveFamily(currentUser.sub);
  }
}
