import { createBackend } from '@backstage/backend-defaults';
// import scaffolderTemplatingExtension from './modules/scaffoldTemplateFilters';

/*
import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderTemplatingExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { JsonValue } from '@backstage/types';

export const myModule = createBackendModule({
    pluginId: 'scaffolder',
    moduleId: 'my-custom-filter',
    register(env) {
        env.registerInit({
            deps: {
                // NOT NEEDED: config: coreServices.rootConfig,
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
*/

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
// backend.add(import('@backstage/plugin-scaffolder-node'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://github.com/backstage/backstage/blob/master/docs/auth/guest/provider.md

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// Use internal module
backend.add(import('@internal/backend-module-scaffolder-my-custom-filter'));

// Add the module declared within a sub-path: scaffoldTemplateFilters
//backend.add(scaffolderTemplatingExtension());

// Using module declared locally
// backend.add(myModule);

backend.start();
