import { AppConfig } from './config.interface';

export default () => {
  return {
    db: {
      postgres: {
        url: process.env.POSTGRES_URL,
      },
      mongo: {
        url: process.env.MONGO_URL,
      },
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID,
    },
  } as AppConfig;
};
