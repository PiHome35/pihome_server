export interface RefreshAccessTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  issuedAt: Date;
}
