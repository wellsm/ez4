import { DatabaseService, isDatabaseService } from '@ez4/database/library';
import { ServiceMetadata } from '@ez4/project/library';

export const isPgService = (service: ServiceMetadata): service is DatabaseService => {
  return isDatabaseService(service) && service.engine.name === 'pg';
};
