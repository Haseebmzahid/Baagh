import React from 'react';
import { Button, CommercialPage, Label, PageContainer, Section } from './primitives';

export const NotFound: React.FC<{ onNavigateRoute: (path: string) => void }> = ({ onNavigateRoute }) => (
  <CommercialPage>
    <PageContainer>
      <Section title="Let’s find your fruit." lead="This page isn’t available. You can continue shopping or return to your basket.">
        <Label>Page not found · 404</Label>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '28px' }}>
          <Button variant="primary" href="/everyday-fresh" onClick={event => { event.preventDefault(); onNavigateRoute('/everyday-fresh'); }}>Shop Everyday Fresh</Button>
          <Button variant="secondary" href="/basket" onClick={event => { event.preventDefault(); onNavigateRoute('/basket'); }}>View basket</Button>
        </div>
      </Section>
    </PageContainer>
  </CommercialPage>
);
