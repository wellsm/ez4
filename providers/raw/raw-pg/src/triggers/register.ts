import { registerTriggers as registerDatabaseTriggers } from '@ez4/database/library';
import { tryCreateTrigger } from '@ez4/project/library';
import { prepareDatabaseServices } from './service';
import { prepareEmulatorClient } from './client';
import { prepareEmulatorReset, prepareEmulatorStart } from './migration';
import { registerMigrationProvider } from '../migration/provider';

export const registerTriggers = () => {
  registerDatabaseTriggers();

  tryCreateTrigger('@ez4/pg', {
    'deploy:prepareResources': prepareDatabaseServices,
    'emulator:getClient': prepareEmulatorClient,
    'emulator:startService': prepareEmulatorStart,
    'emulator:resetService': prepareEmulatorReset
  });

  registerMigrationProvider();
};
