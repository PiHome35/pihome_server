import { Body, Controller, Delete, Get, Post, Put, Req } from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { ClientContext } from 'src/auth/interfaces/context.interface';
import { plainToInstance } from 'class-transformer';
import { GetUserResponseDto } from '../dto/user/get-user.dto';
import { UpdateUserRequestDto, UpdateUserResponseDto } from '../dto/user/update-user.dto';
import { JoinFamilyResponseDto } from '../dto/user/join-family.dto';
import { JoinFamilyRequestDto } from '../dto/user/join-family.dto';

@ApiTags('Users')
@Controller('me')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: GetUserResponseDto })
  async getUser(@Req() req: any): Promise<GetUserResponseDto> {
    const currentUser = req.user as ClientContext;
    const user = await this.usersService.getUser(currentUser.sub);
    return plainToInstance(GetUserResponseDto, user);
  }

  @Put()
  @ApiOperation({ summary: 'Update current user' })
  @ApiBody({ type: UpdateUserRequestDto })
  @ApiOkResponse({ type: UpdateUserResponseDto })
  async updateUser(@Req() req: any, @Body() updateUserDto: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const currentUser = req.user as ClientContext;
    const user = await this.usersService.updateUser(
      currentUser.sub,
      updateUserDto.name,
      updateUserDto.email,
      updateUserDto.password,
    );
    return plainToInstance(UpdateUserResponseDto, user);
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
  @ApiBody({ type: JoinFamilyRequestDto })
  @ApiOkResponse({ type: JoinFamilyResponseDto })
  async joinFamily(@Req() req: any, @Body() joinFamilyDto: JoinFamilyRequestDto): Promise<JoinFamilyResponseDto> {
    const currentUser = req.user as ClientContext;
    const family = await this.usersService.joinFamily(currentUser.sub, joinFamilyDto.code);
    return plainToInstance(JoinFamilyResponseDto, family);
  }

  @Post('leave-family')
  @ApiOperation({ summary: 'Leave current family' })
  @ApiNoContentResponse()
  async leaveFamily(@Req() req: any): Promise<void> {
    const currentUser = req.user as ClientContext;
    await this.usersService.leaveFamily(currentUser.sub);
  }
}
