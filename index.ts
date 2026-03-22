// Redirect to the actual mobile app entry point
import './apps/mobile/src/polyfills/crypto';

import { registerRootComponent } from 'expo';

import App from './apps/mobile/App';

registerRootComponent(App);
