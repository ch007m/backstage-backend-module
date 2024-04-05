import {coreServices, createBackendModule} from '@backstage/backend-plugin-api';
import {scaffolderTemplatingExtensionPoint} from '@backstage/plugin-scaffolder-node';
import {JsonValue} from '@backstage/types';

export default createBackendModule({
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
                    {base64: (...args: JsonValue[]) => btoa(args.join(""))}
                );
            },
        });
    },
});
