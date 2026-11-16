import { useState, useEffect } from 'react';

export interface WebGLCapability {
  isSupported: boolean;
  contextType: 'webgl2' | 'webgl' | null;
  errorMessage: string | null;
}

let cachedCapability: WebGLCapability | null = null;

export function useWebGLCapability(): WebGLCapability {
  const [capability, setCapability] = useState<WebGLCapability>(() => checkWebGLSupport());

  useEffect(() => {
    // Also re-check if needed or handle global error event
    const handleContextLost = () => {
      setCapability({
        isSupported: false,
        contextType: null,
        errorMessage: 'WebGL context was lost.',
      });
    };

    window.addEventListener('webglcontextlost', handleContextLost);
    return () => window.removeEventListener('webglcontextlost', handleContextLost);
  }, []);

  return capability;
}

function checkWebGLSupport(): WebGLCapability {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { isSupported: true, contextType: 'webgl2', errorMessage: null };
  }
  if (cachedCapability) return cachedCapability;

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      // The probe is not a render surface. Release it rather than consuming a
      // GPU context for every card, route, and StrictMode initialization.
      gl2.getExtension('WEBGL_lose_context')?.loseContext();
      cachedCapability = { isSupported: true, contextType: 'webgl2', errorMessage: null };
      return cachedCapability;
    }

    cachedCapability = {
      isSupported: false,
      contextType: null,
      errorMessage: 'WebGL is not supported on this browser/device.',
    };
    return cachedCapability;
  } catch (err) {
    return {
      isSupported: false,
      contextType: null,
      errorMessage: err instanceof Error ? err.message : 'Failed to initialize WebGL context.',
    };
  }
}
