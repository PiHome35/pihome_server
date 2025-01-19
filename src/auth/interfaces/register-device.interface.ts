import { Device } from 'prisma/generated/edge';

export interface RegisterDeviceResponse {
  device: Device;
  clientSecret: string;
}
