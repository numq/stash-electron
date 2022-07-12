import React, {createContext} from 'react';
import {App} from "./react/app/App.js";
import {createRoot} from 'react-dom/client';
import {configureServices} from "./infrastructure/index.mjs";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

const container = document.getElementById('root');
const root = createRoot(container);
const services = configureServices();
export const ServiceContext = createContext({});
root.render(
    <ServiceContext.Provider value={services}><App/></ServiceContext.Provider>
);