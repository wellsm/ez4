# EZ4: Gateway Documentation UI

Local emulator UI for inspecting the OpenAPI spec produced by `@ez4/docs-gateway`.

## Getting started

#### Install

```sh
npm install @ez4/docs-gateway-ui -D
```

## Endpoints

When the emulator is running, the following routes are served on each HTTP service:

| Method | Path             | Content-Type        | Description                                    |
| ------ | ---------------- | ------------------- | ---------------------------------------------- |
| `GET`  | `/docs`          | `text/html`         | Scalar API reference UI for the gateway spec.  |
| `GET`  | `/openapi.json`  | `application/json`  | Raw OpenAPI 3.1 spec as JSON (importable).     |
| `GET`  | `/openapi.yaml`  | `application/yaml`  | Raw OpenAPI 3.1 spec as YAML.                  |

## License

MIT License
