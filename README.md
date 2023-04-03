# watame proxy

<img src="https://img.shields.io/github/package-json/v/kylsgl/watame-proxy" /> <img src="https://img.shields.io/github/license/kylsgl/watame-proxy" />

A cors proxy specifically built for watame.

## Usage

#### Basic usage

Prepend target url `https://api-hostname/file.json` with the proxy server endpoint `http://proxy-hostname/v2/`

```
http://proxy-hostname/v2/https://api-hostname/file.json
```

#### Optional Query Parameters

| Parameter  | Type      | Default   | Description                  |
| :--------- | :-------- | :-------- | :--------------------------- |
| `cache`    | `number`  | `2678400` | Set custom `max-age` header  |
| `cookie`   | `string`  |           | Set custom `cookie` header   |
| `method`   | `string`  |           | Override request method      |
| `redirect` | `boolean` | `false`   | Follow redirects (max: `10`) |
| `referrer` | `string`  |           | Set custom `referer` header  |

## Run Locally

Install dependencies

```
pnpm install
# or
npm install
```

Build the server

```
pnpm build
# or
npm run build
```

Start the server

```
pnpm start
# or
npm run start
```

Runs on http://localhost:8080

## Environment Variables

| Parameter  | Default | Description                |
| :--------- | :------ | :------------------------- |
| `HOST`     | `::`    | Server host                |
| `INSTANCE` | `1`     | Number of server instances |
| `PORT`     | `8080`  | Server port                |

## License

[MIT](https://github.com/kylsgl/watame-proxy/blob/main/LICENSE)
