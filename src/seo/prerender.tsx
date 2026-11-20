import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../App';
import { ProductDetail } from '../components/commercial/ProductDetail';
import { chaunsaBootstrap, routeBootstrap, type PrerenderPath } from './bootstrap';
import { Signature } from '../components/commercial/Signature';
import { InformationPage } from '../components/information/InformationPage';
import { loadFruitPage } from '../navigation/loadFruitPage';

export function prerenderChaunsa() {
  const bootstrap = chaunsaBootstrap();
  const body = renderToString(<React.StrictMode><App bootstrap={bootstrap} ProductPage={ProductDetail} /></React.StrictMode>);
  const state = JSON.stringify(bootstrap).replace(/</g, '\\u003c');
  return { body, state };
}

export async function prerenderPage(pathname: PrerenderPath) {
  if (pathname === '/product/mangoes/chaunsa') return prerenderChaunsa();
  const bootstrap = routeBootstrap(pathname);
  const FruitPage = bootstrap.route.view === 'fruit-intelligence' ? (await loadFruitPage()).FruitIntelligence : undefined;
  const body = renderToString(<React.StrictMode><App bootstrap={bootstrap} SignaturePage={Signature} StoryPage={InformationPage} FruitPage={FruitPage} /></React.StrictMode>);
  return { body, state: JSON.stringify(bootstrap).replace(/</g, '\\u003c') };
}
