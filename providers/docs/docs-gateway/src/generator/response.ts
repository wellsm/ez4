import type { HttpService } from '@ez4/gateway/library';

import { getPropertyName } from '@ez4/schema';
import { isEmptyObject } from '@ez4/utils';

import { getIndentedOutput } from '../utils/format';
import { getAnySchemaOutput } from '../schema/any';

export const getResponseOutput = (service: HttpService) => {
  const output: Record<string, string[]> = {};

  const defaultPreferences = service.defaults?.preferences;

  for (const route of service.routes) {
    const { preferences, handler } = route;
    const { response } = handler;

    const namingStyle = preferences?.namingStyle ?? defaultPreferences?.namingStyle;
    const schemaName = getPropertyName(handler.name, namingStyle);

    if (!response.body || output[schemaName]) {
      continue;
    }

    output[schemaName] = getAnySchemaOutput(response.body, namingStyle);
  }

  if (isEmptyObject(output)) {
    return [];
  }

  return [
    'responseSchemes:',
    ...getIndentedOutput(Object.entries(output).flatMap(([path, lines]) => [`${path}:`, ...getIndentedOutput(lines)])),
    ''
  ];
};
