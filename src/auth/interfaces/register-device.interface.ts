import { Device } from '@prisma/client';

export interface RegisterDeviceResponse {
  device: Device;
  clientSecret: string;
}
