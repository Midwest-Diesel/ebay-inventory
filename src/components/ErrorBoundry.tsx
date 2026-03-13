import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode
}

interface ErrorFallbackProps {
  error: Error
}


export default function ErrorBoundary({ children }: Props) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback as any}>
      { children }
    </ReactErrorBoundary>
  );
};


function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div style={{ textAlign: 'center', marginTop: '10rem' }}>
      <h1>{ error.name }</h1>
      <h2>{ error.message }</h2>
      <br />
      {error.stack?.split('at').map((s) => {
        return (
          <p>{'>'} at { s }</p>
        );
      })}
      <br />

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={() => location.reload()}>Reload</button>
        <button
          onClick={() => {
            // push('Home', '/');
            location.reload();
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
}
