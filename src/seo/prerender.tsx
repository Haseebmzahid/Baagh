import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../App';
import { ProductDetail } from '../components/commercial/ProductDetail';
import { chaunsaBootstrap } from './bootstrap';

export function prerenderChaunsa() {
  const bootstrap = chaunsaBootstrap();
  const body = renderToString(<React.StrictMode><App bootstrap={bootstrap} ProductPage={ProductDetail} /></React.StrictMode>);
  const state = JSON.stringify(bootstrap).replace(/</g, '\\u003c');
  return { body, state };
}
