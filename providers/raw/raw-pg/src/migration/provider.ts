import { tryRegisterProvider } from '@ez4/aws-common';
import { MigrationServiceType } from './types';
import { getMigrationHandler } from './handler';

export const registerMigrationProvider = () => {
  tryRegisterProvider(MigrationServiceType, getMigrationHandler());
};
