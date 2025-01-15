import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { RegisterDeviceResponseDto, RegisterUserResponseDto } from './dto/register.dto';
import { LoginResponseDto } from './dto/login.dto';
import { UserContext } from './interfaces/context.interface';
import { JwtPayload } from './interfaces/jwt.interface';
import { ClientType } from './constants/client-type.enum';
import { UsersService } from 'src/pihome/services/users.service';
import { DevicesService } from 'src/pihome/services/devices.service';
import { FamiliesService } from 'src/pihome/services/families.service';
import { generateRandomSecret } from 'src/utils/random.util';
import { DeviceGroup } from 'prisma/generated';
import { DeviceGroupsService } from 'src/pihome/services/device-groups.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private devicesService: DevicesService,
    private familiesService: FamiliesService,
    private deviceGroupsService: DeviceGroupsService,
  ) {}

  async validateAndGetUserContext(email: string, password: string): Promise<UserContext> {
    const user = await this.usersService.getUserByEmail(email);
    if (await argon2.verify(user.passwordHash, password)) {
      return {
        clientType: ClientType.USER,
        sub: user.id,
      };
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async validateAndGetDeviceContext(clientId: string, clientSecret: string): Promise<UserContext> {
    const device = await this.devicesService.getDeviceByClientId(clientId);
    if (await argon2.verify(device.clientSecretHash, clientSecret)) {
      return {
        clientType: ClientType.DEVICE,
        sub: device.id,
      };
    }
    throw new UnauthorizedException('Invalid client id or secret');
  }

  async loginAndGetUserJwtToken(userId: string): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      clientType: ClientType.USER,
      sub: userId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  async loginAndGetDeviceJwtToken(deviceId: string): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      clientType: ClientType.DEVICE,
      sub: deviceId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
    };
  }

  async registerUser(email: string, password: string, name: string): Promise<RegisterUserResponseDto> {
    if (await this.usersService.userExistsWithEmail(email)) {
      throw new BadRequestException('User with this email already exists');
    }
    const user = await this.usersService.createUser(email, await argon2.hash(password), name);
    return this.loginAndGetUserJwtToken(user.id);
  }

  async registerDevice(
    userId: string,
    clientId: string,
    name: string,
    deviceGroupId?: string,
  ): Promise<RegisterDeviceResponseDto> {
    const family = await this.usersService.getUserFamily(userId); // Throws if user is not in a family
    let deviceGroup: DeviceGroup;
    if (deviceGroupId) {
      deviceGroup = await this.deviceGroupsService.getDeviceGroup(deviceGroupId); // Throws if device group not found
    } else {
      deviceGroup = await this.familiesService.getFamilyDefaultDeviceGroup(family.id); // Throws if no default device group
    }
    const clientSecret = generateRandomSecret();
    await this.devicesService.createDevice(clientId, await argon2.hash(clientSecret), name, deviceGroup.id);
    return { clientId, clientSecret };
  }
}
