import type { Database, Client as DbClient } from '@ez4/database';
import { Client, ClientConnection } from '@ez4/pgclient';
import { PgTableRepository } from '@ez4/pgclient/library';
import { DatabaseQueries, PgMigrationStatement } from '@ez4/pgmigration/library';
import { ServeOptions } from '@ez4/project/library';
import { loadRepositoryState, saveRepositoryState } from './state';
import { getUpdateQueries } from '@ez4/pgmigration';

export const createAllTables = async (connection: ClientConnection, repository: PgTableRepository, options: ServeOptions) => {
  await ensureDatabase(connection);

  const { database } = connection;

  const client = getClient(connection);

  const oldRepository = options.force ? {} : await loadRepositoryState(database);

  const queries = getUpdateQueries(repository, oldRepository);

  const allQueries = [...queries.tables, ...queries.constraints, ...queries.relations, ...queries.indexes];

  await client.transaction(async (transaction: DbClient<Database.Service>) => {
    for (const query of allQueries) {
      await runStatement(transaction, query);
    }
  });

  await saveRepositoryState(database, repository);
};

export const deleteAllTables = async (connection: ClientConnection) => {
  const query = DatabaseQueries.prepareDelete(connection.database);

  const client = getClient({
    ...connection,
    database: 'postgres'
  });

  await runStatement(client, query);
};

const ensureDatabase = async (connection: ClientConnection) => {
  const query = DatabaseQueries.prepareCreate(connection.database);

  const client = getClient({
    ...connection,
    database: 'postgres'
  });

  await runStatement(client, query);
};

const runStatement = async (client: DbClient<Database.Service>, statement: PgMigrationStatement) => {
  const { check, query } = statement;

  if (check) {
    const [shouldSkip] = await client.rawQuery(check);

    if (shouldSkip) {
      return false;
    }
  }

  await client.rawQuery(query);

  return true;
};

const getClient = (connection: ClientConnection) => {
  return Client.make({
    debug: false,
    repository: {},
    connection
  });
};
