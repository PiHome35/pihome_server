export interface SpotifyRefreshAccessTokenRequest {
  grant_type: 'refresh_token';
  refresh_token: string;
  client_id: string;
}

export interface SpotifyRefreshAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}
