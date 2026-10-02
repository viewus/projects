import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { loadConfig } from './services/config.js';
import { DataService } from './services/dataService.js';
import App from './App.jsx';
import './styles/variables.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';
import './styles/compact.css';
import './styles/modal.css';
import './styles/filters.css';
import './styles/mobile.css';
import './styles/app-mobile.css';
import './styles/luxury.css';
import './styles/scrollrow.css';
import './styles/utilities.css';

const root = createRoot(document.getElementById('root'));

async function boot() {
  try {
    const config = await loadConfig(); // applies data/theme.json as CSS variables before first paint
    await DataService.init();
    root.render(
      <StrictMode>
        <HashRouter>
          <App config={config} />
        </HashRouter>
      </StrictMode>,
    );
  } catch (err) {
    console.error(err);
    root.render(
      <div className="fatal">
        <h1>This site could not start</h1>
        <p>The site configuration or data could not be loaded. If you opened index.html directly from disk, run a local web server instead (for example <code>npx serve</code>) and try again.</p>
      </div>,
    );
  }
}
boot();
