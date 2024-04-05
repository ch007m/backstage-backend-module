# [Backstage](https://backstage.io)

Demo project to experiment: `createBackendModule` and `scaffolderTemplatingExtensionPoint`. See ticket [here](https://github.com/backstage/backstage/issues/24002#issuecomment-2039722494).  

Documentation about how to create a Scaffold backend module: https://github.com/backstage/backstage/blob/master/docs/backend-system/building-backends/08-migrating.md#the-scaffolder-plugin

To start the app, run:

```sh
nvm use v18.18.2
yarn install
yarn dev
```

Error reported is:
```
[1] 2024-04-05T14:30:41.840Z catalog info Performing database migration 
[1] /Users/cmoullia/temp/backstage-next/my-demo/node_modules/@backstage/backend-app-api/src/wiring/BackendInitializer.ts:248
[1]               provides: Array.from(moduleInit.consumes).map(c => c.id),
...
[1] TypeError: Cannot read properties of undefined (reading 'id')
[1]     at <anonymous> (/Users/cmoullia/temp/backstage-next/my-demo/node_modules/@backstage/backend-app-api/src/wiring/BackendInitializer.ts:248:68)
[1]     at Array.map (<anonymous>)
[1]     at <anonymous> (/Users/cmoullia/temp/backstage-next/my-demo/node_modules/@backstage/backend-app-api/src/wiring/BackendInitializer.ts:248:57)
[1]     at Array.map (<anonymous>)
[1]     at <anonymous> (/Users/cmoullia/temp/backstage-next/my-demo/node_modules/@backstage/backend-app-api/src/wiring/BackendInitializer.ts:242:33)
[1]     at Array.map (<anonymous>)
[1]     at BackendInitializer.doStart_fn (/Users/cmoullia/temp/backstage-next/my-demo/node_modules/@backstage/backend-app-api/src/wiring/BackendInitializer.ts:237:20)
[1]     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
[1]     at BackendInitializer.start (/Users/cmoullia/temp/backstage-next/my-demo/node_modules/@backstage/backend-app-api/src/wiring/BackendInitializer.ts:149:5)
[1]     at BackstageBackend.start (/Users/cmoullia/temp/backstage-next/my-demo/node_modules/@backstage/backend-app-api/src/wiring/BackstageBackend.ts:42:11)
```

If I debug the code, then the error occurs around here within the `BackendInitializer.ts`:
```typescript
// See: https://github.com/backstage/backstage/blob/23f9a92c3bf357fd5b451e01972e788fcb508fc9/packages/backend-app-api/src/wiring/BackendInitializer.ts#L276-L289

// Once all modules have been initialized, we can initialize the plugin itself
const pluginInit = pluginInits.get(pluginId);
// We allow modules to be installed without the accompanying plugin, so the plugin may not exist
if (pluginInit) {
    const pluginDeps = await this.#getInitDeps(
        pluginInit.init.deps,
        pluginId,
    );
    await pluginInit.init.func(pluginDeps).catch(error => {
        throw new ForwardedError(
            `Plugin '${pluginId}' startup failed`,
            error,
        );
    });
```

![debug-screen-1.png](image%2Fdebug-screen-1.png)

FYI: The following code works as we don't import the function ... 
```typescript
import { createBackend } from '@backstage/backend-defaults';
import {coreServices, createBackendModule} from '@backstage/backend-plugin-api';
import {scaffolderTemplatingExtensionPoint} from '@backstage/plugin-scaffolder-node/alpha';
import {JsonValue} from '@backstage/types';

export const myModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'my-custom-filter',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        scaffolderTemplating: scaffolderTemplatingExtensionPoint,
      },
      async init({scaffolderTemplating}) {
        scaffolderTemplating.addTemplateFilters(
          { base64: (...args: JsonValue[]) => btoa(args.join(""))}
        );
      },
    });
  },
});

const backend = createBackend();

backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('./authModuleGithubProvider'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

backend.add(import('@backstage/plugin-adr-backend'));
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-azure-devops-backend'));
backend.add(import('@backstage/plugin-badges-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-unprocessed'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(import('@backstage/plugin-devtools-backend'));
backend.add(import('@backstage/plugin-entity-feedback-backend'));
backend.add(import('@backstage/plugin-jenkins-backend'));
backend.add(import('@backstage/plugin-kubernetes-backend/alpha'));
backend.add(import('@backstage/plugin-lighthouse-backend'));
backend.add(import('@backstage/plugin-linguist-backend'));
backend.add(import('@backstage/plugin-playlist-backend'));
backend.add(import('@backstage/plugin-nomad-backend'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-explore/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-backstage-openapi'),
);
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));
backend.add(import('@backstage/plugin-todo-backend'));
backend.add(import('@backstage/plugin-sonarqube-backend'));
backend.add(import('@backstage/plugin-signals-backend'));
backend.add(import('@backstage/plugin-notifications-backend'));

backend.add(myModule);

backend.start();
```