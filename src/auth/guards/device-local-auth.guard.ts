import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DeviceLocalAuthGuard extends AuthGuard('device-local') {}
