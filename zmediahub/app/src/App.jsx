import { AppContext } from './hooks/index.jsx';
import { ToastProvider } from './components/Toast.jsx';
import SiteLayout from './layouts/SiteLayout.jsx';
import AppRoutes from './router/routes.jsx';

export default function App({ config }) {
  return (
    <AppContext.Provider value={{ config }}>
      <ToastProvider>
        <SiteLayout>
          <AppRoutes />
        </SiteLayout>
      </ToastProvider>
    </AppContext.Provider>
  );
}
