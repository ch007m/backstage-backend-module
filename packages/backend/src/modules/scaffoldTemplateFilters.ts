import {createBackendModule} from '@backstage/backend-plugin-api';
import {scaffolderTemplatingExtensionPoint} from '@backstage/plugin-scaffolder-node/alpha';
import {JsonValue} from '@backstage/types';

const scaffolderTemplatingExtension = createBackendModule({
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

export default scaffolderTemplatingExtension;
