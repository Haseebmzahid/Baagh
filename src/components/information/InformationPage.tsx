import React, { useEffect, useRef } from 'react';
import { sitePages, type SitePageId } from '../../data/sitePages';
import { Button, CommercialPage, PageContainer } from '../commercial/primitives';
import { FruitPhoto } from '../commercial/FruitPhoto';
import { whatsappHref } from '../../data/catalogue';
import { SiteFooter } from './SiteFooter';
import './information.css';

export const InformationPage: React.FC<{ page: SitePageId; onNavigateRoute: (path: string) => void }> = ({ page, onNavigateRoute }) => {
  const content = sitePages[page];
  const heading = useRef<HTMLHeadingElement>(null);
  const story = page === 'our-story';
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [page]);
  const internal = (event: React.MouseEvent, path: string) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); onNavigateRoute(path);
  };
  return <CommercialPage>
    <PageContainer>
      <main id="page-content" className={`information-page ${story ? 'information-story' : ''}`}>
        <div className="information-breadcrumb"><a href="/everyday-fresh" onClick={event => internal(event, '/everyday-fresh')}>BAAGH</a><span aria-hidden="true"> / </span><span>{content.label}</span></div>
        <header className="information-hero">
          <div><p className="information-eyebrow">{content.eyebrow}</p><h1 ref={heading} tabIndex={-1}>{content.title}</h1><p className="information-intro">{content.intro}</p>
          {story && <a className="information-text-link" href="/everyday-fresh" onClick={event => internal(event, '/everyday-fresh')}>Discover Everyday Fresh <span aria-hidden="true">↗</span></a>}
          </div>
          {story && <figure className="information-orchard"><FruitPhoto fruit="chaunsa" ratio="4 / 3" priority alt="Golden mangoes gathered in wooden orchard crates" /><figcaption>The fruit. The source. The care between.</figcaption></figure>}
        </header>
        <div className="information-layout">
          <aside className="information-aside">
            <nav className="information-glass" aria-label="On this page"><span className="information-eyebrow">In this chapter</span>{content.sections.map((section, index) => <a key={section.title} href={`#section-${index + 1}`} onClick={event => {
              event.preventDefault(); const target = document.getElementById(`section-${index + 1}`); target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); target?.focus({ preventScroll: true });
            }}><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</a>)}</nav>
          </aside>
          <article className="information-sections" aria-label={content.label}>
            {content.sections.map((section, index) => <section key={section.title} id={`section-${index + 1}`} tabIndex={-1}>
              <span className="information-section-number">{String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2><p>{section.body}</p>
              {page === 'contact' && index === 0 && <div className="information-actions"><Button variant="primary" href={whatsappHref('Hello BAAGH — I would like some help with a fruit enquiry.')}>Chat on WhatsApp ↗</Button><Button variant="secondary" href="tel:+923044323073">Call BAAGH</Button></div>}
              {page === 'contact' && index === 1 && <a className="information-text-link" href="/signature#corporate" onClick={event => internal(event, '/signature#corporate')}>Corporate gifting enquiry ↗</a>}
              {story && index === 2 && <a className="information-text-link" href="/signature" onClick={event => internal(event, '/signature')}>Explore Signature ↗</a>}
              {story && index === 3 && <a className="information-text-link" href="/fruit-intelligence/chaunsa" onClick={event => internal(event, '/fruit-intelligence/chaunsa')}>Read a Chaunsa ↗</a>}
              {page === 'privacy-policy' && index === 2 && <a className="information-text-link" href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">WhatsApp privacy policy ↗</a>}
              {page === 'privacy-policy' && index === 3 && <a className="information-text-link" href="https://developers.google.com/fonts/faq/privacy" target="_blank" rel="noopener noreferrer">Google Fonts privacy information ↗</a>}
            </section>)}
          </article>
        </div>
        <section className="information-closing"><p className="information-eyebrow">Here to help</p><h2>{story ? 'Find something good.' : 'A question worth asking?'}</h2><div className="information-actions"><Button variant="primary" href="/everyday-fresh" onClick={event => internal(event, '/everyday-fresh')}>Shop the collection</Button><Button variant="secondary" href={whatsappHref('Hello BAAGH — I have a question.')}>Ask BAAGH on WhatsApp ↗</Button></div></section>
      </main>
      <SiteFooter onNavigateRoute={onNavigateRoute} />
    </PageContainer>
  </CommercialPage>;
};
