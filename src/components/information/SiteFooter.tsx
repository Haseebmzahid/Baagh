import React from 'react';
import { sitePageMeta as sitePages, type SitePageId } from '../../data/sitePageRegistry';
import './information.css';

export const SiteFooter: React.FC<{ onNavigateRoute: (path: string) => void }> = ({ onNavigateRoute }) => {
  const link = (id: SitePageId) => <a key={id} href={`/${id}`} onClick={event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onNavigateRoute(`/${id}`);
  }}>{sitePages[id].label}</a>;
  return <footer className="baagh-site-footer" aria-label="About BAAGH and customer information">
    <div><a className="baagh-footer-wordmark" href="/" onClick={event => { event.preventDefault(); onNavigateRoute('/'); }}>BAAGH</a><p>Fruit you never have to doubt.</p><a href="/signature" onClick={event => { event.preventDefault(); onNavigateRoute('/signature'); }}>Discover Signature ↗</a></div>
    <nav aria-label="About and support">{(['our-story', 'contact', 'help', 'delivery'] as SitePageId[]).map(link)}</nav>
    <nav aria-label="Policies">{(['privacy-policy', 'cookies', 'terms', 'returns'] as SitePageId[]).map(link)}</nav>
    <p className="baagh-footer-note">Choose thoughtfully. Request simply.<br />Prices, availability and delivery are confirmed by our team.</p>
  </footer>;
};
