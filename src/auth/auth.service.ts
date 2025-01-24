import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ClientContext } from './interfaces/context.interface';
import { JwtPayload } from './interfaces/jwt.interface';
import { ClientType } from './constants/client-type.enum';
import { UsersService } from 'src/pihome/services/users.service';
import { DevicesService } from 'src/pihome/services/devices.service';
import { LoginUserResponse } from './interfaces/login-user.interface';
import { LoginDeviceResponse } from './interfaces/login-device.interface';
import { RegisterUserResponse } from './interfaces/register-user.interface';
import { RegisterDeviceResponse } from './interfaces/register-device.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private devicesService: DevicesService,
  ) {}

  async validateAndGetUserContext(email: string, password: string): Promise<ClientContext> {
    const user = await this.usersService.getUserByEmail(email);
    if (await argon2.verify(user.passwordHash, password)) {
      return {
        clientType: ClientType.USER,
        sub: user.id,
      };
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async validateAndGetDeviceContext(clientId: string, clientSecret: string): Promise<ClientContext> {
    const device = await this.devicesService.getDeviceByClientId(clientId);
    if (await argon2.verify(device.clientSecretHash, clientSecret)) {
      return {
        clientType: ClientType.DEVICE,
        sub: device.id,
      };
    }
    throw new UnauthorizedException('Invalid client id or secret');
  }

  async loginUser(userId: string): Promise<LoginUserResponse> {
    const payload: JwtPayload = {
      clientType: ClientType.USER,
      sub: userId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  async loginDevice(deviceId: string): Promise<LoginDeviceResponse> {
    const payload: JwtPayload = {
      clientType: ClientType.DEVICE,
      sub: deviceId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  async registerUser(email: string, password: string, name: string): Promise<RegisterUserResponse> {
    const user = await this.usersService.createUser(email, password, name);
    const login = await this.loginUser(user.id);
    return { user, login };
  }

  async registerDevice(
    userId: string,
    clientId: string,
    macAddress: string,
    name: string,
  ): Promise<RegisterDeviceResponse> {
    const user = await this.usersService.getUser(userId);
    if (!user.familyId) {
      throw new BadRequestException('User is not in a family');
    }
    return this.devicesService.createDevice(clientId, macAddress, name, user.familyId);
  }
}
