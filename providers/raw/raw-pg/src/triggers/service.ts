import { PrepareResourceEvent } from '@ez4/project/library';
import { isPgService } from './utils';
import { createMigration } from '../migration/service';
import { getDatabaseName, getTableRepository } from '@ez4/pgclient/library';

export const prepareDatabaseServices = (event: PrepareResourceEvent) => {
  const { state, service, options } = event;

  if (!isPgService(service)) {
    return false;
  }

  createMigration(state, {
    repository: getTableRepository(service.tables),
    database: getDatabaseName(service, options)
  });

  return true;
};
