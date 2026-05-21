import type { ServeOptions, EmulatorFallbackRequestEvent } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';

import { OpenApiGenerator } from '@ez4/docs-gateway/library';
import { getServiceName } from '@ez4/project/library';
import { isHttpService } from '@ez4/gateway/library';

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { scalarTemplate } from './templates';

type Oas = Record<string, unknown> & {
  servers?: Record<string, unknown>[];
};

export const handleFallbackRequest = (event: EmulatorFallbackRequestEvent) => {
  const { request, service, options } = event;

  if (!isHttpService(service)) {
    return null;
  }

  const { method, path } = request;

  if (method !== 'GET') {
    return null;
  }

  const spec = getOasSpec(service, options);

  if (!spec) {
    return null;
  }

  switch (path) {
    case '/docs':
      return htmlResponse(generateHtml(service, spec));

    case '/openapi.json':
      return jsonResponse(JSON.stringify(spec, null, 2));

    case '/openapi.yaml':
      return yamlResponse(stringifyYaml(spec));
  }

  return null;
};

const htmlResponse = (body: string) => ({
  status: 200,
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
  body
});

const jsonResponse = (body: string) => ({
  status: 200,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body
});

const yamlResponse = (body: string) => ({
  status: 200,
  headers: { 'Content-Type': 'application/yaml; charset=utf-8' },
  body
});

const generateHtml = (service: HttpService, spec: Oas): string => {
  const title = escapeHtml(`${service.name} API`);
  const content = escapeScript(JSON.stringify(spec));

  return scalarTemplate.replace('__TITLE__', title).replace('__SPEC__', content);
};

const getOasSpec = (service: HttpService, options: ServeOptions): Oas | null => {
  try {
    const spec = parseYaml(OpenApiGenerator.getGatewayOutput(service)) as Oas;
    const prefix = getServiceName(service.name, options);

    spec.servers = [{ url: `http://${options.serviceHost}/${prefix}` }];

    return spec;
  } catch {
    return null;
  }
};

const escapeHtml = (input: string) => {
  return input.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
    }

    return char;
  });
};

const escapeScript = (input: string) => {
  return input.replace(/<\/(script|style)/gi, '<\\/$1').replace(/[\u2028\u2029]/g, (char) => {
    return char === '\u2028' ? '\\u2028' : '\\u2029';
  });
};
