import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    Http.UseRoute<{
      path: 'GET /users';
      handler: typeof listUsers;
      tags: ['Users'];
    }>,
    Http.UseRoute<{
      path: 'GET /orders';
      handler: typeof listOrders;
      tags: ['Orders', 'Users'];
    }>,
    Http.UseRoute<{
      path: 'GET /health';
      handler: typeof checkHealth;
    }>
  ];
}

function listUsers(): Http.SuccessEmptyResponse {
  return { status: 204 };
}

function listOrders(): Http.SuccessEmptyResponse {
  return { status: 204 };
}

function checkHealth(): Http.SuccessEmptyResponse {
  return { status: 204 };
}
