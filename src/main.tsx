import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './components/App';
import './styles/globals.scss';
import ErrorBoundary from './components/ErrorBoundry';


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
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  </BrowserRouter>
);
