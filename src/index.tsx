import acto from '@abcnews/alternating-case-to-object';
import { whenDOMReady } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import { h, render } from 'preact';
import App from './components/App';
import type { AppProps } from './components/App';

let appMountEl: Mount;
let appProps: AppProps;

function renderApp() {
  render(<App {...appProps} />, appMountEl);
}

whenDOMReady.then(() => {
  [appMountEl] = selectMounts('gnafgeocoderbrowser');

  if (appMountEl) {
    appProps = acto(getMountValue(appMountEl)) as AppProps;
    renderApp();
  }
});

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      renderApp();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        if (appMountEl) {
          render(<ErrorBox error={err as Error} />, appMountEl);
        }
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
  console.debug(`[geocoder] public path: ${__webpack_public_path__}`);
}
