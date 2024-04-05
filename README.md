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
