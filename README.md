# [Backstage module](https://backstage.io)

This project has been created to demo: `createBackendModule` and `scaffolderTemplatingExtensionPoint`. See ticket [here](https://github.com/backstage/backstage/issues/24002#issuecomment-2039722494).  

**Note**: Documentation about how to create a Scaffold backend module: https://github.com/backstage/backstage/blob/master/docs/backend-system/building-backends/08-migrating.md#the-scaffolder-plugin

## HowTo guide: Backend module and Template filter

The following section describe how to register, using the new backend system, a [backend module](https://backstage.io/docs/backend-system/building-backends/index) able
to add `Template filters` that we will use within a Template scaffolded to perform operations like this : `${{ parameters.name | filter1 | filter2 | etc }}`

- Create a backstage backend using backstage 1.25 

```bash
npx @backstage/create-app@0.5.13 --skip-install
```

- Move to the project and add the needed dependencies
```bash
cd my-demo

yarn add --cwd packages/backend @backstage/backend-plugin-api
yarn add --cwd packages/backend @backstage/plugin-scaffolder-node
yarn add --cwd packages/backend @backstage/types
```

- Create a backend module which uses as dependency: `scaffolderTemplatingExtensionPoint` and declare some filters using the function init function `scaffolderTemplating.addTemplateFilters`. For this demo project, we will create this basic `base64` filter: `{ base64: (...args: JsonValue[]) => btoa(args.join(""))}`

```bash
mkdir -p packages/backend/src/modules

cat <<EOF > packages/backend/src/modules/scaffoldTemplateFilters.ts
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
```

- Edit the file `my-demo/packages/backend/src/index.ts` to import the new backend module 
```bash
// Add the module: scaffoldTemplateFilters
backend.add(import('./modules/scaffoldTemplateFilters'));
...
backend.start()
```

- Create a dummy template within the examples folder
```bash
cat <<EOF > ./examples/template/dummy.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: dummy
  title: Dummy template
  description: Dummy template to test fields
spec:
  owner: guests
  type: service

  # These parameters are used to generate the input form in the frontend, and are
  # used to gather input data for the execution of the template.
  parameters:
    - title: input
      required:
        - myInput
      properties:
        myInput:
          title: Input
          type: string
          description: Input
  steps:
    - id: debug
      name: debug
      action: debug:log
      input:
        message: \${{ parameters.myInput | base64 }}
EOF
```
- Add it to the `app-config.yaml` file

```yaml
...
    # Local dummy template
    - type: file
      target: ../../examples/template/dummy.yaml
      rules:
        - allow: [Template]
```        
- Launch backstage locally
```bash
yarn dev
```
- Open the `dummy` template, add your name using the `inputName` field, click on `review` and `create` button
- Check the log of the backstage backend application
```bash
type=incomingRequest
2024-04-05T12:14:34.973Z rootHttpRouter info ::1 - - [05/Apr/2024:12:14:34 +0000] "POST /api/scaffolder/v2/tasks HTTP/1.1" 201 45 "http://localhost:3000/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36" type=incomingRequest
info: {
  "message": "Q2hhcmxlcw=="
}
info: Q2hhcmxlcw== 
```

## Use an external module

- Create a backend module within the plugins folder of your backstage app project using the client: `npx @backstage/cli@latest new --select backend-module`
```bash
npx @backstage/cli@latest new --select backend-module
? Enter the ID of the plugin [required] scaffolder
? Enter the ID of the module [required] my-custom-filter
cd 
```
- Rename the name of the new plugin package created from `"name": "backstage-plugin-scaffolder-backend-module-my-custom-filter",` to `"name": "@internal/backend-module-scaffolder-my-custom-filter",`
- Update the dependency name within the package.json of the backend application too
- Add the needed dependency to the plugin created:
  ```bash
  yarn --cwd plugins/scaffolder-backend-module-my-custom-filter add @backstage/plugin-scaffolder-node
  yarn --cwd plugins/scaffolder-backend-module-my-custom-filter add @backstage/types
  ``` 
- Override the `createBackendModule` function code within your filter definition:
```typescript
... = createBackendModule({
    pluginId: 'scaffolder',
    moduleId: 'my-custom-filter',
    register(env) {
        env.registerInit({
            deps: {
                scaffolder: scaffolderTemplatingExtensionPoint,
            },
            async init({ scaffolder }) {
                scaffolder.addTemplateFilters(
                    {base64: (...args: JsonValue[]) => btoa(args.join(""))}
                );
            },
        });
    },
});
```
- Update the code of the `/Users/cmoullia/temp/backstage-next/backstage-backend-module/packages/backend/src/index.ts` 
  to comment the line importing the module locally `// import scaffolderTemplatingExtension from './modules/scaffoldTemplateFilters';`
- and import the module `backend.add(import('@internal/backend-module-scaffolder-my-custom-filter'));`
- Execute `yarn install` to verify that the internal module is well imported
- Launch backstage locally
