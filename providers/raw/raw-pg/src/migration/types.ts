import { PgTableRepository } from '@ez4/pgclient/library';
import { EntryState } from '@ez4/stateful';

export const MigrationServiceName = 'PG/Migration';
export const MigrationServiceType = 'pg.migration';

export type MigrationParameters = {
  repository: PgTableRepository;
  database: string;
};

export type MigrationResult = string;

export type MigrationState = EntryState & {
  type: typeof MigrationServiceType;
  parameters: MigrationParameters;
  result?: MigrationResult;
};
