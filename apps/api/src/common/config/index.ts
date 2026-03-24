import { ConfigType } from '@nestjs/config';
import databaseConfig from './database.config';
import authConfig from './auth.config';

export { databaseConfig, authConfig };
export const appConfigs = [databaseConfig, authConfig];

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
export type AuthConfig = ConfigType<typeof authConfig>;
