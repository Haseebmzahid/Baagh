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
  SpecimenPlate,
  useCommercialLayout,
  useHasPointer,
  usePrefersReducedMotion,
  WhatsAppButton,
} from './primitives';
import { PageFooter } from './EverydayFresh';
import { PresentationBox } from './PresentationBox';
import {
  boxSpecification,
  corporateFacts,
  giftBoxes,
  PRICE_NOTE,
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
  const [quoteOpen, setQuoteOpen] = useState(false);

  const openQuote = () => {
    setQuoteOpen(true);
    // Give the panel a frame to mount before moving to it.
    requestAnimationFrame(() => {
      document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <CommercialPage deep>
      <SignatureHero onRequestQuote={openQuote} />

      <PageContainer>
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
  const { isMobile, margin } = useCommercialLayout();
  const reduced = usePrefersReducedMotion();

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? '78vh' : '86vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        marginBottom: isMobile ? '0' : '20px',
      }}
    >
      {/* The drifting plate. Mobile reduces the drift to a single slow zoom. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(62% 58% at 52% 36%, rgba(217,155,52,.30) 0%, rgba(24,18,11,.72) 54%, #100f0a 100%)',
          animation: reduced
            ? undefined
            : `baaghSignatureDrift ${isMobile ? 40 : c.motion.l1.signatureDriftSeconds}s ease-in-out infinite`,
        }}
      />

      {/* Sheen — removed on mobile, per the approved recomposition. */}
      {!isMobile && !reduced && (
        <div
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

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: `${c.layout.maxWidth}px`,
          margin: '0 auto',
          padding: `0 ${margin}px ${isMobile ? 56 : 84}px`,
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
            href="#collections"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            View collections
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

const CollectionsSection: React.FC = () => {
  const { isMobile, isTablet, gutter, margin } = useCommercialLayout();
  const [lead, ...rest] = signatureCollections;

  return (
    <Section
      id="collections"
      eyebrow="Collections"
      title="Three, and only three at a time."
      lead="Each collection closes when its fruit does. Nothing is carried over."
      bleed={isMobile}
    >
      {isMobile ? (
        // Full-bleed, one collection per screen.
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {signatureCollections.map((s) => (
            <FullBleedCollection key={s.id} collection={s} margin={margin} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            // Tablet stacks 1 + 2; desktop gives the lead collection the wide cell.
            gridTemplateColumns: isTablet ? '1fr' : 'minmax(0,1.45fr) minmax(0,1fr)',
            gap: `${gutter}px`,
          }}
        >
          <LeadCollection collection={lead} />

          <div style={{ display: 'grid', gap: `${gutter}px`, alignContent: 'start' }}>
            {rest.map((s) => (
              <SmallCollection key={s.id} collection={s} />
            ))}
            <PlaceholderNote />
          </div>
        </div>
      )}
    </Section>
  );
};

type Collection = (typeof signatureCollections)[number];

const LeadCollection: React.FC<{ collection: Collection }> = ({ collection }) => {
  const [hover, setHover] = useState(false);
  const hasPointer = useHasPointer();
  const reduced = usePrefersReducedMotion();
  const lift = hover && hasPointer && !reduced ? 1 : 0;

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative' }}
    >
      <SpecimenPlate tint={collection.tint} ratio="4 / 3" lift={lift} drift />

      <span style={{ position: 'absolute', top: '16px', left: '17px' }}>
        <span
          style={{
            fontFamily: c.font.mono,
            fontSize: '8.5px',
            letterSpacing: c.type.u2.letterSpacing,
            textTransform: 'uppercase',
            color: c.color.gold80,
          }}
        >
          {collection.index}
          {collection.status ? ` · ${collection.status}` : ''}
        </span>
      </span>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '24px',
          flexWrap: 'wrap',
          marginTop: '22px',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: c.font.serif,
              fontSize: 'clamp(21px, 2vw, 26px)',
              fontWeight: 300,
              color: c.color.paperWarm,
              margin: 0,
            }}
          >
            {collection.title}
          </h3>
          <p
            style={{
              fontFamily: c.font.serif,
              fontSize: '16px',
              fontWeight: 300,
              lineHeight: 1.6,
              color: c.color.ink62,
              margin: '11px 0 0',
              maxWidth: '38ch',
              textWrap: 'pretty' as React.CSSProperties['textWrap'],
            }}
          >
            {collection.purpose}
          </p>
        </div>

        <Price amount={collection.from} from note={PRICE_NOTE || undefined} />
      </div>
    </article>
  );
};

const SmallCollection: React.FC<{ collection: Collection }> = ({ collection }) => (
  <article
    style={{
      display: 'grid',
      gridTemplateColumns: '108px minmax(0,1fr)',
      gap: '18px',
      alignItems: 'center',
      paddingBottom: '22px',
      borderBottom: `1px solid ${c.color.hair12}`,
    }}
  >
    <SpecimenPlate tint={collection.tint} ratio="1 / 1" />
    <div>
      <span
        style={{
          fontFamily: c.font.mono,
          fontSize: '8.5px',
          letterSpacing: c.type.u2.letterSpacing,
          textTransform: 'uppercase',
          color: collection.closing ? c.color.emberText : c.color.ink42,
        }}
      >
        {collection.index}
        {collection.status ? ` · ${collection.status}` : ''}
      </span>
      <h3
        style={{
          fontFamily: c.font.serif,
          fontSize: '19px',
          fontWeight: 300,
          color: c.color.paperWarm,
          margin: '9px 0 0',
        }}
      >
        {collection.title}
      </h3>
      <span style={{ display: 'block', marginTop: '9px' }}>
        <Fact quiet>from PKR {collection.from}</Fact>
      </span>
    </div>
  </article>
);

const FullBleedCollection: React.FC<{ collection: Collection; margin: number }> = ({
  collection,
  margin,
}) => (
  <article>
    <div style={{ position: 'relative' }}>
      <SpecimenPlate tint={collection.tint} ratio="4 / 5" drift />
      <span style={{ position: 'absolute', top: '15px', left: `${margin}px` }}>
        <span
          style={{
            fontFamily: c.font.mono,
            fontSize: '8.5px',
            letterSpacing: c.type.u2.letterSpacing,
            textTransform: 'uppercase',
            color: collection.closing ? c.color.emberText : c.color.gold80,
          }}
        >
          {collection.index}
          {collection.status ? ` · ${collection.status}` : ''}
        </span>
      </span>
    </div>

    <div style={{ padding: `20px ${margin}px 0` }}>
      <h3
        style={{
          fontFamily: c.font.serif,
          fontSize: '23px',
          fontWeight: 300,
          color: c.color.paperWarm,
          margin: 0,
        }}
      >
        {collection.title}
      </h3>
      <p
        style={{
          fontFamily: c.font.serif,
          fontSize: '16px',
          fontWeight: 300,
          lineHeight: 1.6,
          color: c.color.ink62,
          margin: '11px 0 16px',
          textWrap: 'pretty' as React.CSSProperties['textWrap'],
        }}
      >
        {collection.purpose}
      </p>
      <Price amount={collection.from} from note={PRICE_NOTE || undefined} />
    </div>
  </article>
);

// ===========================================================================
// The box — packaging story, L1 lid lift
// ===========================================================================

const BoxSection: React.FC = () => {
  const { isMobile, isTablet, gutter } = useCommercialLayout();
  const stacked = isMobile || isTablet;

  return (
    <Section eyebrow="The box" title="Built for one journey, then kept.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: stacked ? '1fr' : 'minmax(0,1.2fr) minmax(0,1fr)',
          gap: stacked ? '32px' : `${gutter}px 64px`,
          alignItems: 'center',
        }}
      >
        <PresentationBox />

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
  const { isMobile, isTablet, gutter } = useCommercialLayout();

  return (
    <Section title="Gift boxes" lead="Three sizes. A hand-written card is included with each.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : isTablet
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(3, minmax(0, 1fr))',
          gap: `${isMobile ? 40 : gutter}px ${gutter}px`,
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
        <SpecimenPlate tint={box.tint} ratio="4 / 5" lift={lift} label="Packaging placeholder" />
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
  const { isMobile, isTablet } = useCommercialLayout();
  const stacked = isMobile || isTablet;

  return (
    <Section>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: stacked ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
          gap: stacked ? '30px' : '64px',
          alignItems: 'center',
        }}
      >
        <div>
          <Label gold>Seasonal · closing 31 August</Label>

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
            The last of the Chaunsa, boxed for the table.
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
            A limited run assembled while the window is still open. When the fruit stops, the
            collection closes.
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

        <SpecimenPlate tint="#8c5a3c" ratio={stacked ? '3 / 2' : '4 / 3'} drift label="Seasonal placeholder" />
      </div>
    </Section>
  );
};

// ===========================================================================
// Corporate gifting
// ===========================================================================

const CorporateSection: React.FC<{ onRequestQuote: () => void }> = ({ onRequestQuote }) => {
  const { isMobile, isTablet } = useCommercialLayout();
  const stacked = isMobile || isTablet;

  return (
    <Section eyebrow="Corporate gifting" title="Volume, dated delivery, one contact.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: stacked ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
          gap: stacked ? '32px' : '64px',
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
  const { isMobile } = useCommercialLayout();
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
    <div id="quote" style={{ paddingTop: isMobile ? '48px' : '64px' }}>
      <Glass
        tier="shelf"
        style={{
          padding: isMobile ? '24px 20px' : '34px 36px',
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
  const { isMobile } = useCommercialLayout();

  return (
    <Section>
      <div style={{ borderTop: `1px solid ${c.color.hair14}`, paddingTop: isMobile ? '44px' : '64px' }}>
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
