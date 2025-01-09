export interface HttpConfig {
  port: number;
}

export interface DatabaseConfig {
  mongo: {
    uri: string;
    database: string;
  };
}

export interface JwtConfig {
  secret: string;
  expiresIn: string; // e.g. 60s, 1h, 1d, 1y
}

export interface AppConfig {
  http: HttpConfig;
  db: DatabaseConfig;
  jwt: JwtConfig;
}
