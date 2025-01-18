import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLocalAuthGuard } from './guards/user-local-auth.guard';
import { ApiTags, ApiBody, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { DeviceLocalAuthGuard } from './guards/device-local-auth.guard';
import { ClientContext } from './interfaces/context.interface';
import { RegisterUserRequestDto, RegisterUserResponseDto } from './dto/register-user.dto';
import { RegisterDeviceRequestDto, RegisterDeviceResponseDto } from './dto/register-device.dto';
import { LoginUserRequestDto, LoginUserResponseDto } from './dto/login-user.dto';
import { LoginDeviceRequestDto, LoginDeviceResponseDto } from './dto/login-device.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register/user')
  @Public()
  @ApiOperation({ summary: 'Register a user' })
  @ApiCreatedResponse({ type: RegisterUserResponseDto })
  async registerUser(@Body() registerDto: RegisterUserRequestDto): Promise<RegisterUserResponseDto> {
    const registerUserResponse = await this.authService.registerUser(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
    return plainToInstance(RegisterUserResponseDto, registerUserResponse);
  }

  @Post('/register/device')
  @ApiOperation({ summary: 'Register a device' })
  @ApiCreatedResponse({ type: RegisterDeviceResponseDto })
  async registerDevice(
    @Req() req: any,
    @Body() registerDto: RegisterDeviceRequestDto,
  ): Promise<RegisterDeviceResponseDto> {
    const currentUser = req.user as ClientContext;
    const registerDeviceResponse = await this.authService.registerDevice(
      currentUser.sub,
      registerDto.clientId,
      registerDto.name,
    );
    return plainToInstance(RegisterDeviceResponseDto, registerDeviceResponse);
  }

  @Post('/login/user')
  @Public()
  @UseGuards(UserLocalAuthGuard)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserRequestDto })
  @ApiOkResponse({ type: LoginUserResponseDto })
  async loginUser(@Req() req: any): Promise<LoginUserResponseDto> {
    const currentUser = req.user as ClientContext;
    const loginUserResponse = await this.authService.loginUser(currentUser.sub);
    return plainToInstance(LoginUserResponseDto, loginUserResponse);
  }

  @Post('/login/device')
  @Public()
  @UseGuards(DeviceLocalAuthGuard)
  @ApiOperation({ summary: 'Login a device' })
  @ApiBody({ type: LoginDeviceRequestDto })
  @ApiOkResponse({ type: LoginDeviceResponseDto })
  async loginDevice(@Req() req: any): Promise<LoginDeviceResponseDto> {
    const currentDevice = req.user as ClientContext;
    const loginDeviceResponse = await this.authService.loginDevice(currentDevice.sub);
    return plainToInstance(LoginDeviceResponseDto, loginDeviceResponse);
  }
}
