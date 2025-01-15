import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { GetUserResponseDto } from '../dto/get-user.dto';
import { UserContext } from 'src/auth/interfaces/context.interface';
import { ClientType } from 'src/auth/constants/client-type.enum';

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
}
