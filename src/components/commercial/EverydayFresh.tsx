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
  Section,
  SpecimenPlate,
  useCommercialLayout,
  WhatsAppButton,
} from './primitives';
import { CategoryTile, CollectionCard, ProductCard } from './ProductCard';
import {
  boxes,
  defaultPack,
  featureCopyFor,
  categories,
  featuredProduct,
  filterProducts,
  gridFilters,
  MONTH_INITIALS,
  monthInWindow,
  PRICE_NOTE,
  priceOf,
  routeOf,
  seasonCategories,
  selectionMeta,
  selections,
  windowIsOpen,
  withPriceNote,
  productsInCategory,
} from '../../data/catalogue';
import type { Product } from '../../data/catalogue';
import { useBasket } from '../../context/BasketContext';
import { isOrderable } from '../../data/catalogue';
import { FruitPhoto, fruitPhotos } from './FruitPhoto';
import { EverydayShowcase } from './EverydayShowcase';

/**
 * EVERYDAY FRESH — /everyday-fresh
 * ===============================
 *
 * Approved Stage 02 reference:
 *   Design prototype/commercial/BAAGH Everyday Fresh.html
 *
 * Eight sections, in the approved order:
 *   01 Hero · 02 Availability / season · 03 Categories · 04 Featured selection
 *   05 Product grid · 06 Curated selections · 07 Boxes · 08 Final CTA
 *
 * A single live commercial stage carries the hero and generates cached fruit
 * portraits for the product grid. Shopping remains native DOM with no pinned
 * scroll journey; the existing Fruit Intelligence experience stays separate.
 */

export interface EverydayFreshProps {
  onNavigateRoute: (path: string) => void;
}

export const EverydayFresh: React.FC<EverydayFreshProps> = ({ onNavigateRoute }) => {
  const { isMobile, isTablet, gutter } = useCommercialLayout();

  const portraits = fruitPhotos;

  const openProduct = (product: Product) => onNavigateRoute(routeOf(product));

  return (
    <CommercialPage>
      <EverydayShowcase onNavigateRoute={onNavigateRoute} />
      <PageContainer>

        <p className="shopping-guide">1. Choose your fruit &nbsp; → &nbsp; 2. Select a pack &nbsp; → &nbsp; 3. <a href="/basket" onClick={(event) => { event.preventDefault(); onNavigateRoute('/basket'); }}>Review basket</a> &amp; request on WhatsApp.<br /><small>Our team confirms availability, final prices and delivery before your order is confirmed. Reference fruit photography; actual fruit and packaging may vary.</small></p>

        <CategoriesSection onNavigateRoute={onNavigateRoute} portraits={portraits} />

        <FeaturedSection onNavigateRoute={onNavigateRoute} portrait={portraits[featuredProduct().id]} />

        <GridSection
          onOpen={openProduct}
          onNavigateRoute={onNavigateRoute}
          isMobile={isMobile}
          isTablet={isTablet}
          gutter={gutter}
          portraits={portraits}
        />

        <SelectionsSection portraits={portraits} />

        <BoxesSection />

        <SeasonSection />

        <FinalCtaSection onNavigateRoute={onNavigateRoute} />

        <PageFooter onNavigateRoute={onNavigateRoute} />
      </PageContainer>
    </CommercialPage>
  );
};

// ===========================================================================
// 02 · AVAILABILITY / SEASON
// ===========================================================================

const SeasonSection: React.FC = () => {
  const { isMobile } = useCommercialLayout();

  return (
    <Section
      index="02"
      title="What the year looks like"
      note="Indicative harvest windows. Availability and timing are confirmed by our team when you enquire."
    >
      <Glass
        tier="shelf"
        style={{
          padding: isMobile ? '20px 16px' : '28px 30px',
          borderRadius: c.radius.plate,
          overflowX: 'auto',
        }}
      >
        <div style={{ minWidth: isMobile ? '460px' : 'auto' }}>
          {/* Month header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `${isMobile ? 66 : 92}px repeat(12, 1fr)`,
              gap: '4px',
              alignItems: 'center',
              paddingBottom: '12px',
            }}
          >
            <span />
            {MONTH_INITIALS.map((m, i) => (
              <span
                key={`${m}-${i}`}
                style={{
                  fontFamily: c.font.mono,
                  fontSize: '9px',
                  letterSpacing: '.1em',
                  textAlign: 'center',
                  color: c.color.ink42,
                }}
              >
                {m}
              </span>
            ))}
          </div>

          <Hairline />

          {/* One row per window */}
          {seasonCategories.map((cat) => {
            const window = cat.window!;
            const open = windowIsOpen(window);
            return (
            <div
              key={cat.id}
              style={{
                display: 'grid',
                gridTemplateColumns: `${isMobile ? 66 : 92}px repeat(12, 1fr)`,
                gap: '4px',
                alignItems: 'center',
                padding: '13px 0',
                borderBottom: `1px solid ${c.color.hair10}`,
              }}
            >
              <span
                style={{
                  fontFamily: c.font.mono,
                  fontSize: '9.5px',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: open ? c.color.gold80 : c.color.ink50,
                }}
              >
                {cat.windowLabel ?? cat.label}
              </span>

              {MONTH_INITIALS.map((_, month) => (
                <span
                  key={month}
                  style={{
                    height: '7px',
                    borderRadius: '1px',
                    background: !monthInWindow(month, window)
                      ? c.color.hair10
                      : open
                        ? c.color.gold70
                        : 'rgba(244,238,226,.26)',
                  }}
                />
              ))}
            </div>
            );
          })}
        </div>
      </Glass>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '28px', marginTop: '20px', flexWrap: 'wrap' }}>
        <LegendKey swatch={c.color.gold70} label="Open now" />
        <LegendKey swatch="rgba(244,238,226,.26)" label="Other windows" />
      </div>
    </Section>
  );
};

const LegendKey: React.FC<{ swatch: string; label: string }> = ({ swatch, label }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
    <span style={{ width: '18px', height: '6px', background: swatch, borderRadius: '1px' }} />
    <span
      style={{
        fontFamily: c.font.mono,
        fontSize: '9px',
        letterSpacing: '.16em',
        textTransform: 'uppercase',
        color: c.color.ink42,
      }}
    >
      {label}
    </span>
  </span>
);

// ===========================================================================
// 03 · CATEGORIES
// Desktop/tablet: a grid. Mobile: a horizontal scroll rail — the approved
// composition, not a shrunken desktop grid.
// ===========================================================================

const CategoriesSection: React.FC<{ onNavigateRoute: (path: string) => void; portraits: Record<string,string> }> = ({ portraits }) => {
  const { isMobile, isTablet, gutter, margin } = useCommercialLayout();

  const tiles = categories.map((cat) => (
    <CategoryTile
      key={cat.id}
      label={cat.label}
      note={cat.note}
      tint={cat.tint}
      portraitSrc={portraits[productsInCategory(cat.id)[0]?.id ?? 'mixed']}
      href={`/everyday-fresh#${cat.slug}`}
      railWidth={isMobile ? 148 : undefined}
      onOpen={() => {
        // Category landing pages are a later phase; the rail scrolls the grid
        // into view rather than promising a route that does not exist.
        document.getElementById('ready-today')?.scrollIntoView({ behavior: 'smooth' });
      }}
    />
  ));

  return (
    <Section
      index="03"
      title="Six ways in"
      bleed={isMobile}
      action={
        <Button
          variant="tertiary"
          href="#ready-today"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('ready-today')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Everything
        </Button>
      }
    >
      {isMobile ? (
        <div
          className="baagh-rail"
          style={{
            display: 'flex',
            gap: `${gutter}px`,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            padding: `0 ${margin}px`,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {tiles}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isTablet
              ? 'repeat(3, minmax(0, 1fr))'
              : 'repeat(6, minmax(0, 1fr))',
            gap: `${gutter}px`,
          }}
        >
          {tiles}
        </div>
      )}
    </Section>
  );
};

// ===========================================================================
// 04 · FEATURED SELECTION
// Desktop: image left, copy right. Tablet/mobile: stacked image over text.
// ===========================================================================

const FeaturedSection: React.FC<{ onNavigateRoute: (path: string) => void; portrait?: string }> = ({
  onNavigateRoute, portrait,
}) => {
  const { isMobile, isTablet } = useCommercialLayout();
  const p = featuredProduct();
  const copy = featureCopyFor(p);
  const pack = defaultPack(p);
  const basket = useBasket();
  const stacked = isMobile || isTablet;

  return (
    <Section index="04" eyebrow="Featured this week">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: stacked ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
          gap: stacked ? '28px' : '56px',
          alignItems: 'center',
        }}
      >
        <a
          href={routeOf(p)}
          onClick={(e) => {
            e.preventDefault();
            onNavigateRoute(routeOf(p));
          }}
          aria-label={`View ${p.name}`}
          style={{ display: 'block' }}
        >
          <SpecimenPlate
            tint={portrait ? '#16150f' : p.image.tint}
            ratio={stacked ? '3 / 2' : '4 / 3'}
            drift
            label={portrait ? undefined : p.image.note}
          >{portrait && <img className="everyday-product-portrait" src={portrait} alt={`${p.name} reference fruit photograph`} />}</SpecimenPlate>
        </a>

        <div>
          <h3
            style={{
              fontFamily: c.font.serif,
              fontSize: c.type.d2.size,
              fontWeight: c.type.d2.weight,
              lineHeight: c.type.d2.lineHeight,
              color: c.color.ink,
              margin: 0,
              maxWidth: '18ch',
              textWrap: 'balance' as React.CSSProperties['textWrap'],
            }}
          >
            {copy.headline}
          </h3>

          <p
            style={{
              fontFamily: c.font.serif,
              fontSize: c.type.b1.size,
              fontWeight: c.type.b1.weight,
              lineHeight: c.type.b1.lineHeight,
              color: c.color.ink70,
              margin: '20px 0 0',
              maxWidth: '46ch',
              textWrap: 'pretty' as React.CSSProperties['textWrap'],
            }}
          >
            {copy.body}
          </p>

          <dl style={{ margin: '28px 0 0', display: 'grid', gap: '10px' }}>
            <FeatureFact term="Variety" value={p.variety} />
            <FeatureFact term="Origin" value={p.origin} />
            <FeatureFact term="Window" value={p.seasonLabel} />
          </dl>

          <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: `1px solid ${c.color.hair12}` }}>
            <Price amount={priceOf(p)} note={withPriceNote(`/ ${pack.label}`)} size="detail" />
          </div>

          <div style={{ display: 'flex', gap: '14px', marginTop: '26px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              disabled={!isOrderable(p) || !pack.available}
              onClick={() => basket.add(p.id, pack.id, 1)}
            >
              Add to basket
            </Button>
            <WhatsAppButton message={`Hello BAAGH — I would like to order ${p.name}.`}>
            WhatsApp
          </WhatsAppButton>
          </div>
        </div>
      </div>
    </Section>
  );
};

const FeatureFact: React.FC<{ term: string; value: string }> = ({ term, value }) => (
  <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
    <dt
      style={{
        fontFamily: c.font.mono,
        fontSize: '9px',
        letterSpacing: '.2em',
        textTransform: 'uppercase',
        color: c.color.ink42,
        minWidth: '74px',
      }}
    >
      {term}
    </dt>
    <dd style={{ margin: 0 }}>
      <Fact>{value}</Fact>
    </dd>
  </div>
);

// ===========================================================================
// 05 · PRODUCT GRID
// Desktop 3 columns with a text cell breaking the matrix; tablet 2; mobile 1
// with landscape 3:2 cards so one fills the screen.
// ===========================================================================

const GridSection: React.FC<{
  onOpen: (p: Product) => void;
  onNavigateRoute: (path: string) => void;
  isMobile: boolean;
  isTablet: boolean;
  gutter: number;
  portraits: Record<string,string>;
}> = ({ onOpen, onNavigateRoute, isMobile, isTablet, gutter, portraits }) => {
  const [filter, setFilter] = useState('all');

  // Both the chips and the products they filter come from the catalogue, so
  // adding a product to a new category adds its chip with no code change.
  const filters = useMemo(() => gridFilters(), []);
  const visible = useMemo(() => filterProducts(filter), [filter]);

  const columns = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <Section
      id="ready-today"
      index="05"
      title="Choose your fruit"
      action={
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              active={filter === f.id}
              onClick={() => setFilter(f.id)}
            />
          ))}
        </div>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: `${isMobile ? 40 : gutter}px ${gutter}px`,
          alignItems: 'stretch',
        }}
      >
        {visible.map((p: Product, i: number) => (
          <React.Fragment key={p.id}>
            <ProductCard product={p} onOpen={onOpen} landscape={isMobile} portraitSrc={portraits[p.id]} />

            {/* The text cell that breaks the matrix — desktop only, after the
                first row, exactly as the approved composition sets it. */}
            {!isMobile && !isTablet && i === 2 && <GridNoteCell />}
          </React.Fragment>
        ))}

        <BoxesPromptCell onNavigateRoute={onNavigateRoute} />
      </div>
    </Section>
  );
};

const FilterChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={active}
      style={{
        height: `${c.control.minTap}px`,
        padding: '0 18px',
        background: 'transparent',
        border: `1px solid ${active ? c.color.gold70 : hover ? c.color.hair22 : c.color.hair12}`,
        borderRadius: c.radius.button,
        cursor: 'pointer',
        fontFamily: c.font.mono,
        fontSize: '9px',
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: active ? c.color.goldHover : hover ? c.color.ink70 : c.color.ink42,
        transition: `color ${c.motion.l3.duration} ${c.motion.l3.ease}, border-color ${c.motion.l3.duration} ${c.motion.l3.ease}`,
      }}
    >
      {label}
    </button>
  );
};

/** Grid rhythm — a text cell that breaks the matrix. */
const GridNoteCell: React.FC = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '32px 0',
      borderTop: `1px solid ${c.color.hair12}`,
      borderBottom: `1px solid ${c.color.hair12}`,
    }}
  >
    <Label gold>Note</Label>
    <p
      style={{
        fontFamily: c.font.serif,
        fontSize: c.type.b2.size,
        fontWeight: c.type.b2.weight,
        fontStyle: 'italic',
        lineHeight: c.type.b2.lineHeight,
        color: 'rgba(244,239,228,.66)',
        margin: '16px 0 0',
        textWrap: 'pretty' as React.CSSProperties['textWrap'],
      }}
    >
      A good choice begins with a closer look. Explore the fruit, then choose the pack that suits your table.
    </p>
  </div>
);

/** "Not sure yet" — routes the undecided reader to the boxes. */
const BoxesPromptCell: React.FC<{ onNavigateRoute: (path: string) => void }> = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '32px 0',
      borderTop: `1px solid ${c.color.hair12}`,
    }}
  >
    <Label>Not sure yet</Label>
    <p
      style={{
        fontFamily: c.font.serif,
        fontSize: c.type.p1.size,
        fontWeight: c.type.p1.weight,
        lineHeight: 1.34,
        color: c.color.paperWarm,
        margin: '14px 0 20px',
        maxWidth: '20ch',
      }}
    >
      Let us choose the week's fruit
    </p>
    <Button
      variant="tertiary"
      href="#boxes"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById('boxes')?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      See the boxes
    </Button>
  </div>
);

// ===========================================================================
// 06 · CURATED SELECTIONS
// ===========================================================================

const SelectionsSection: React.FC<{ portraits: Record<string,string> }> = ({ portraits }) => {
  const { isMobile, isTablet, gutter } = useCommercialLayout();

  return (
    <Section
      index="06"
      eyebrow="Curated"
      title="Chosen for a reason, not for a shelf."
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
        {selections.map((s) => (
          <CollectionCard
            key={s.id}
            title={s.title}
            purpose={s.purpose}
            meta={selectionMeta(s)}
            tint={s.tint}
            portraitSrc={portraits[s.productIds[0]]}
            href="#ready-today"
            onOpen={() => document.getElementById('ready-today')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}
          />
        ))}
      </div>
    </Section>
  );
};

// ===========================================================================
// 07 · BOXES
// ===========================================================================

const BoxesSection: React.FC = () => {
  const { isMobile, isTablet, gutter } = useCommercialLayout();
  const [primary, ...rest] = boxes;

  return (
    <Section id="boxes" index="07" title="Boxes for the week" lead="Weekly or one-off.">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : 'minmax(0,1.4fr) minmax(0,1fr)',
          gap: `${gutter}px`,
        }}
      >
        {/* The lead box, given the wide cell. */}
        <div style={{ position: 'relative' }}>
          <FruitPhoto fruit="mixed" ratio={isMobile ? '3 / 2' : '16 / 10'} />
          {primary.badge && (
            <span
              style={{
                position: 'absolute',
                top: '14px',
                left: '15px',
                fontFamily: c.font.mono,
                fontSize: '8px',
                letterSpacing: c.type.u2.letterSpacing,
                textTransform: 'uppercase',
                color: c.color.gold80,
              }}
            >
              {primary.badge}
            </span>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '20px',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: c.font.serif,
                  fontSize: c.type.p1.size,
                  fontWeight: c.type.p1.weight,
                  color: c.color.paperWarm,
                  margin: 0,
                }}
              >
                {primary.title}
              </h3>
              <p
                style={{
                  fontFamily: c.font.serif,
                  fontSize: '15px',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  color: c.color.ink62,
                  margin: '9px 0 0',
                  maxWidth: '34ch',
                }}
              >
                {primary.purpose}
              </p>
            </div>
            <Price amount={primary.fromPrice} from note={PRICE_NOTE || undefined} />
          </div>
        </div>

        {/* The two remaining boxes, stacked. */}
        <div style={{ display: 'grid', gap: `${gutter}px`, alignContent: 'start' }}>
          {rest.map((b) => (
            <div
              key={b.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '96px minmax(0,1fr)',
                gap: '18px',
                alignItems: 'center',
                paddingBottom: `${gutter}px`,
                borderBottom: `1px solid ${c.color.hair12}`,
              }}
            >
              <FruitPhoto fruit={b.productIds.length === 1 ? b.productIds[0] : 'mixed'} ratio="1 / 1" />
              <div>
                <h3
                  style={{
                    fontFamily: c.font.serif,
                    fontSize: '19px',
                    fontWeight: 300,
                    color: c.color.paperWarm,
                    margin: 0,
                  }}
                >
                  {b.title}
                </h3>
                <span style={{ display: 'block', marginTop: '9px' }}>
                  <Fact quiet>
                    {b.purpose} · from PKR {b.fromPrice}
                  </Fact>
                </span>
              </div>
            </div>
          ))}

          <PlaceholderNote />
        </div>
      </div>
    </Section>
  );
};

// ===========================================================================
// 08 · FINAL CTA
// ===========================================================================

const FinalCtaSection: React.FC<{ onNavigateRoute: (path: string) => void }> = () => {
  const { isMobile } = useCommercialLayout();

  return (
    <Section index="08">
      <div
        style={{
          borderTop: `1px solid ${c.color.hair14}`,
          paddingTop: isMobile ? '44px' : '64px',
        }}
      >
        <h2
          style={{
            fontFamily: c.font.serif,
            fontSize: c.type.d2.size,
            fontWeight: c.type.d2.weight,
            lineHeight: c.type.d2.lineHeight,
            color: c.color.ink,
            margin: 0,
            maxWidth: '22ch',
            textWrap: 'balance' as React.CSSProperties['textWrap'],
          }}
        >
          Tell us what you want. We will confirm what is ready.
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
          }}
        >
          Most orders are placed on WhatsApp. Checkout is there if you prefer it.
        </p>

        <div style={{ display: 'flex', gap: '14px', marginTop: '34px', flexWrap: 'wrap' }}>
          <WhatsAppButton message={'Hello BAAGH — I would like to order this week.'}>
            Order on WhatsApp
          </WhatsAppButton>
          <Button variant="secondary" href="#checkout" disabled>
            Use checkout
          </Button>
        </div>

        <div style={{ marginTop: '22px' }}>
          <PlaceholderNote>
            Checkout arrives in a later phase — ordering runs on WhatsApp for now
          </PlaceholderNote>
        </div>
      </div>
    </Section>
  );
};

// ===========================================================================
// Footer
// ===========================================================================

export const PageFooter: React.FC<{
  onNavigateRoute: (path: string) => void;
  left?: string;
}> = ({ onNavigateRoute, left = 'Everyday Fresh · Prices are placeholders' }) => {
  const { isMobile } = useCommercialLayout();

  return (
    <footer
      style={{
        marginTop: isMobile ? '76px' : '140px',
        paddingBottom: isMobile ? '56px' : '80px',
        paddingTop: '26px',
        borderTop: `1px solid ${c.color.hair12}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}
    >
      <Label>{left}</Label>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <Button
          variant="tertiary"
          href="/signature"
          onClick={(e) => {
            e.preventDefault();
            onNavigateRoute('/signature');
          }}
        >
          Signature
        </Button>
        <Button
          variant="tertiary"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateRoute('/');
          }}
        >
          The journey
        </Button>
      </div>
    </footer>
  );
};
