export interface DatabaseConfig {
  postgres: {
    url: string;
  };
  mongo: {
    url: string;
  };
}

export interface JwtConfig {
  secret: string;
  expiresIn: string; // e.g. 60s, 1h, 1d, 1y
}

export interface SpotifyConfig {
  clientId: string;
}

export interface MqttConfig {
  url: string;
}

export interface AppConfig {
  db: DatabaseConfig;
  jwt: JwtConfig;
  spotify: SpotifyConfig;
  mqtt: MqttConfig;
}
