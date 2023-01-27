import { ControllersModule } from './js/controllers/_controllersModule';
import { BlipBlockComponent } from './js/blip.block.component';
import { BlipResource } from './js/blip.resource';
import { BlipContentResource } from './js/blip.content.resource';

const ComponentsModule = angular.module('blip.components', [])
    .component(BlipBlockComponent.name, BlipBlockComponent).name;

const ServicesModule = angular.module('blip.services', [])
    .service(BlipContentResource.serviceName, BlipContentResource)
    .service(BlipResource.serviceName, BlipResource).name;

const blip = 'blip';

angular.module(blip, [
    ControllersModule,
    ComponentsModule,
    ServicesModule,
]);

angular.module('umbraco').requires.push(blip);