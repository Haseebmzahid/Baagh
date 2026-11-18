import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { readBootstrap } from './seo/bootstrap';
import './index.css';

const root = document.getElementById('root') as HTMLElement;
const bootstrap = readBootstrap();
if (bootstrap) {
  // Resolve the same real component before hydration: no loading-shell swap.
  const preload = bootstrap.pathname === '/product/mangoes/chaunsa'
    ? import('./components/commercial/ProductDetail').then(({ ProductDetail }) => ({ ProductPage: ProductDetail }))
    : bootstrap.pathname === '/signature'
      ? import('./components/commercial/Signature').then(({ Signature }) => ({ SignaturePage: Signature }))
      : bootstrap.pathname === '/our-story'
        ? import('./components/information/InformationPage').then(({ InformationPage }) => ({ StoryPage: InformationPage }))
        : Promise.resolve({});
  void preload.then((pages) => {
    ReactDOM.hydrateRoot(root, <React.StrictMode><App bootstrap={bootstrap} {...pages} /></React.StrictMode>, {
      onRecoverableError(error) {
        const diagnostics = window as Window & { __baaghHydrationErrors?: string[] };
        (diagnostics.__baaghHydrationErrors ??= []).push(String(error));
        console.error(error);
      },
    });
  });
} else {
  ReactDOM.createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
}
