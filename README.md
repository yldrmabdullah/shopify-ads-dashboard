# Shopify Ads Dashboard - Remix App

A comprehensive Shopify app for managing and monitoring Google Ads and Meta (Facebook/Instagram) advertising campaigns. Built using the [Remix](https://remix.run) framework and integrated with Shopify's ecosystem.

This app provides merchants with centralized advertising metrics, campaign management, and performance insights directly within their Shopify admin panel.

## Features

- **Multi-Platform Integration**: Connect and monitor both Google Ads and Meta Ads accounts
- **Real-time Metrics**: Live performance data with key metrics like clicks, impressions, conversions, and ROAS
- **Campaign Management**: View and analyze campaign performance across platforms
- **Test Mode**: Development environment with mock data for testing
- **Secure Authentication**: OAuth 2.0 integration with encrypted token storage
- **Date Range Filtering**: Customizable date ranges for performance analysis
- **Responsive Design**: Optimized for all devices using Shopify Polaris components

## Quick start

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.
4. **Google Ads Account**: Required for Google Ads integration (optional for testing)
5. **Meta Business Account**: Required for Meta Ads integration (optional for testing)

### Setup

If you used the CLI to create the template, you can skip this section.

Using yarn:

```shell
yarn install
```

Using npm:

```shell
npm install
```

Using pnpm:

```shell
pnpm install
```

### Local Development

Using yarn:

```shell
yarn dev
```

Using npm:

```shell
npm run dev
```

Using pnpm:

```shell
pnpm run dev
```

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

### Environment Variables

For full functionality, set up the following environment variables in your `.env` file:

```bash
# Google Ads API (Optional for development)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Meta Ads API (Optional for development)
META_CLIENT_ID=your_meta_client_id
META_CLIENT_SECRET=your_meta_client_secret

# App Configuration
SHOPIFY_APP_URL=your_app_url
APP_ENCRYPTION_KEY=your_64_character_hex_key
```

**Note**: The app will work in test mode without these credentials, using mock data for development.

### Authenticating and querying data

To authenticate and query data you can use the `shopify` const that is exported from `/app/shopify.server.js`:

```js
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 25) {
        nodes {
          title
          description
        }
      }
    }`);

  const {
    data: {
      products: { nodes },
    },
  } = await response.json();

  return nodes;
}
```

This app comes preconfigured with:

1. **Dashboard**: Centralized view of all connected advertising platforms
2. **Google Ads Integration**: OAuth authentication and metrics fetching
3. **Meta Ads Integration**: Facebook/Instagram ads monitoring
4. **Campaign Analytics**: Detailed campaign performance data
5. **Test Mode**: Mock data for development and testing
6. **Secure Data Storage**: Encrypted token storage using Prisma

### App Structure

- `/app/routes/app.dashboard.jsx` - Main dashboard with overview metrics
- `/app/routes/app.google.jsx` - Google Ads specific page
- `/app/routes/app.facebook.jsx` - Meta Ads specific page
- `/app/routes/app.connections.jsx` - Platform connection management
- `/app/services/connections.server.js` - API integration logic
- `/app/config/app.server.js` - App configuration and credentials management
- `/app/data/mockData.server.js` - Mock data for testing

Please read the [documentation for @shopify/shopify-app-remix](https://www.npmjs.com/package/@shopify/shopify-app-remix#authenticating-admin-requests) to understand what other API's are available.

## Deployment

### Application Storage

This template uses [Prisma](https://www.prisma.io/) to store session data, by default using an [SQLite](https://www.sqlite.org/index.html) database.
The database is defined as a Prisma schema in `prisma/schema.prisma`.

This use of SQLite works in production if your app runs as a single instance.
The database that works best for you depends on the data your app needs and how it is queried.
You can run your database of choice on a server yourself or host it with a SaaS company.
Here's a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you can use a different [datasource provider](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) in your `schema.prisma` file, or a different [SessionStorage adapter package](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/guides/session-storage.md).

### Build

Remix handles building the app for you, by running the command below with the package manager of your choice:

Using yarn:

```shell
yarn build
```

Using npm:

```shell
npm run build
```

Using pnpm:

```shell
pnpm run build
```

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/deployment/web) to host your app on a cloud provider like [Heroku](https://www.heroku.com/) or [Fly.io](https://fly.io/).

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

### Production Configuration

For production deployment, ensure you have:

1. **Valid API Credentials**: Set up real Google Ads and Meta Business API credentials
2. **Database**: Configure a production database (PostgreSQL, MySQL, etc.)
3. **Security**: Set a secure `APP_ENCRYPTION_KEY` for token encryption
4. **OAuth Redirects**: Update redirect URLs in Google and Meta developer consoles

See `DEPLOYMENT.md` for detailed production setup instructions.

### Hosting on Vercel

Using the Vercel Preset is recommended when hosting your Shopify Remix app on Vercel. You'll also want to ensure imports that would normally come from `@remix-run/node` are imported from `@vercel/remix` instead. Learn more about hosting Remix apps on Vercel [here](https://vercel.com/docs/frameworks/remix).

```diff
// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, type UserConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
+ import { vercelPreset } from '@vercel/remix/vite';

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
+     presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
});
```

## Troubleshooting

### Database tables don't exist

If you get this error:

```
The table `main.Session` does not exist in the current database.
```

You need to create the database for Prisma. Run the `setup` script in `package.json` using your preferred package manager.

### Navigating/redirecting breaks an embedded app

Embedded Shopify apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `@remix-run/react` or `@shopify/polaris`. Do not use `<a>`.
2. Use the `redirect` helper returned from `authenticate.admin`. Do not use `redirect` from `@remix-run/node`
3. Use `useSubmit` or `<Form/>` from `@remix-run/react`. Do not use a lowercase `<form/>`.

This only applies if your app is embedded, which it will be by default.

### Non Embedded

Shopify apps are best when they are embedded in the Shopify Admin, which is how this template is configured. If you have a reason to not embed your app please make the following changes:

1. Ensure `embedded = false` is set in [shopify.app.toml`](./shopify.app.toml). [Docs here](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration#global).
2. Pass `isEmbeddedApp: false` to `shopifyApp()` in `./app/shopify.server.js|ts`.
3. Change the `isEmbeddedApp` prop to `isEmbeddedApp={false}` for the `AppProvider` in `/app/routes/app.jsx|tsx`.
4. Remove the `@shopify/app-bridge-react` dependency from [package.json](./package.json) and `vite.config.ts|js`.
5. Remove anything imported from `@shopify/app-bridge-react`.  For example: `NavMenu`, `TitleBar` and `useAppBridge`.

### OAuth goes into a loop when I change my app's scopes

If you change your app's scopes and authentication goes into a loop and fails with a message from Shopify that it tried too many times, you might have forgotten to update your scopes with Shopify.
To do that, you can run the `deploy` CLI command.

Using yarn:

```shell
yarn deploy
```

Using npm:

```shell
npm run deploy
```

Using pnpm:

```shell
pnpm run deploy
```

### My shop-specific webhook subscriptions aren't updated

If you are registering webhooks in the `afterAuth` hook, using `shopify.registerWebhooks`, you may find that your subscriptions aren't being updated.  

Instead of using the `afterAuth` hook, the recommended approach is to declare app-specific webhooks in the `shopify.app.toml` file.  This approach is easier since Shopify will automatically update changes to webhook subscriptions every time you run `deploy` (e.g: `npm run deploy`).  Please read these guides to understand more:

1. [app-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions)
2. [Create a subscription tutorial](https://shopify.dev/docs/apps/build/webhooks/subscribe/get-started?framework=remix&deliveryMethod=https)

If you do need shop-specific webhooks, please keep in mind that the package calls `afterAuth` in 2 scenarios:

- After installing the app
- When an access token expires

During normal development, the app won't need to re-authenticate most of the time, so shop-specific subscriptions aren't updated. To force your app to update the subscriptions, you can uninstall and reinstall it in your development store. That will force the OAuth process and call the `afterAuth` hook.

### Admin created webhook failing HMAC validation

Webhooks subscriptions created in the [Shopify admin](https://help.shopify.com/en/manual/orders/notifications/webhooks) will fail HMAC validation. This is because the webhook payload is not signed with your app's secret key.  There are 2 solutions:

1. Use [app-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) defined in your toml file instead (recommended)
2. Create [webhook subscriptions](https://shopify.dev/docs/api/shopify-app-remix/v1/guide-webhooks) using the `shopifyApp` object.

Test your webhooks with the [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/commands#webhook-trigger) or by triggering events manually in the Shopify admin(e.g. Updating the product title to trigger a `PRODUCTS_UPDATE`).

### Incorrect GraphQL Hints

By default the [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension for VS Code will assume that GraphQL queries or mutations are for the [Shopify Admin API](https://shopify.dev/docs/api/admin). This is a sensible default, but it may not be true if:

1. You use another Shopify API such as the storefront API.
2. You use a third party GraphQL API.

in this situation, please update the [.graphqlrc.ts](https://github.com/Shopify/shopify-app-template-remix/blob/main/.graphqlrc.ts) config.

### First parameter has member 'readable' that is not a ReadableStream.

See [hosting on Vercel](#hosting-on-vercel).

### Admin object undefined on webhook events triggered by the CLI

When you trigger a webhook event using the Shopify CLI, the `admin` object will be `undefined`. This is because the CLI triggers an event with a valid, but non-existent, shop. The `admin` object is only available when the webhook is triggered by a shop that has installed the app.

Webhooks triggered by the CLI are intended for initial experimentation testing of your webhook configuration. For more information on how to test your webhooks, see the [Shopify CLI documentation](https://shopify.dev/docs/apps/tools/cli/commands#webhook-trigger).

### Using Defer & await for streaming responses

To test [streaming using defer/await](https://remix.run/docs/en/main/guides/streaming) during local development you'll need to use the Shopify CLI slightly differently:

1. First setup ngrok: https://ngrok.com/product/secure-tunnels
2. Create an ngrok tunnel on port 8080: `ngrok http 8080`.
3. Copy the forwarding address. This should be something like: `https://f355-2607-fea8-bb5c-8700-7972-d2b5-3f2b-94ab.ngrok-free.app`
4. In a separate terminal run `yarn shopify app dev --tunnel-url=TUNNEL_URL:8080` replacing `TUNNEL_URL` for the address you copied in step 3.

By default the CLI uses a cloudflare tunnel. Unfortunately it cloudflare tunnels wait for the Response stream to finish, then sends one chunk.

This will not affect production, since tunnels are only for local development.

### Using MongoDB and Prisma

By default this template uses SQLlite as the database. It is recommended to move to a persisted database for production. If you choose to use MongoDB, you will need to make some modifications to the schema and prisma configuration. For more information please see the [Prisma MongoDB documentation](https://www.prisma.io/docs/orm/overview/databases/mongodb).

Alternatively you can use a MongDB database directly with the [MongoDB session storage adapter](https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/session-storage/shopify-app-session-storage-mongodb).

#### Mapping the id field

In MongoDB, an ID must be a single field that defines an @id attribute and a @map("\_id") attribute.
The prisma adapter expects the ID field to be the ID of the session, and not the \_id field of the document.

To make this work you can add a new field to the schema that maps the \_id field to the id field. For more information see the [Prisma documentation](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-an-id-field)

```prisma
model Session {
  session_id  String    @id @default(auto()) @map("_id") @db.ObjectId
  id          String    @unique
...
}
```

#### Error: The "mongodb" provider is not supported with this command

MongoDB does not support the [prisma migrate](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview) command. Instead, you can use the [prisma db push](https://www.prisma.io/docs/orm/reference/prisma-cli-reference#db-push) command and update the `shopify.web.toml` file with the following commands. If you are using MongoDB please see the [Prisma documentation](https://www.prisma.io/docs/orm/overview/databases/mongodb) for more information.

```toml
[commands]
predev = "npx prisma generate && npx prisma db push"
dev = "npm exec remix vite:dev"
```

#### Prisma needs to perform transactions, which requires your mongodb server to be run as a replica set

See the [Prisma documentation](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/mongodb/connect-your-database-node-mongodb) for connecting to a MongoDB database.

### I want to use Polaris v13.0.0 or higher

Currently, this template is set up to work on node v18.20 or higher. However, `@shopify/polaris` is limited to v12 because v13 can only run on node v20+.

You don't have to make any changes to the code in order to be able to upgrade Polaris to v13, but you'll need to do the following:

- Upgrade your node version to v20.10 or higher.
- Update your `Dockerfile` to pull `FROM node:20-alpine` instead of `node:18-alpine`

### "nbf" claim timestamp check failed

This error will occur of the `nbf` claim timestamp check failed. This is because the JWT token is expired.
If you  are consistently getting this error, it could be that the clock on your machine is not in sync with the server.

To fix this ensure you have enabled `Set time and date automatically` in the `Date and Time` settings on your computer.

## Benefits

Shopify apps are built on a variety of Shopify tools to create a great merchant experience.

<!-- TODO: Uncomment this after we've updated the docs -->
<!-- The [create an app](https://shopify.dev/docs/apps/getting-started/create) tutorial in our developer documentation will guide you through creating a Shopify app using this template. -->

The Shopify Ads Dashboard comes with the following out-of-the-box functionality:

- **Shopify Integration**: 
  - [OAuth](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-admin-requests): Installing the app and granting permissions
  - [GraphQL Admin API](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#using-the-shopify-admin-graphql-api): Querying or mutating Shopify admin data
  - [Webhooks](https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-remix#authenticating-webhook-requests): Callbacks sent by Shopify when certain events occur

- **Advertising Platform Integration**:
  - **Google Ads OAuth**: Secure authentication and token management
  - **Meta Ads OAuth**: Facebook/Instagram business account integration
  - **Real-time Metrics**: Live campaign performance data
  - **Campaign Management**: View and analyze campaign performance

- **UI/UX**:
  - [AppBridge](https://shopify.dev/docs/api/app-bridge): Seamless Shopify admin integration
  - [Polaris](https://polaris.shopify.com/): Shopify-native design system and components
  - **Responsive Design**: Mobile-friendly interface
  - **Test Mode Indicators**: Clear visual feedback for development

- **Data & Security**:
  - **Encrypted Storage**: Secure token management using AES-256-GCM
  - **Mock Data**: Development-friendly testing environment
  - **Date Range Filtering**: Flexible performance analysis periods

## Tech Stack

This app uses [Remix](https://remix.run) as the core framework. The following technologies are included:

### Core Technologies
- **[Remix](https://remix.run)**: Full-stack web framework for React
- **[React](https://reactjs.org/)**: UI library for building interactive interfaces
- **[Prisma](https://prisma.io/)**: Database ORM for data management
- **[SQLite](https://sqlite.org/)**: Development database (configurable for production)

### Shopify Integration
- **[Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix)**: Authentication and Shopify API integration
- **[Shopify App Bridge](https://shopify.dev/docs/apps/tools/app-bridge)**: Seamless admin panel integration
- **[Polaris React](https://polaris.shopify.com/)**: Shopify's design system and UI components

### Advertising APIs
- **Google Ads API**: Campaign metrics and management
- **Meta Business API**: Facebook/Instagram advertising data
- **OAuth 2.0**: Secure authentication for all platforms

### Security & Utilities
- **AES-256-GCM Encryption**: Secure token storage
- **Environment Configuration**: Flexible development/production setup
- **Mock Data System**: Testing and development support

## API Documentation

### Google Ads API
- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [OAuth 2.0 Setup](https://developers.google.com/google-ads/api/docs/oauth/overview)
- [Reporting API](https://developers.google.com/google-ads/api/docs/reporting/overview)

### Meta Business API
- [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis/)
- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow)
- [Ad Insights API](https://developers.facebook.com/docs/marketing-api/insights)

## Resources

### Framework & Platform
- [Remix Docs](https://remix.run/docs/en/v1)
- [Shopify App Remix](https://shopify.dev/docs/api/shopify-app-remix)
- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [App authentication](https://shopify.dev/docs/apps/auth)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)

### Development Tools
- [Polaris Design System](https://polaris.shopify.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)

### Testing & Deployment
- [Getting started with internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
- [App deployment best practices](https://shopify.dev/docs/apps/deployment)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the [Issues](../../issues) section
- Review the `DEPLOYMENT.md` guide
- Consult the official [Shopify Developer Documentation](https://shopify.dev/docs)
