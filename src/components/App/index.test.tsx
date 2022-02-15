import { h } from 'preact';
import render from 'preact-render-to-string';
import htmlLooksLike from 'html-looks-like';
import App from '.';
import type { AppProps } from '.';

describe('App', () => {
  test('It renders', () => {
    const props: AppProps = { x: 42, y: 'text', z: true };
    const actual = render(<App {...props} />);
    const expected = `
      <div>
        {{ ... }}
        <pre>${JSON.stringify(props)}</pre>
        <h1>geocoder</h1>
      </div>
    `;

    htmlLooksLike(actual, expected);
  });
});
