import { manifests as propertyManifests } from './property/manifests.js';
import { manifests as modalManifests } from './modal/manifests.js';
import { manifests as languageManifests } from './lang/manifests.js';

export const manifests = [...propertyManifests, ...modalManifests, ...languageManifests];
