import type { HttpService } from '@ez4/gateway/library';

import { getPropertyName } from '@ez4/schema';
import { isEmptyObject } from '@ez4/utils';

import { getIndentedOutput } from '../utils/format';
import { getAnySchemaOutput } from '../schema/any';

export const getRequestOutput = (service: HttpService) => {
  const output: Record<string, string[]> = {};

  const defaultPreferences = service.defaults?.preferences;

  for (const route of service.routes) {
    const { preferences, handler } = route;
    const { request } = handler;

    const namingStyle = preferences?.namingStyle ?? defaultPreferences?.namingStyle;
    const schemaName = getPropertyName(handler.name, namingStyle);

    if (!request?.body || output[schemaName]) {
      continue;
    }

    output[schemaName] = getAnySchemaOutput(request.body, namingStyle);
  }

  if (isEmptyObject(output)) {
    return [];
  }

  return [
    'requestSchemes:',
    ...getIndentedOutput(Object.entries(output).flatMap(([path, lines]) => [`${path}:`, ...getIndentedOutput(lines)])),
    ''
  ];
};
