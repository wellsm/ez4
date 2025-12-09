import { EmulateServiceEvent } from '@ez4/project/library';
import { isPgService } from './utils';
import { getConnectionOptions } from '../local/options';
import { getTableRepository } from '@ez4/pgclient/library';
import { createAllTables, deleteAllTables } from '../local/tables';

export const prepareEmulatorStart = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isPgService(service) && options.local) {
    const connection = getConnectionOptions(service, options);
    const repository = getTableRepository(service.tables);

    await createAllTables(connection, repository, options);
  }
};

export const prepareEmulatorReset = async (event: EmulateServiceEvent) => {
  const { service, options } = event;

  if (isPgService(service) && options.local) {
    const connection = getConnectionOptions(service, options);

    await deleteAllTables(connection);
  }
};
