import { Body, Controller, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLocalAuthGuard } from './guards/user-local-auth.guard';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Register a user' })
  @ApiBody({ type: RegisterUserRequestDto })
  @ApiResponse({ type: RegisterUserResponseDto })
  async registerUser(@Body() registerDto: RegisterUserRequestDto): Promise<RegisterUserResponseDto> {
    return this.authService.registerUser(registerDto.email, registerDto.password, registerDto.name);
  }

  @Post('/register/device')
  @ApiOperation({ summary: 'Register a device' })
  @ApiBody({ type: RegisterDeviceRequestDto })
  @ApiResponse({ type: RegisterDeviceResponseDto })
  async registerDevice(
    @Req() req: any,
    @Body() registerDto: RegisterDeviceRequestDto,
  ): Promise<RegisterDeviceResponseDto> {
    const currentUser = req.user as UserContext;
    return this.authService.registerDevice(currentUser.sub, registerDto.clientId, registerDto.name);
  }

  @Post('/login/user')
  @Public()
  @UseGuards(UserLocalAuthGuard)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserRequestDto })
  @ApiResponse({ type: LoginResponseDto })
  async loginUser(@Req() req: any): Promise<LoginResponseDto> {
    const currentUser = req.user as UserContext;
    return this.authService.loginAndGetUserJwtToken(currentUser.sub);
  }

  @Post('/login/device')
  @Public()
  @UseGuards(DeviceLocalAuthGuard)
  @ApiOperation({ summary: 'Login a device' })
  @ApiBody({ type: LoginDeviceRequestDto })
  @ApiResponse({ type: LoginResponseDto })
  async loginDevice(@Req() req: any): Promise<LoginResponseDto> {
    const currentUser = req.user as UserContext;
    return this.authService.loginAndGetDeviceJwtToken(currentUser.sub);
  }
}
