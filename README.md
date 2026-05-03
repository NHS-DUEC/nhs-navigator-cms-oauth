# NHS Navigator CMS OAuth

A small Node.js/Express proxy that handles GitHub OAuth authentication for [Decap CMS](https://decapcms.org/). It implements the postMessage-based handshake that Decap CMS expects when authenticating via a popup window.

## How it works

1. Decap CMS opens `/auth` in a popup, which redirects the user to GitHub's OAuth authorisation page.
2. GitHub redirects back to `/callback` with a temporary code.
3. The proxy exchanges the code for an access token using the GitHub OAuth API.
4. The access token is passed back to the CMS via `window.postMessage`.

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /auth` | Redirects to GitHub OAuth authorisation |
| `GET /callback` | Handles the GitHub callback and posts the token back to the opener |

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OAUTH_CLIENT_ID` | Yes | — | GitHub OAuth app client ID |
| `OAUTH_CLIENT_SECRET` | Yes | — | GitHub OAuth app client secret |
| `SCOPES` | No | `repo,user` | GitHub OAuth scopes to request |
| `PORT` | No | `3000` | Port to listen on |

## Setup

### 1. Create a GitHub OAuth app

In your GitHub account or organisation settings, create a new OAuth app with the callback URL set to `https://<your-domain>/callback`.

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

```bash
export OAUTH_CLIENT_ID=your_client_id
export OAUTH_CLIENT_SECRET=your_client_secret
```

### 4. Run

```bash
npm start
```

## Deployment

This app is deployed to [Heroku](https://heroku.com). Set the environment variables as Heroku config vars:

```bash
heroku config:set OAUTH_CLIENT_ID=your_client_id
heroku config:set OAUTH_CLIENT_SECRET=your_client_secret
```

## Decap CMS configuration

In your Decap CMS `config.yml`, point the `base_url` at this service:

```yaml
backend:
  name: github
  repo: your-org/your-repo
  base_url: https://your-oauth-proxy-domain.com
```
