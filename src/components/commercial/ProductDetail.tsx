import React, { useMemo, useState } from 'react';
import { commercial as c } from './theme';
import {
  Button,
  CommercialPage,
  Fact,
  Glass,
  Hairline,
  Label,
  PageContainer,
  PlaceholderNote,
  Price,
  QuantityStepper,
  Section,
  StateMark,
  useCommercialLayout,
  WhatsAppButton,
} from './primitives';
import { ProductCard } from './ProductCard';
import { PageFooter } from './EverydayFresh';
import { ProductSpecimen } from './ProductSpecimen';
import {
  getProduct,
  orderAssurances,
  PRICE_NOTE,
  relatedTo,
} from '../../data/catalogue';
import type { Pack, Product } from '../../data/catalogue';

/**
 * PRODUCT DETAIL — /product/:category/:slug
 * =========================================
 *
 * Approved Stage 02 reference:
 *   Design prototype/commercial/BAAGH Product Detail.html
 *
 * Chaunsa is the visual exemplar, NOT the implementation. Everything on this
 * page is read from the catalogue, so any product with a data entry renders
 * through the same template.
 *
 * This is the decision step. Fruit Intelligence stays a separate destination —
 * the page links to it, it does not embed it.
 */

export interface ProductDetailProps {
  categorySlug: string;
  slug: string;
  onNavigateRoute: (path: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  categorySlug,
  slug,
  onNavigateRoute,
}) => {
  const product = useMemo(() => getProduct(categorySlug, slug), [categorySlug, slug]);

  if (!product) {
    return <NotFound slug={slug} onNavigateRoute={onNavigateRoute} />;
  }

  return <ProductDetailView product={product} onNavigateRoute={onNavigateRoute} />;
};

// ===========================================================================

const ProductDetailView: React.FC<{
  product: Product;
  onNavigateRoute: (path: string) => void;
}> = ({ product, onNavigateRoute }) => {
  const { isMobile, isTablet, gutter } = useCommercialLayout();
  const stacked = isMobile || isTablet;

  const packs: Pack[] = product.packs ?? [
    { id: 'default', label: product.packSize, short: product.packSize, price: product.price, note: product.packSize },
  ];

  // The default pack is the one the card advertises, so the price the reader
  // arrived with is the price they land on.
  const [packId, setPackId] = useState(
    () => packs.find((p) => p.price === product.price)?.id ?? packs[0].id
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const pack = packs.find((p) => p.id === packId) ?? packs[0];
  const closed = product.state === 'closed';
  const related = useMemo(() => relatedTo(product), [product]);

  const orderMessage = `Hello BAAGH — I would like to order ${product.name} (${pack.label}), quantity ${quantity}.`;

  const selectPack = (id: string) => {
    setPackId(id);
    setAdded(false);
  };

  const orderBlock = (
    <OrderBlock
      product={product}
      packs={packs}
      pack={pack}
      packId={packId}
      onSelectPack={selectPack}
      quantity={quantity}
      onQuantity={(n) => {
        setQuantity(n);
        setAdded(false);
      }}
      added={added}
      onAdd={() => setAdded(true)}
      orderMessage={orderMessage}
      closed={closed}
    />
  );

  return (
    <CommercialPage>
      <PageContainer>
        <Breadcrumb product={product} onNavigateRoute={onNavigateRoute} />

        {/* ---- Specimen + order ------------------------------------------- */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: stacked ? '1fr' : 'minmax(0,1.05fr) minmax(0,1fr)',
            gap: stacked ? '36px' : '64px',
            alignItems: 'start',
            paddingTop: isMobile ? '20px' : '32px',
          }}
        >
          <div style={{ position: 'relative' }}>
            <ProductSpecimen product={product} ratio={stacked ? '4 / 3' : '1 / 1'} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Label gold>{closed ? 'Out of season' : 'In season · peak week'}</Label>
              <StateMark state={product.state} label={product.stateLabel} />
            </div>

            <h1
              style={{
                fontFamily: c.font.serif,
                fontSize: c.type.d1.size,
                fontWeight: c.type.d1.weight,
                lineHeight: c.type.d1.lineHeight,
                letterSpacing: c.type.d1.letterSpacing,
                color: c.color.ink,
                margin: '20px 0 0',
                textWrap: 'balance' as React.CSSProperties['textWrap'],
              }}
            >
              {product.name}
            </h1>

            {/* The three facts, in mono, exactly as the sheet allocates them. */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 26px',
                margin: '24px 0 0',
              }}
            >
              <Fact>{product.variety}</Fact>
              <Fact>{product.origin}</Fact>
              <Fact quiet>{product.season}</Fact>
            </div>

            {product.lead && (
              <p
                style={{
                  fontFamily: c.font.serif,
                  fontSize: c.type.b1.size,
                  fontWeight: c.type.b1.weight,
                  lineHeight: c.type.b1.lineHeight,
                  color: c.color.ink70,
                  margin: '26px 0 0',
                  maxWidth: '46ch',
                  textWrap: 'pretty' as React.CSSProperties['textWrap'],
                }}
              >
                {product.lead}
              </p>
            )}

            {/* Desktop and tablet keep the order block in the column. Mobile
                moves it to the sticky bar at the foot of the viewport. */}
            {!isMobile && <div style={{ marginTop: '36px' }}>{orderBlock}</div>}
          </div>
        </section>

        {/* Mobile: the order block lives inline as well, so the reader can act
            without waiting for the sticky bar to be noticed. */}
        {isMobile && <div style={{ marginTop: '36px' }}>{orderBlock}</div>}

        {/* ---- Quality standard ------------------------------------------- */}
        <Section eyebrow="How this fruit is chosen" title={product.standardTitle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: stacked ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
              gap: stacked ? '28px' : `${gutter}px 64px`,
            }}
          >
            <p
              style={{
                fontFamily: c.font.serif,
                fontSize: c.type.b1.size,
                fontWeight: c.type.b1.weight,
                lineHeight: c.type.b1.lineHeight,
                color: c.color.ink70,
                margin: 0,
                maxWidth: '46ch',
                textWrap: 'pretty' as React.CSSProperties['textWrap'],
              }}
            >
              {product.standardBody}
            </p>

            <div>
              <dl style={{ margin: 0, display: 'grid', gap: '20px' }}>
                <StandardFact term="Selection" value={product.selectionNote} />
                <StandardFact term="Ripeness" value={product.ripenessNote} />
              </dl>

              <div style={{ marginTop: '32px' }}>
                {product.fruitIntelligence ? (
                  <>
                    <Button
                      variant="tertiary"
                      href={product.fruitIntelligence}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigateRoute(product.fruitIntelligence!);
                      }}
                    >
                      Learn how we select it
                    </Button>
                    <div style={{ marginTop: '10px' }}>
                      <PlaceholderNote>
                        Opens Fruit Intelligence — the full experience, unchanged
                      </PlaceholderNote>
                    </div>
                  </>
                ) : (
                  <PlaceholderNote>
                    A Fruit Intelligence study for this fruit is not yet built
                  </PlaceholderNote>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Related + Signature cross-link ------------------------------ */}
        <Section
          title="Also ready now"
          action={
            <Button
              variant="tertiary"
              href="/everyday-fresh"
              onClick={(e) => {
                e.preventDefault();
                onNavigateRoute('/everyday-fresh');
              }}
            >
              All of Everyday Fresh
            </Button>
          }
        >
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
            {related.map((r) => (
              <ProductCard
                key={r.id}
                product={r}
                landscape={isMobile}
                onOpen={(p) => onNavigateRoute(p.href)}
              />
            ))}
          </div>

          <SignatureCrossLink onNavigateRoute={onNavigateRoute} />
        </Section>

        <PageFooter
          onNavigateRoute={onNavigateRoute}
          left="Product detail · Commercial, not Intelligence"
        />
      </PageContainer>

      {/* Mobile sticky order bar, on G3 glass. Order actions never scroll out
          of reach — the approved mobile recomposition. */}
      {isMobile && (
        <MobileOrderBar
          product={product}
          pack={pack}
          orderMessage={orderMessage}
          added={added}
          onAdd={() => setAdded(true)}
          closed={closed}
        />
      )}
    </CommercialPage>
  );
};

// ===========================================================================
// Breadcrumb
// ===========================================================================

const Breadcrumb: React.FC<{
  product: Product;
  onNavigateRoute: (path: string) => void;
}> = ({ product, onNavigateRoute }) => {
  const categoryLabel =
    product.categorySlug.charAt(0).toUpperCase() + product.categorySlug.slice(1);

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        flexWrap: 'wrap',
        paddingTop: '18px',
      }}
    >
      <BreadcrumbLink label="Everyday Fresh" onClick={() => onNavigateRoute('/everyday-fresh')} />
      <Separator />
      <BreadcrumbLink label={categoryLabel} onClick={() => onNavigateRoute('/everyday-fresh')} />
      <Separator />
      <span
        style={{
          fontFamily: c.font.mono,
          fontSize: '9px',
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: c.color.gold80,
        }}
      >
        {product.name}
      </span>
    </nav>
  );
};

const BreadcrumbLink: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <a
    href="/everyday-fresh"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    style={{
      fontFamily: c.font.mono,
      fontSize: '9px',
      letterSpacing: '.18em',
      textTransform: 'uppercase',
      color: c.color.ink42,
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: '32px',
    }}
  >
    {label}
  </a>
);

const Separator: React.FC = () => (
  <span aria-hidden="true" style={{ color: 'rgba(242,236,224,.24)', fontSize: '10px' }}>
    /
  </span>
);

// ===========================================================================
// Order block — G1 vitrine
// ===========================================================================

const OrderBlock: React.FC<{
  product: Product;
  packs: Pack[];
  pack: Pack;
  packId: string;
  onSelectPack: (id: string) => void;
  quantity: number;
  onQuantity: (n: number) => void;
  added: boolean;
  onAdd: () => void;
  orderMessage: string;
  closed: boolean;
}> = ({
  product,
  packs,
  pack,
  packId,
  onSelectPack,
  quantity,
  onQuantity,
  added,
  onAdd,
  orderMessage,
  closed,
}) => (
  <Glass
    tier="vitrine"
    style={{
      padding: '26px 26px 24px',
      borderRadius: c.radius.plate,
    }}
  >
    {/* Price plate */}
    <Price
      amount={closed ? '—' : pack.price}
      note={closed ? (product.returnsNote ?? 'Returns next season') : `${pack.note}${PRICE_NOTE ? ` · ${PRICE_NOTE} pricing` : ''}`}
      size="detail"
    />

    <div style={{ margin: '26px 0 0' }}>
      <Hairline />
    </div>

    {/* Pack selector */}
    {packs.length > 1 && (
      <div style={{ marginTop: '22px' }}>
        <Label>Pack size</Label>
        <div
          role="group"
          aria-label="Pack size"
          style={{ display: 'flex', gap: '8px', marginTop: '13px', flexWrap: 'wrap' }}
        >
          {packs.map((p) => (
            <PackButton
              key={p.id}
              pack={p}
              active={p.id === packId}
              disabled={closed}
              onClick={() => onSelectPack(p.id)}
            />
          ))}
        </div>
      </div>
    )}

    {/* Quantity + add */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginTop: '24px',
        flexWrap: 'wrap',
      }}
    >
      <QuantityStepper
        value={quantity}
        onChange={onQuantity}
        ariaLabel={`Quantity of ${product.name}`}
      />
      <div style={{ flex: '1 1 180px' }}>
        <Button variant="primary" full disabled={closed} onClick={onAdd}>
          {closed ? 'Out of season' : added ? 'Added to basket' : 'Add to basket'}
        </Button>
      </div>
    </div>

    {/* WhatsApp is a peer of primary, never louder. */}
    <div style={{ marginTop: '12px' }}>
      <WhatsAppButton full message={orderMessage}>
            Order this on WhatsApp
          </WhatsAppButton>
    </div>

    {/* Handling and delivery — explicitly unconfirmed. */}
    <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: `1px solid ${c.color.hair12}` }}>
      <dl style={{ margin: 0, display: 'grid', gap: '9px' }}>
        {orderAssurances.map((a) => (
          <div key={a.label} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
            <dt
              style={{
                fontFamily: c.font.mono,
                fontSize: '9px',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: c.color.ink42,
                minWidth: '68px',
              }}
            >
              {a.label}
            </dt>
            <dd style={{ margin: 0 }}>
              <Fact quiet>{a.value}</Fact>
            </dd>
          </div>
        ))}
      </dl>

      <div style={{ marginTop: '14px' }}>
        <PlaceholderNote>Operational details are placeholders</PlaceholderNote>
      </div>
    </div>
  </Glass>
);

const PackButton: React.FC<{
  pack: Pack;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ pack, active, disabled, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: `${c.control.minTap}px`,
        padding: '0 18px',
        background: 'transparent',
        border: `1px solid ${active ? c.color.gold70 : hover && !disabled ? c.color.hair22 : 'rgba(244,238,226,.2)'}`,
        borderRadius: c.radius.button,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.42 : 1,
        fontFamily: c.font.mono,
        fontSize: '10px',
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: active ? c.color.goldHover : c.color.ink62,
        transition: `color ${c.motion.l3.duration} ${c.motion.l3.ease}, border-color ${c.motion.l3.duration} ${c.motion.l3.ease}`,
      }}
    >
      {pack.label}
    </button>
  );
};

// ===========================================================================
// Mobile sticky order bar — G3 rail
// ===========================================================================

const MobileOrderBar: React.FC<{
  product: Product;
  pack: Pack;
  orderMessage: string;
  added: boolean;
  onAdd: () => void;
  closed: boolean;
}> = ({ product, pack, orderMessage, added, onAdd, closed }) => (
  <div
    style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 40,
      padding: '12px 16px calc(12px + env(safe-area-inset-bottom, 0px))',
      ...(c.glass.rail as React.CSSProperties),
      borderBottom: 'none',
      borderTop: `1px solid ${c.color.hair12}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}
  >
    <div style={{ minWidth: 0, flex: '1 1 auto' }}>
      <span
        style={{
          display: 'block',
          fontFamily: c.font.mono,
          fontSize: '8.5px',
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          color: c.color.ink42,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {closed ? (product.returnsNote ?? 'Out of season') : pack.label}
      </span>
      {!closed && (
        <span
          style={{
            display: 'block',
            marginTop: '3px',
            fontFamily: c.font.serif,
            fontSize: '17px',
            fontWeight: 300,
            color: c.color.paperWarm,
          }}
        >
          PKR {pack.price}
        </span>
      )}
    </div>

    <Button variant="primary" compact disabled={closed} onClick={onAdd}>
      {added ? 'Added' : 'Add'}
    </Button>
    <WhatsAppButton compact message={orderMessage}>
            WhatsApp
          </WhatsAppButton>
  </div>
);

// ===========================================================================
// Signature cross-link
// ===========================================================================

const SignatureCrossLink: React.FC<{ onNavigateRoute: (path: string) => void }> = ({
  onNavigateRoute,
}) => {
  const { isMobile } = useCommercialLayout();

  return (
    <div
      style={{
        marginTop: isMobile ? '48px' : '72px',
        paddingTop: '30px',
        borderTop: `1px solid ${c.color.hair14}`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <Label gold>Gifting</Label>
        <p
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.p1.size,
            fontWeight: c.type.p1.weight,
            color: c.color.paperWarm,
            margin: '13px 0 0',
          }}
        >
          The same fruit, presented
        </p>
      </div>

      <Button
        variant="secondary"
        href="/signature"
        onClick={(e) => {
          e.preventDefault();
          onNavigateRoute('/signature');
        }}
      >
        Signature
      </Button>
    </div>
  );
};

// ===========================================================================
// Standard fact
// ===========================================================================

const StandardFact: React.FC<{ term: string; value?: string }> = ({ term, value }) => {
  if (!value) return null;
  return (
    <div>
      <dt>
        <Label gold>{term}</Label>
      </dt>
      <dd style={{ margin: '10px 0 0' }}>
        <p
          style={{
            fontFamily: c.font.serif,
            fontSize: '16px',
            fontWeight: 300,
            lineHeight: 1.6,
            color: c.color.ink70,
            margin: 0,
          }}
        >
          {value}
        </p>
      </dd>
    </div>
  );
};

// ===========================================================================
// Unknown product — one sentence in italic serif, one tertiary action.
// (Rule 08 · Empty state.)
// ===========================================================================

const NotFound: React.FC<{ slug: string; onNavigateRoute: (path: string) => void }> = ({
  slug,
  onNavigateRoute,
}) => (
  <CommercialPage>
    <PageContainer>
      <div style={{ padding: '120px 0 160px', maxWidth: '48ch' }}>
        <Label gold>Not in the catalogue</Label>
        <p
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.d2.size,
            fontWeight: c.type.d2.weight,
            fontStyle: 'italic',
            lineHeight: 1.3,
            color: c.color.ink70,
            margin: '22px 0 34px',
            textWrap: 'pretty' as React.CSSProperties['textWrap'],
          }}
        >
          We do not have “{slug}” under our name.
        </p>
        <Button
          variant="tertiary"
          href="/everyday-fresh"
          onClick={(e) => {
            e.preventDefault();
            onNavigateRoute('/everyday-fresh');
          }}
        >
          See what is ready today
        </Button>
      </div>
    </PageContainer>
  </CommercialPage>
);
