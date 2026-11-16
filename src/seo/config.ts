/** Change this one value when the permanent domain is ready. */
export const SITE_URL = 'https://baagh.vercel.app';
export const absoluteUrl = (path: string) => new URL(path, `${SITE_URL}/`).href;

/** Public verification tokens, never secrets. Empty values emit no tags. */
export const verification = {
  google: import.meta.env?.VITE_GOOGLE_SITE_VERIFICATION ?? '',
  bing: import.meta.env?.VITE_BING_SITE_VERIFICATION ?? '',
};
