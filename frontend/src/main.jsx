import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import SiteGate from "./components/SiteGate.jsx";
import { LanguageProvider } from "./i18n/LanguageContext.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <SiteGate>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SiteGate>
    </LanguageProvider>
  </React.StrictMode>
);




/*Ez kell a fenti helyett, ha a construction page-t le szeretném venni.

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);*/