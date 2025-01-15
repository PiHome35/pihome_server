import { Body, Controller, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLocalAuthGuard } from './guards/user-local-auth.guard';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginUserRequestDto, LoginResponseDto, LoginDeviceRequestDto } from './dto/login.dto';
import {
  RegisterDeviceRequestDto,
  RegisterDeviceResponseDto,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
} from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { DeviceLocalAuthGuard } from './guards/device-local-auth.guard';
import { UserContext } from './interfaces/context.interface';
import { ClientType } from './constants/client-type.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register/user')
  @Public()
  @ApiBody({ type: RegisterUserRequestDto })
  @ApiResponse({ status: 200, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async registerUser(@Body() registerDto: RegisterUserRequestDto): Promise<RegisterUserResponseDto> {
    return this.authService.registerUser(registerDto.email, registerDto.password, registerDto.name);
  }

  @Post('/register/device')
  @ApiBody({ type: RegisterDeviceRequestDto })
  @ApiResponse({ status: 200, description: 'Device successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async registerDevice(
    @Req() req: any,
    @Body() registerDto: RegisterDeviceRequestDto,
  ): Promise<RegisterDeviceResponseDto> {
    const currentUser = req.user as UserContext;
    if (currentUser.clientType !== ClientType.USER) {
      throw new UnauthorizedException('Only users can register devices');
    }
    return this.authService.registerDevice(
      currentUser.sub,
      registerDto.clientId,
      registerDto.name,
      registerDto.deviceGroupId,
    );
  }

  @Post('/login/user')
  @UseGuards(UserLocalAuthGuard)
  @ApiBody({ type: LoginUserRequestDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async loginUser(@Req() req: any): Promise<LoginResponseDto> {
    const currentUser = req.user as UserContext;
    return this.authService.loginAndGetUserJwtToken(currentUser.sub);
  }

  @Post('/login/device')
  @UseGuards(DeviceLocalAuthGuard)
  @ApiBody({ type: LoginDeviceRequestDto })
  @ApiResponse({ status: 200, description: 'Device successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async loginDevice(@Req() req: any): Promise<LoginResponseDto> {
    const currentUser = req.user as UserContext;
    return this.authService.loginAndGetDeviceJwtToken(currentUser.sub);
  }
}
