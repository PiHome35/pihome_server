import { Body, Controller, Delete, Get, Post, Put, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { GetUserResponseDto } from '../dto/get-user.dto';
import { UserContext } from 'src/auth/interfaces/context.interface';
import { ClientType } from 'src/auth/constants/client-type.enum';
import { UpdateUserRequestDto, UpdateUserResponseDto } from '../dto/update-user.dto';
import { JoinFamilyRequestDto, JoinFamilyResponseDto } from '../dto/join-family.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ type: GetUserResponseDto })
  async getUser(@Req() req: any): Promise<GetUserResponseDto> {
    const currentUser = req.user as UserContext;
    if (currentUser.clientType !== ClientType.USER) {
      throw new UnauthorizedException('Client is not a user');
    }
    const user = await this.usersService.getUserWithFamily(currentUser.sub);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      familyId: user.family?.id,
      familyName: user.family?.name,
    };
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user' })
  @ApiNoContentResponse()
  @ApiResponse({ status: 204 })
  async deleteUser(@Req() req: any): Promise<void> {
    const currentUser = req.user as UserContext;
    await this.usersService.deleteUser(currentUser.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user' })
  @ApiBody({ type: UpdateUserRequestDto })
  @ApiResponse({ type: UpdateUserResponseDto })
  async updateUser(@Req() req: any, @Body() updateUserDto: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const currentUser = req.user as UserContext;
    const user = await this.usersService.updateUser(currentUser.sub, updateUserDto);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @Post('join-family')
  @ApiOperation({ summary: 'Join a family' })
  @ApiBody({ type: JoinFamilyRequestDto })
  @ApiResponse({ type: JoinFamilyResponseDto })
  async joinFamily(@Req() req: any, @Body() joinFamilyDto: JoinFamilyRequestDto): Promise<JoinFamilyResponseDto> {
    const currentUser = req.user as UserContext;
    const familyId = await this.usersService.joinFamily(currentUser.sub, joinFamilyDto.code);
    return { id: familyId };
  }
}
