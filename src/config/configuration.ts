import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { AppConfig } from './config.interface';

export default () => {
  const configFilePath =
    process.env.NODE_ENV === 'production' ? '../config/config.prod.yml' : '../config/config.dev.yml';
  return yaml.load(readFileSync(join(__dirname, configFilePath), 'utf8')) as AppConfig;
};
