import type { EmulateClientEvent } from '@ez4/project/library';
import { isPgService } from './utils';
import { getConnectionOptions } from '../local/options';
import { LocalOptionsNotFoundError } from '../local/errors';
import { Client as NativeClient } from '@ez4/pgclient';
import { Client as ProviderClient } from '../client';
import { getTableRepository } from '@ez4/pgclient/library';
import { Pool } from 'pg';

export const prepareEmulatorClient = async (event: EmulateClientEvent) => {
  const { service, options } = event;

  if (!isPgService(service)) {
    return null;
  }

  const connection = getConnectionOptions(service, options);

  if (options.local) {
    if (!connection) {
      throw new LocalOptionsNotFoundError(service.name);
    }

    return NativeClient.make({
      debug: options.debug,
      repository: getTableRepository(service.tables),
      connection
    });
  }

  return ProviderClient.make({
    debug: options.debug,
    repository: getTableRepository(service.tables),
    connection: new Pool({
      host: connection.host,
      port: connection.port,
      user: connection.user,
      password: connection.password,
      database: connection.database,
      max: 1,
      allowExitOnIdle: true,
      idleTimeoutMillis: 1000
    })
  });
};
