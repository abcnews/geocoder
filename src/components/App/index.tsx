import { h, FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import styles from './styles.scss';
import geocode, { GeocodeResult } from '../../geocode';

export type AppProps = {};

const App: FunctionalComponent<AppProps> = props => {
  let [input, setInput] = useState('');
  let [result, setResult] = useState<GeocodeResult | null>(null);
  let inputOnChange = (evt: Event) => {
    if (evt.target instanceof HTMLInputElement) {
      setInput(evt.target.value);
    }
  };
  useEffect(() => {
    geocode(input, 10).then(result => {
      if (result.input === input) {
        setResult(result);
        console.log({ input, group: result?.group, duration: result?.duration });
      }
    });
  }, [input]);
  return (
    <div className={styles.root}>
      <input type="search" onInput={inputOnChange} autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Enter address" />
      { result ? (
        <ol>
          { result.results.map(r => (
            <li>
              <div class="address">{r.address}</div>
              <div class="details"><span><a href={`https://maps.google.com.au/?q=${r.latitude},${r.longitude}`} target="_blank">Map</a></span> <span>Lat: {r.latitude}</span> <span>Lon: {r.longitude}</span> <span>Score: {+r.score.toFixed(2)}</span></div>
            </li>
          )) }
        </ol>
      ) : undefined }
    </div>
  );
};

export default App;
