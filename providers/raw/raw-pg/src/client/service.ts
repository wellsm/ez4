import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Pool } from 'pg';

import { PgClient, ClientDriver as PgClientDriver } from '@ez4/pgclient';

export type ClientContext = {
  connection: Pool;
  repository: PgTableRepository;
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service>(context: ClientContext): DbClient<T> => {
    const { connection, repository, debug } = context;

    return PgClient.make({
      driver: new PgClientDriver(connection),
      repository,
      debug
    });
  };
}
