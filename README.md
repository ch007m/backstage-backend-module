# [Backstage](https://backstage.io)

Demo project to experiment: `createBackendModule` and `scaffolderTemplatingExtensionPoint`. See ticket [here](https://github.com/backstage/backstage/issues/24002#issuecomment-2039722494).  

Documentation about how to create a Scaffold backend module: https://github.com/backstage/backstage/blob/master/docs/backend-system/building-backends/08-migrating.md#the-scaffolder-plugin

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
- Open the `dummy` template, add your name and check the log of the backstage backend application
```bash
type=incomingRequest
2024-04-05T12:14:34.973Z rootHttpRouter info ::1 - - [05/Apr/2024:12:14:34 +0000] "POST /api/scaffolder/v2/tasks HTTP/1.1" 201 45 "http://localhost:3000/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36" type=incomingRequest
info: {
  "message": "Q2hhcmxlcw=="
}
info: Q2hhcmxlcw== 
```
