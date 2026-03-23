import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundry';
import './styles/globals.scss';
import { DialogProvider } from '@midwest-diesel/mwd-ui';


const app = createRoot(document.getElementById('root')!);
const queryClient = new QueryClient();
const queryOptions = {
  refetchOnWindowFocus: false,
  keepPreviousData: true
};
queryClient.setDefaultOptions({ queries: queryOptions });

app.render(
  <BrowserRouter>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <DialogProvider>
            <App />
          </DialogProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
);
