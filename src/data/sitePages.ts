import type { SitePageId } from './sitePageRegistry';
export type { SitePageId } from './sitePageRegistry';
export { sitePageForPath } from './sitePageRegistry.ts';
export interface SiteSection { title: string; body: string; items?: string[]; }
export interface SitePage { id: SitePageId; label: string; eyebrow: string; title: string; intro: string; sections: SiteSection[]; }

export const sitePages: Record<SitePageId, SitePage> = {
  'our-story': {
    id: 'our-story', label: 'Our Story', eyebrow: 'The people behind the fruit', title: 'Good fruit.\nConsidered judgement.',
    intro: 'Chosen by people who know fruit. Three generations of wholesale judgement, brought to the everyday table.',
    sections: [
      { title: 'It begins with knowing what to look for.', body: 'A good piece of fruit is more than its colour. The skin, weight, aroma and feel each tell part of the story. BAAGH brings that attention to the fruit we choose and the way we present it.' },
      { title: 'From source to selection.', body: 'Our brand journey follows the fruit from the orchard, through selection and careful handling, to the table. The thought is simple: make the care behind a choice easier to see.' },
      { title: 'Two ways to enjoy BAAGH.', body: 'Everyday Fresh is for the everyday table. Signature is for fruit chosen to be given. Each starts with the fruit; the occasion shapes the presentation.' },
      { title: 'Knowledge, shared.', body: 'Fruit Intelligence opens up the details: a mango’s flesh and stone, a mandarin’s peel and segments, an apple’s core, a pomegranate’s arils. Explore at your own pace, then return to the collection whenever you are ready.' },
    ],
  },
  contact: {
    id: 'contact', label: 'Contact us', eyebrow: 'A conversation with BAAGH', title: 'Let’s talk fruit.',
    intro: 'For an order request, a gift, a question or help with a delivery, speak to us directly.',
    sections: [
      { title: 'WhatsApp or call', body: 'Reach BAAGH on +92 304 4323073. For a fruit order, choose your packs and review your basket first so your request includes the right details.' },
      { title: 'Signature & corporate gifting', body: 'Tell us about the occasion, approximate quantity, destination and preferred date. Our team will confirm what is available and discuss a quote.' },
      { title: 'Help with an existing request', body: 'Use your existing WhatsApp conversation where possible. Include the name used for the request and a short description of what you need help with. Please do not send card details or passwords.' },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy', label: 'Privacy policy', eyebrow: 'Your information', title: 'Privacy, in plain language.',
    intro: 'This notice explains how the current BAAGH website handles your basket, enquiry details and links to other services. Updated 16 November 2026.',
    sections: [
      { title: 'Your basket stays in your browser', body: 'We use browser local storage to remember product identifiers, pack choices and quantities. This lets you return to your basket after a refresh. Your name, phone number, delivery address and order notes are not stored with the saved basket.' },
      { title: 'Details you enter for an enquiry', body: 'The website holds delivery and enquiry fields in application memory while you complete your request. It does not submit these fields to a BAAGH order database. Leaving or refreshing the page may clear them.' },
      { title: 'When you open WhatsApp', body: 'Opening WhatsApp passes the prepared request to WhatsApp to create a message draft. This may include your basket and the personal details you entered. You then choose whether to send that message to BAAGH. WhatsApp operates under its own terms and privacy policy. Information you send to BAAGH is used to respond to your enquiry and discuss or arrange your request.' },
      { title: 'Services used to display the website', body: 'The website currently requests typefaces from Google Fonts. External font and hosting services receive technical connection information, which may include your IP address and browser details. Their own privacy practices apply. The application does not currently include advertising or analytics trackers.' },
      { title: 'Your choices & questions', body: 'You can remove basket items or clear this website’s local storage using your browser settings. To ask about information shared with BAAGH, request correction or deletion, or discuss how long enquiry records are kept, contact us on +92 304 4323073. Do not include sensitive information in an initial message.' },
      { title: 'Changes to this notice', body: 'We will update this notice when the website’s data handling changes, including if online payments, accounts or a backend order service are introduced. Check the date above for the latest update.' },
    ],
  },
  cookies: {
    id: 'cookies', label: 'Cookies & storage', eyebrow: 'Browser preferences', title: 'A basket that remembers.',
    intro: 'A clear explanation of the storage used by this website.',
    sections: [
      { title: 'Local storage for your basket', body: 'BAAGH stores your product, pack and quantity selections under the key baagh.basket.v1 in your browser. This is local storage, rather than a cookie. It remains until replaced or cleared. It does not contain your delivery or contact details.' },
      { title: 'Cookies and external services', body: 'The application does not set advertising or analytics cookies. The hosting environment and external services may handle their own technical data. If you follow a WhatsApp link, that service’s storage and privacy rules apply.' },
      { title: 'Clearing stored selections', body: 'Remove items in your basket to update your saved selection. To remove all stored website data, use your browser’s site-data controls. Blocking local storage still allows shopping during the current visit, but the basket may not survive a refresh.' },
    ],
  },
  terms: {
    id: 'terms', label: 'Ordering terms', eyebrow: 'Before you request', title: 'Clear from the first step.',
    intro: 'The website helps you explore fruit and prepare a request. A basket or WhatsApp draft is not a confirmed order.',
    sections: [
      { title: 'Requests and confirmation', body: 'Review the fruit, packs, quantities and contact details before opening WhatsApp. You must send the message yourself. Our team confirms availability, final prices, delivery charges and timing directly before the request becomes an agreed order.' },
      { title: 'Prices and availability', body: 'Displayed prices are provisional where marked. Seasonal windows are indicative; they are not a live stock count. The basket subtotal excludes delivery charges. Ask the team to confirm the complete price before agreeing to proceed.' },
      { title: 'Fruit and imagery', body: 'Fruit varies naturally in size, colour and appearance. Reference photography and three-dimensional fruit studies illustrate the collection and its characteristics. Gift contents, packaging and any personalization must be confirmed with the team.' },
      { title: 'Payment and changes', body: 'This website does not take online payments. Discuss payment arrangements, changes and cancellations directly with BAAGH. Do not share payment card details through website notes. The team will explain the options applicable to your request.' },
      { title: 'Questions and concerns', body: 'Contact BAAGH on +92 304 4323073 if anything in your request is unclear or if you have a concern about fruit received. These notes do not limit rights that apply under applicable law.' },
    ],
  },
  delivery: {
    id: 'delivery', label: 'Delivery information', eyebrow: 'From request to doorstep', title: 'Delivery, agreed with you.',
    intro: 'Tell us where the fruit needs to go. Our team confirms whether we can deliver, the charge and the timing.',
    sections: [
      { title: 'Check your destination', body: 'Include your complete address and a reachable contact number with the order request. For service-area questions, contact us before building a large order. We do not publish a guaranteed delivery area or fixed delivery fee on the website.' },
      { title: 'Timing and charges', body: 'A preferred date is a request, subject to confirmation. The basket subtotal covers the selected fruit packs only. Delivery fees and the complete amount are confirmed by the team before you agree to proceed.' },
      { title: 'Gifts and multiple addresses', body: 'For gifts, provide the recipient details needed for delivery with their knowledge. For corporate or multi-address requests, discuss destinations, quantities and preferred dates with the team before sharing a full recipient list.' },
    ],
  },
  returns: {
    id: 'returns', label: 'Order support', eyebrow: 'When something needs attention', title: 'We’re here to help.',
    intro: 'If your fruit or delivery needs attention, contact the team directly so we can understand what happened.',
    sections: [
      { title: 'A concern about your fruit', body: 'Use your WhatsApp conversation to describe the issue, the fruit or pack concerned and when it arrived. Clear photographs can help the team assess a quality concern.' },
      { title: 'Changes or cancellations', body: 'Contact us as soon as you need a change. Availability of changes depends on the stage of preparation and delivery. Ask the team to confirm what is possible for your specific request.' },
      { title: 'Replacements and refunds', body: 'The team will review the circumstances and explain any available resolution. This website does not currently process returns or refunds online. Contact us to discuss whether a replacement, refund or another resolution is appropriate. Applicable legal rights remain unaffected.' },
    ],
  },
  help: {
    id: 'help', label: 'Help & FAQs', eyebrow: 'A little guidance', title: 'Good questions. Clear answers.',
    intro: 'Everything you need to make a considered choice and send a clear order request.',
    sections: [
      { title: 'How do I order?', body: 'Choose a fruit, select a pack and quantity, then add it to your basket. Review the basket, enter delivery details and check the prepared message. Open WhatsApp and send it yourself. BAAGH will confirm the details directly.' },
      { title: 'Is my order confirmed when I open WhatsApp?', body: 'No. Opening WhatsApp prepares a draft. Sending the message starts a request; the team still needs to confirm availability, final prices and delivery.' },
      { title: 'Can I order without an account?', body: 'Yes. There is no account registration in the current order-request flow. Your saved basket contains selections only, not your contact or delivery details.' },
      { title: 'Can I send fruit as a gift?', body: 'Explore Signature for gifting enquiries. Ask the team to confirm the fruit, box, recipient details and preferred date. Corporate gifting has its own enquiry section on Signature.' },
      { title: 'What if the 3D experience doesn’t load?', body: 'You can shop Everyday Fresh and use the basket without the 3D experience. Fruit Intelligence also has a lighter reading view, and follows your device’s reduced-motion preference.' },
    ],
  },
};

