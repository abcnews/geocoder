import { h, FunctionalComponent } from 'preact';
import { useEffect } from 'preact/hooks';
import styles from './styles.scss';

type ErrorBoxProps = {
  error: Error;
}

const ErrorBox: FunctionalComponent<ErrorBoxProps> = ({ error }) => {
  useEffect(() => console.log(error), []);

  return <pre className={styles.root}>{`${String(error)}\n\n${error.stack}`}</pre>;
};

export default ErrorBox;
