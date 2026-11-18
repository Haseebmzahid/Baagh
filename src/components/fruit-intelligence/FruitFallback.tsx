import React from 'react';
import type { FruitConfig } from './core/types';
export const FruitFallback: React.FC<{config: FruitConfig; reason?: string | null}> = ({config}) => <div className="fi-static-fruit" role="img" aria-label={config.name} style={{width:'min(46vw, 300px)',aspectRatio:config.fallback.aspectRatio,borderRadius:config.fallback.borderRadius,background:config.fallback.gradient,boxShadow:'0 60px 90px -50px rgba(0,0,0,.9), inset -18px -26px 60px rgba(90,50,10,.5)'}} />;
