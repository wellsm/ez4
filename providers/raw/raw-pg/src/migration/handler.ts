import { StepContext, StepHandler, StepOptions } from '@ez4/stateful';
import { MigrationResult, MigrationServiceName, MigrationState } from './types';
import { getTableRepositoryChanges } from '@ez4/pgmigration/library';
import { ReplaceResourceError } from '@ez4/aws-common';
import { deepCompare } from '@ez4/utils';
import { createDatabase, createTables, deleteDatabase, updateTables } from './client';

export const getMigrationHandler = (): StepHandler<MigrationState> => ({
  equals: equalsResource,
  create: createResource,
  replace: replaceResource,
  preview: previewResource,
  update: updateResource,
  delete: deleteResource
});

const equalsResource = (candidate: MigrationState) => {
  return !!candidate.result;
};

const previewResource = (candidate: MigrationState, current: MigrationState, options: StepOptions) => {
  const target = { ...candidate.parameters, dependencies: candidate.dependencies };
  const source = { ...current.parameters, dependencies: current.dependencies };

  const databaseChanges = getTableRepositoryChanges(target.repository, options.force ? {} : source.repository);

  const resourceChanges = deepCompare(target, source, {
    exclude: {
      repository: true
    }
  });

  return {
    ...resourceChanges,
    counts: resourceChanges.counts + Math.max(databaseChanges.counts, 1),
    name: target.database,
    nested: {
      ...resourceChanges.nested,
      repository: databaseChanges
    }
  };
};

const replaceResource = async (candidate: MigrationState, current: MigrationState, _: StepContext) => {
  if (current.result) {
    throw new ReplaceResourceError(MigrationServiceName, candidate.entryId, current.entryId);
  }

  return createResource(candidate);
};

const createResource = async ({ parameters: { database, repository } }: MigrationState): Promise<MigrationResult> => {
  await createDatabase({ database });
  await createTables({ database, repository });

  return 'Created';
};

const updateResource = async (candidate: MigrationState, current: MigrationState, context: StepContext) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  const targetRepository = parameters.repository;
  const sourceRepository = context.force ? {} : current.parameters.repository;

  const databaseChanges = getTableRepositoryChanges(targetRepository, sourceRepository);

  if (!databaseChanges.counts) {
    return;
  }

  await updateTables({
    database: parameters.database,
    repository: {
      target: targetRepository,
      source: sourceRepository
    }
  });
};

const deleteResource = async (candidate: MigrationState) => {
  const { result, parameters } = candidate;

  if (!result) {
    return;
  }

  await deleteDatabase({
    database: parameters.database
  });
};
