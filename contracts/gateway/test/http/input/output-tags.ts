import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'GET /test-route-1';
      handler: typeof testRoute;
      tags: ['Users', 'Public'];
    }>
  ];
}

function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
