export interface Device {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly clientId: string;
  clientSecretHash: string;
  name: string;
  familyId: string;
}

export interface DeviceWithSecret extends Device {
  clientSecret: string;
}

export interface CreateDeviceParams {
  clientId: string;
  name: string;
  familyId: string;
}

export interface UpdateDeviceParams {
  name?: string;
  familyId?: string;
}
