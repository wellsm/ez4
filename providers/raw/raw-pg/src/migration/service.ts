import { attachEntry, EntryState, EntryStates } from '@ez4/stateful';
import { MigrationParameters, MigrationServiceName, MigrationServiceType, MigrationState } from './types';
import { hashData } from '@ez4/utils';

export const createMigration = <E extends EntryState>(state: EntryStates<E>, parameters: MigrationParameters) => {
  const migrationId = hashData(MigrationServiceName, parameters.database);

  return attachEntry<E | MigrationState, MigrationState>(state, {
    type: MigrationServiceType,
    entryId: migrationId,
    dependencies: [],
    parameters
  });
};
