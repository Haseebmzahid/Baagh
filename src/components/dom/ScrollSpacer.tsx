import React from 'react';
import { useScroll } from '../../context/ScrollContext';

export const ScrollSpacer: React.FC = () => {
  const { journeyLength } = useScroll();

  return (
    <div
      aria-hidden="true"
      data-spacer="true"
      style={{
        height: `${journeyLength}vh`,
        width: '100%',
        pointerEvents: 'none',
        visibility: 'hidden',
      }}
    />
  );
};
