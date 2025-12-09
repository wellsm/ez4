import { Logger } from '@ez4/aws-common';
import { MigrationServiceName } from './types';
import { ClientDriver as PgClientDriver } from '@ez4/pgclient';
import { Pool } from 'pg';
import { DatabaseQueries, PgMigrationStatement } from '@ez4/pgmigration/library';
import { PgTableRepository } from '@ez4/pgclient/library';
import { getCreateQueries, getDeleteQueries, getUpdateQueries } from '@ez4/pgmigration';

export type ConnectionRequest = {
  database: string;
  pool?: Pool;
};

export type CreateTableRequest = ConnectionRequest & {
  repository: PgTableRepository;
};

export type UpdateTableRequest = ConnectionRequest & {
  repository: {
    target: PgTableRepository;
    source: PgTableRepository;
  };
};

export type DeleteTableRequest = ConnectionRequest & {
  repository: PgTableRepository;
};

export const createDatabase = async ({ database }: ConnectionRequest): Promise<void> => {
  //TODO - Change
  const pool = new Pool({
    database,
    host: 'localhost',
    password: 'postgres',
    user: 'postgres',
    port: 5432
  });

  Logger.logCreate(MigrationServiceName, `${database} database`);

  const driver = new PgClientDriver(pool);

  await executeMigrationStatement(driver, DatabaseQueries.prepareCreate(database));
};

export const createTables = async ({ database, repository }: CreateTableRequest): Promise<void> => {
  //TODO - Change
  const pool = new Pool({
    database,
    host: 'localhost',
    password: 'postgres',
    user: 'postgres',
    port: 5432
  });

  Logger.logCreate(MigrationServiceName, `${database} tables`);

  const driver = new PgClientDriver(pool);
  const queries = getCreateQueries(repository);

  await executeMigrationTransaction(driver, [...queries.tables, ...queries.constraints, ...queries.relations, ...queries.indexes]);
};

export const updateTables = async ({ database, repository }: UpdateTableRequest): Promise<void> => {
  //TODO - Change
  const pool = new Pool({
    database,
    host: 'localhost',
    password: 'postgres',
    user: 'postgres',
    port: 5432
  });

  Logger.logUpdate(MigrationServiceName, `${database} tables`);

  const driver = new PgClientDriver(pool);
  const queries = getUpdateQueries(repository.target, repository.source);

  await executeMigrationTransaction(driver, [...queries.tables, ...queries.constraints, ...queries.relations]);
  await executeMigrationStatements(driver, queries.indexes);
};

export const deleteTables = async ({ database, repository }: DeleteTableRequest): Promise<void> => {
  //TODO - Change
  const pool = new Pool({
    database,
    host: 'localhost',
    password: 'postgres',
    user: 'postgres',
    port: 5432
  });

  Logger.logDelete(MigrationServiceName, `${database} tables`);

  const driver = new PgClientDriver(pool);
  const queries = getDeleteQueries(repository);

  await executeMigrationTransaction(driver, queries.tables);
};

export const deleteDatabase = async ({ database }: ConnectionRequest): Promise<void> => {
  //TODO - Change
  const pool = new Pool({
    database,
    host: 'localhost',
    password: 'postgres',
    user: 'postgres',
    port: 5432
  });

  Logger.logDelete(MigrationServiceName, `${database} database`);

  const driver = new PgClientDriver(pool);

  await executeMigrationStatement(driver, DatabaseQueries.prepareDelete(database));
};

const executeMigrationTransaction = async (driver: PgClientDriver, statements: PgMigrationStatement[]) => {
  const transactionId = await driver.beginTransaction();

  try {
    await executeMigrationStatements(driver, statements);
    await driver.commitTransaction(transactionId);
  } catch (error) {
    await driver.rollbackTransaction(transactionId);
    throw error;
  }
};

const executeMigrationStatements = async (driver: PgClientDriver, statements: PgMigrationStatement[]) => {
  for (const statement of statements) {
    await executeMigrationStatement(driver, statement);
  }
};

const executeMigrationStatement = async (driver: PgClientDriver, statement: PgMigrationStatement) => {
  const { check, query } = statement;

  if (check) {
    const { records } = await driver.executeStatement({
      query: check
    });

    const [shouldSkip] = records;

    if (shouldSkip) {
      return false;
    }
  }

  await driver.executeStatement({
    query
  });

  return true;
};
