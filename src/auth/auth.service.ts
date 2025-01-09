import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { RegisterDeviceRequestDto, RegisterUserRequestDto, RegisterUserResponseDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login.dto';
import { DevicesService } from 'src/devices/devices.service';
import { UserContext } from './interfaces/context.interface';
import { JwtPayload } from './interfaces/jwt.interface';
import { ClientType } from './constants/client-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private devicesService: DevicesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserContext | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await argon2.verify(user.passwordHash, password))) {
      return {
        clientType: ClientType.USER,
        id: user.id,
      };
    }
    return null;
  }

  async validateDevice(clientId: string, clientSecret: string): Promise<UserContext | null> {
    const device = await this.devicesService.findOne(clientId);
    if (device && (await argon2.verify(device.clientSecretHash, clientSecret))) {
      return {
        clientType: ClientType.DEVICE,
        id: device.clientId,
      };
    }
    return null;
  }

  async loginUser(userId: string): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      sub: userId,
      clientType: ClientType.USER,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  async loginDevice(clientId: string): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      sub: clientId,
      clientType: ClientType.DEVICE,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  async registerUser(registerDto: RegisterUserRequestDto): Promise<RegisterUserResponseDto> {
    const user = await this.usersService.create(registerDto);
    return this.loginUser(user.id);
  }

  async registerDevice(userId: string, registerDto: RegisterDeviceRequestDto) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.familyId) {
      throw new BadRequestException('User does not have a family');
    }
    const device = await this.devicesService.create({ ...registerDto, familyId: user.familyId });
    return { clientSecret: device.clientSecret };
  }
}
