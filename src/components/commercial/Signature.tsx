import './responsivePages.css';
import React, { useState } from 'react';
import { commercial as c } from './theme';
import {
  Button,
  CommercialPage,
  Fact,
  Glass,
  Label,
  PageContainer,
  PlaceholderNote,
  Price,
  Section,
  useHasPointer,
  usePrefersReducedMotion,
  WhatsAppButton,
} from './primitives';
import { PageFooter } from './EverydayFresh';
import { FruitPhoto } from './FruitPhoto';
import { ProductCard } from './ProductCard';
import { PresentationBox } from './PresentationBox';
import {
  boxSpecification,
  signatureProducts,
  routeOf,
  corporateFacts,
  giftBoxes,
  PRICE_NOTE,
  seasonalClosure,
  signatureCollections,
  whatsappConfigured,
  whatsappHref,
} from '../../data/catalogue';

/**
 * SIGNATURE — /signature
 * ======================
 *
 * Approved Stage 02 reference:
 *   Design prototype/commercial/BAAGH Signature.html
 *
 * Seven sections, in the approved order:
 *   Hero · Collections · The box · Gift boxes · Seasonal closure ·
 *   Corporate gifting · Closing CTA
 *
 * Signature receives the strongest L1 treatment on the commercial layer: the
 * hero drifts on a 32s loop and the presentation box opens as it is scrolled
 * through. Everything below that stays L2 and L3 — richer than Everyday Fresh,
 * still unmistakably BAAGH, and never spectacle in front of the order.
 */

export interface SignatureProps {
  onNavigateRoute: (path: string) => void;
}

export const Signature: React.FC<SignatureProps> = ({ onNavigateRoute }) => {
  React.useEffect(() => {
    if (window.location.hash === '#corporate') document.getElementById('corporate')?.scrollIntoView({behavior:'instant'});
  },[]);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const openQuote = () => {
    setQuoteOpen(true);
    // Give the panel a frame to mount before moving to it.
    requestAnimationFrame(() => {
      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <CommercialPage deep className="signature-page responsive-commercial">
      <SignatureHero onRequestQuote={openQuote} />

      <PageContainer>
        <p className="shopping-guide">Choose fruit &amp; a pack below, add to your basket, then send a WhatsApp request. Our team confirms prices, availability and delivery.<br /><small>Reference fruit photography; actual fruit and packaging may vary. Gift boxes are available by enquiry.</small></p>
        <Section id="signature-fruit" title="Choose your fruit" lead="Select a fruit to see pack sizes, or add the displayed pack straight to your basket.">
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap:'28px'}}>
            {signatureProducts().map(product => <ProductCard responsive key={product.id} product={product} onOpen={entry => onNavigateRoute(routeOf(entry))} />)}
          </div>
        </Section>
        <CollectionsSection />

        <BoxSection />

        <GiftBoxesSection />

        <SeasonalSection />

        <CorporateSection onRequestQuote={openQuote} />

        {quoteOpen && <QuotePanel onClose={() => setQuoteOpen(false)} />}

        <ClosingSection onRequestQuote={openQuote} />

        <PageFooter
          onNavigateRoute={onNavigateRoute}
          left="Signature · Same brand, deeper grade"
        />
      </PageContainer>
    </CommercialPage>
  );
};

// ===========================================================================
// Hero — L1, camera drift 32s
// ===========================================================================

const SignatureHero: React.FC<{ onRequestQuote: () => void }> = ({ onRequestQuote }) => {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="signature-hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '86vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        marginBottom: '20px',
      }}
    >
      <div className="signature-photo-hero"><FruitPhoto fruit="mixed" ratio="auto" priority /></div>
      {/* The drifting plate. Mobile reduces the drift to a single slow zoom. */}
      <div className="signature-hero-drift"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(62% 58% at 52% 36%, rgba(217,155,52,.05) 0%, rgba(24,18,11,.12) 54%, #100f0a 100%)',
          animation: reduced
            ? undefined
            : `baaghSignatureDrift ${c.motion.l1.signatureDriftSeconds}s ease-in-out infinite`,
        }}
      />

      {/* Sheen — removed on mobile, per the approved recomposition. */}
      {(
        <div className="signature-hero-sheen"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(112deg, rgba(255,255,255,0) 42%, rgba(255,244,222,.05) 52%, rgba(255,255,255,0) 60%)',
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(16,15,10,.4) 0%, rgba(16,15,10,0) 34%, rgba(16,15,10,.86) 100%)',
        }}
      />

      <div className="signature-hero-copy"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: `${c.layout.maxWidth}px`,
          margin: '0 auto',
          padding: '0 56px 84px',
        }}
      >
        <Label gold>Signature</Label>

        <h1
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.d1.size,
            fontWeight: c.type.d1.weight,
            lineHeight: c.type.d1.lineHeight,
            letterSpacing: c.type.d1.letterSpacing,
            color: c.color.ink,
            margin: '24px 0 0',
            maxWidth: '15ch',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
          }}
        >
          Fruit chosen to be given.
        </h1>

        <p
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.b1.size,
            fontWeight: c.type.b1.weight,
            fontStyle: 'italic',
            lineHeight: c.type.b1.lineHeight,
            color: 'rgba(244,239,228,.72)',
            margin: '24px 0 0',
            maxWidth: '44ch',
            textWrap: 'pretty' as React.CSSProperties['textWrap'],
          }}
        >
          The same orchards. A narrower selection, and a box built to carry it.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '38px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            href="#signature-fruit"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('signature-fruit')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
            }}
          >
            Choose fruit & packs
          </Button>
          <Button variant="secondary" onClick={onRequestQuote}>
            Corporate gifting
          </Button>
        </div>
      </div>
    </section>
  );
};

// ===========================================================================
// Collections — three, and only three at a time
// Mobile takes them full-bleed, one per screen.
// ===========================================================================

const CollectionsSection: React.FC = () => (
  <Section id="collections" eyebrow="Collections" title="Three, and only three at a time."
    lead="Each collection closes when its fruit does. Nothing is carried over.">
    <div className="signature-collections">
      {signatureCollections.map((collection, index) => <UnifiedCollection key={collection.id} collection={collection} lead={index === 0} />)}
      <div className="signature-collection-placeholder"><PlaceholderNote /></div>
    </div>
  </Section>
);
type Collection = (typeof signatureCollections)[number];
const UnifiedCollection: React.FC<{ collection: Collection; lead: boolean }> = ({ collection, lead }) => {
  const [hover, setHover] = useState(false);
  const hasPointer = useHasPointer();
  const reduced = usePrefersReducedMotion();
  return <article className={`signature-collection ${lead ? 'signature-collection-lead' : 'signature-collection-secondary'}`}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{ transform: lead && hover && hasPointer && !reduced ? 'translateY(-3px)' : undefined, transition: reduced ? 'none' : 'transform 450ms ease' }}>
    <div className="signature-collection-image"><FruitPhoto fruit={collection.productIds.length > 1 ? 'mixed' : collection.productIds[0]} ratio="4 / 3" /></div>
    <div className="signature-collection-body"><div className="signature-collection-copy">
    <span className="signature-collection-index" data-closing={collection.closing || undefined}>{collection.index}{collection.status ? ` · ${collection.status}` : ''}</span>
      <h3>{collection.title}</h3>
      <a className="collection-shop-link signature-collection-choose" href="#signature-fruit">Choose fruit &amp; packs &#8593;</a>
      <p>{collection.purpose}<br /><a className="collection-shop-link" href={whatsappHref(`Hello BAAGH — I would like to enquire about ${collection.title}. Please confirm contents, availability and price.`)} target="_blank" rel="noopener noreferrer">Enquire about this collection &#8599;</a></p>
    </div>
    <div className="signature-collection-price"><Price amount={collection.fromPrice} from note={PRICE_NOTE || undefined} /></div></div>
  </article>;
};

// ===========================================================================
// The box — packaging story, L1 lid lift
// ===========================================================================

const BoxSection: React.FC = () => {

  return (
    <Section eyebrow="The box" title="Built for one journey, then kept.">
      <div className="signature-box-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
          gap: '28px 64px',
          alignItems: 'center',
        }}
      >
        <PresentationBox tint={signatureCollections[0].tint} />

        <div>
          <p
            style={{
              fontFamily: c.font.serif,
              fontSize: c.type.b1.size,
              fontWeight: c.type.b1.weight,
              lineHeight: c.type.b1.lineHeight,
              color: c.color.ink70,
              margin: 0,
              maxWidth: '44ch',
              textWrap: 'pretty' as React.CSSProperties['textWrap'],
            }}
          >
            Rigid board, cotton lining, and a lid that lifts without tearing. Each fruit sits in
            its own bed.
          </p>

          <dl style={{ margin: '34px 0 0', display: 'grid', gap: '18px' }}>
            {boxSpecification.map((s) => (
              <div
                key={s.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                  paddingBottom: '14px',
                  borderBottom: `1px solid ${c.color.hair12}`,
                }}
              >
                <dt>
                  <Label>{s.label}</Label>
                </dt>
                <dd style={{ margin: 0, textAlign: 'right' }}>
                  <Fact>{s.value}</Fact>
                </dd>
              </div>
            ))}
          </dl>

          <div style={{ marginTop: '20px' }}>
            <PlaceholderNote>Specification placeholder</PlaceholderNote>
          </div>
        </div>
      </div>
    </Section>
  );
};

// ===========================================================================
// Gift boxes — three sizes, card included
// ===========================================================================

const GiftBoxesSection: React.FC = () => {

  return (
    <Section title="Gift boxes" lead="Three sizes. A hand-written card is included with each.">
      <div className="signature-gift-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: `28px 28px`,
        }}
      >
        {giftBoxes.map((g) => (
          <GiftBoxCard key={g.id} box={g} />
        ))}
      </div>
    </Section>
  );
};

const GiftBoxCard: React.FC<{ box: (typeof giftBoxes)[number] }> = ({ box }) => {
  const [hover, setHover] = useState(false);
  const hasPointer = useHasPointer();
  const reduced = usePrefersReducedMotion();
  const lift = hover && hasPointer && !reduced ? 1 : 0;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        transform: lift ? 'translateY(-3px)' : 'translateY(0)',
        transition: `transform ${c.motion.l2.duration} ${c.motion.l2.ease}`,
      }}
    >
      <div style={{ position: 'relative' }}>
        <FruitPhoto fruit={box.productIds.length > 1 ? 'mixed' : box.productIds[0]} ratio="4 / 5" />
        <span
          style={{
            position: 'absolute',
            top: '12px',
            right: '13px',
            fontFamily: c.font.mono,
            fontSize: '8px',
            letterSpacing: c.type.u2.letterSpacing,
            textTransform: 'uppercase',
            color: c.color.gold80,
          }}
        >
          Signature
        </span>
      </div>

      <h3
        style={{
          fontFamily: c.font.serif,
          fontSize: c.type.p1.size,
          fontWeight: c.type.p1.weight,
          color: c.color.paperWarm,
          margin: '20px 0 0',
        }}
      >
        {box.title}
      </h3>

      <span style={{ display: 'block', marginTop: '10px' }}>
        <Fact quiet>{box.purpose}</Fact>
      </span>

      <div
        style={{
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: `1px solid ${c.color.hair12}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          minHeight: `${c.control.minTap}px`,
        }}
      >
        <Price amount={box.price} note={PRICE_NOTE ? `· ${PRICE_NOTE}` : undefined} inlineNote />
        <Button
          variant="tertiary"
          href={whatsappHref(`Hello BAAGH — I would like to order ${box.title} from Signature.`)}
          onClick={whatsappConfigured ? undefined : (e) => e.preventDefault()}
        >
          Enquire
        </Button>
      </div>
    </article>
  );
};

// ===========================================================================
// Seasonal closure
// ===========================================================================

const SeasonalSection: React.FC = () => {

  return (
    <Section>
      <div className="signature-season-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '64px',
          alignItems: 'center',
        }}
      >
        <div>
          <Label gold>{seasonalClosure.eyebrow}</Label>

          <h2
            style={{
              fontFamily: c.font.serif,
              fontSize: c.type.d2.size,
              fontWeight: c.type.d2.weight,
              lineHeight: c.type.d2.lineHeight,
              color: c.color.ink,
              margin: '22px 0 0',
              maxWidth: '20ch',
              textWrap: 'balance' as React.CSSProperties['textWrap'],
            }}
          >
            {seasonalClosure.headline}
          </h2>

          <p
            style={{
              fontFamily: c.font.serif,
              fontSize: c.type.b1.size,
              fontWeight: c.type.b1.weight,
              lineHeight: c.type.b1.lineHeight,
              color: c.color.ink70,
              margin: '20px 0 0',
              maxWidth: '44ch',
              textWrap: 'pretty' as React.CSSProperties['textWrap'],
            }}
          >
            {seasonalClosure.body}
          </p>

          <div style={{ display: 'flex', gap: '14px', marginTop: '32px', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              href="#collections"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See the collection
            </Button>
            <WhatsAppButton message={"Hello BAAGH — I would like to ask about the Season's End collection."}>
            Ask on WhatsApp
          </WhatsAppButton>
          </div>
        </div>

        <FruitPhoto fruit="anaar" ratio={'4 / 3'} />
      </div>
    </Section>
  );
};

// ===========================================================================
// Corporate gifting
// ===========================================================================

const CorporateSection: React.FC<{ onRequestQuote: () => void }> = ({ onRequestQuote }) => {

  return (
    <Section id="corporate" eyebrow="Corporate gifting" title="Volume, dated delivery, one contact.">
      <div className="signature-corporate-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '64px',
          alignItems: 'start',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: c.font.serif,
              fontSize: c.type.b1.size,
              fontWeight: c.type.b1.weight,
              lineHeight: c.type.b1.lineHeight,
              color: c.color.ink70,
              margin: 0,
              maxWidth: '44ch',
              textWrap: 'pretty' as React.CSSProperties['textWrap'],
            }}
          >
            Send a list of recipients and a date. We quote, confirm the fruit, and deliver in one
            window.
          </p>

          <div style={{ marginTop: '30px' }}>
            <Button variant="primary" onClick={onRequestQuote}>
              Request a quote
            </Button>
          </div>
        </div>

        <Glass tier="shelf" style={{ padding: '24px 26px', borderRadius: c.radius.plate }}>
          <dl style={{ margin: 0, display: 'grid', gap: '16px' }}>
            {corporateFacts.map((f) => (
              <div
                key={f.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '18px',
                  paddingBottom: '13px',
                  borderBottom: `1px solid ${c.color.hair12}`,
                }}
              >
                <dt>
                  <Label>{f.label}</Label>
                </dt>
                <dd style={{ margin: 0, textAlign: 'right' }}>
                  <Fact quiet>{f.value}</Fact>
                </dd>
              </div>
            ))}
          </dl>

          <div style={{ marginTop: '18px' }}>
            <PlaceholderNote>No operational promise is made at this stage</PlaceholderNote>
          </div>
        </Glass>
      </div>
    </Section>
  );
};

// ===========================================================================
// Quote request
//
// No backend, no submission endpoint, and nothing is stored. The panel simply
// composes the enquiry into a WhatsApp message, which is the ordering route
// this phase supports.
// ===========================================================================

const QuotePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [recipients, setRecipients] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const message = [
    'Hello BAAGH — I would like a Signature corporate gifting quote.',
    recipients ? `Recipients: ${recipients}` : null,
    date ? `Date needed: ${date}` : null,
    notes ? `Notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <div id="quote" className="signature-quote" style={{ paddingTop: '64px' }}>
      <Glass
        tier="shelf"
        style={{
          padding: '34px 36px',
          borderRadius: c.radius.plate,
          maxWidth: '680px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '20px',
          }}
        >
          <Label gold>Request a quote</Label>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the quote request"
            style={{
              minWidth: `${c.control.minTap}px`,
              minHeight: `${c.control.minTap}px`,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: c.font.mono,
              fontSize: '9px',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: c.color.ink42,
            }}
          >
            Close
          </button>
        </div>

        <p
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.b2.size,
            fontWeight: 300,
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: c.color.ink62,
            margin: '16px 0 26px',
            maxWidth: '46ch',
          }}
        >
          Tell us the shape of it. We will come back with a quote and confirm what the season can
          carry.
        </p>

        <div style={{ display: 'grid', gap: '18px' }}>
          <QuoteField
            id="quote-recipients"
            label="Recipients"
            placeholder="How many, and where"
            value={recipients}
            onChange={setRecipients}
          />
          <QuoteField
            id="quote-date"
            label="Date needed"
            placeholder="The week it should arrive"
            value={date}
            onChange={setDate}
          />
          <QuoteField
            id="quote-notes"
            label="Anything else"
            placeholder="Branding, cards, preferences"
            value={notes}
            onChange={setNotes}
            multiline
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '26px', flexWrap: 'wrap' }}>
          <WhatsAppButton message={message}>
            Send on WhatsApp
          </WhatsAppButton>
        </div>

        <div style={{ marginTop: '18px' }}>
          <PlaceholderNote>
            Nothing is stored — the enquiry opens in WhatsApp for you to send
          </PlaceholderNote>
        </div>
      </Glass>
    </div>
  );
};

const QuoteField: React.FC<{
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}> = ({ id, label, placeholder, value, onChange, multiline }) => {
  const style: React.CSSProperties = {
    width: '100%',
    marginTop: '10px',
    padding: '13px 14px',
    minHeight: multiline ? '84px' : `${c.control.minTap}px`,
    // Rule 03: forms use canvas and hairlines, never glass.
    background: c.color.canvas,
    border: `1px solid ${c.color.hair16}`,
    borderRadius: c.radius.button,
    color: c.color.paperWarm,
    fontFamily: c.font.serif,
    fontSize: '16px',
    fontWeight: 300,
    resize: multiline ? 'vertical' : undefined,
  };

  return (
    <div>
      <label htmlFor={id}>
        <Label>{label}</Label>
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={style}
        />
      )}
    </div>
  );
};

// ===========================================================================
// Closing CTA
// ===========================================================================

const ClosingSection: React.FC<{ onRequestQuote: () => void }> = ({ onRequestQuote }) => {

  return (
    <Section>
      <div className="responsive-closing" style={{ borderTop: `1px solid ${c.color.hair14}`, paddingTop: '64px' }}>
        <h2
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.d2.size,
            fontWeight: c.type.d2.weight,
            lineHeight: c.type.d2.lineHeight,
            color: c.color.ink,
            margin: 0,
            maxWidth: '24ch',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
          }}
        >
          Order it, or ask us what is at its best today.
        </h2>

        <div style={{ display: 'flex', gap: '14px', marginTop: '34px', flexWrap: 'wrap' }}>
          <WhatsAppButton message={'Hello BAAGH — I would like to order from the Signature collection.'}>
            Order on WhatsApp
          </WhatsAppButton>
          <Button variant="secondary" onClick={onRequestQuote}>
            Request a quote
          </Button>
        </div>
      </div>
    </Section>
  );
};
