import React, { useEffect, useId, useRef, useState } from 'react';
import { useBasket } from '../../context/BasketContext';
import { commerce, whatsappConfigured } from '../../data/catalogue';
import { prepareOrderRequest } from '../../basket/orderingService';
import type { DeliveryDetails, DeliveryErrors, RequestItem } from '../../basket/orderRequest';
import { Button, Label } from './primitives';
import './whatsappRequest.css';

/** All personal information lives only in this mounted component's React state.
 * Leaving the step, closing the drawer, navigation or refresh discards it.
 * Never add these fields to BasketContext or its persisted selections. */
export const WhatsAppRequest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { lines, canEnquire } = useBasket();
  const [details, setDetails] = useState<DeliveryDetails>({ name: '', contact: '', address: '', note: '' });
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [preview, setPreview] = useState<{ message: string; whatsappUrl: string; revision: string } | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [requestError, setRequestError] = useState('');
  const prefix = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const items: RequestItem[] = lines.filter((line) => line.available).map((line) => ({
    name: line.product!.name, pack: line.pack!.label, quantity: line.quantity,
    unitPriceMinor: line.unitPrice!,
    provisional: commerce.pricesAreProvisional || line.product!.provisional.includes('price'),
  }));
  // A different tab may update the persisted basket while a request is reviewed.
  // Never open an old message after the visible selection has changed.
  const revision = JSON.stringify({ items, canEnquire, currency: commerce.currency });
  const reviewing = preview !== null && preview.revision === revision && canEnquire;
  const changed = preview !== null && preview.revision !== revision;

  useEffect(() => { heading.current?.focus(); }, [reviewing]);

  const update = (key: keyof DeliveryDetails, value: string) => {
    setRequestError('');
    setDetails((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEnquire || !whatsappConfigured || preparing) return;
    setPreparing(true);
    setRequestError('');
    try {
      const result = await prepareOrderRequest({ items, details, currency: commerce.currency, whatsappNumber: commerce.whatsappNumber });
      if (!result.ok) {
        setErrors(result.fieldErrors);
        setRequestError(result.error);
        const invalid = Object.keys(result.fieldErrors)[0];
        if (invalid) form.current?.querySelector<HTMLElement>(`[name="${invalid}"]`)?.focus();
        return;
      }
      setErrors({});
      setPreview({ message: result.message, whatsappUrl: result.whatsappUrl, revision });
    } catch {
      setRequestError('Your message could not be prepared. Please try again.');
    } finally {
      setPreparing(false);
    }
  };

  const idFor = (key: string) => `${prefix}-${key}`;
  const confirmationNote = <p className="baagh-request-caution">This is an order request, not a confirmed order. Final prices, delivery fees, availability and delivery timing require BAAGH staff confirmation.</p>;
  const fields: Array<{ key: keyof DeliveryDetails; label: string; max: number; hint?: string; multiline?: boolean }> = [
    { key: 'name', label: 'Customer name', max: 100 },
    { key: 'contact', label: 'Contact number', max: 40, hint: 'This can be different from your WhatsApp number.' },
    { key: 'address', label: 'Delivery address', max: 1000, multiline: true, hint: 'Include your area or city and any directions needed to find you.' },
    { key: 'note', label: 'Order note (optional)', max: 500, multiline: true },
  ];

  return <section className="baagh-request" aria-labelledby={idFor('title')}>
    <Label gold>{reviewing ? '02 · Review your message' : '01 · Delivery details'}</Label>
    <h3 ref={heading} tabIndex={-1} id={idFor('title')}>{reviewing ? 'One last look.' : 'Where shall it go?'}</h3>
    <p className="baagh-request-lead">{reviewing
      ? 'Review the message below. Open WhatsApp when you are ready, then send it yourself.'
      : 'Add delivery details so BAAGH can confirm your request.'}</p>
    <p className="baagh-request-privacy" id={idFor('privacy')}>Your details are included in the WhatsApp message you choose to send. This website does not save them.</p>
    {!canEnquire && <p className="baagh-basket-warning" role="alert">Your basket is empty or contains unavailable items. Return to your basket to review it.</p>}
    {!whatsappConfigured && <p className="baagh-basket-warning" role="alert">The business WhatsApp number has not been configured.</p>}
    {changed && <p className="baagh-basket-warning" role="status">Your basket changed. Review your details again to prepare an updated message.</p>}
    {requestError && <p className="baagh-basket-warning" role="alert">{requestError}</p>}
    {reviewing ? <>
      {confirmationNote}
      <pre className="baagh-request-preview" aria-label="WhatsApp message preview">{preview.message}</pre>
      <div className="baagh-request-actions">
        <a className="baagh-request-open" href={preview.whatsappUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Open WhatsApp to review &amp; send</a>
        <Button full variant="secondary" onClick={() => setPreview(null)}>Edit delivery details</Button>
        <button className="baagh-basket-continue" type="button" onClick={onBack}>← Back to basket</button>
      </div>
      <p className="baagh-basket-footnote">Opening WhatsApp does not send your message or confirm an order. Your basket stays here.</p>
    </> : <form ref={form} onSubmit={submit} noValidate autoComplete="off" aria-describedby={idFor('privacy')}>
      <p className="baagh-request-required">All fields are required except the order note.</p>
      {fields.map(({ key, label, max, hint, multiline }) => {
        const props = {
          id: idFor(key), name: key, value: details[key], required: key !== 'note', maxLength: max,
          autoComplete: 'off', 'aria-invalid': !!errors[key],
          'aria-describedby': [hint ? idFor(`${key}-hint`) : '', errors[key] ? idFor(`${key}-error`) : ''].filter(Boolean).join(' ') || undefined,
          onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, event.target.value),
        };
        return <div className="baagh-request-field" key={key}>
          <label htmlFor={idFor(key)}>{label}</label>
          {multiline ? <textarea {...props} rows={key === 'address' ? 3 : 2} />
            : <input {...props} type={key === 'contact' ? 'tel' : 'text'} inputMode={key === 'contact' ? 'tel' : 'text'} />}
          {hint && <p id={idFor(`${key}-hint`)} className="baagh-request-hint">{hint}</p>}
          {errors[key] && <p id={idFor(`${key}-error`)} className="baagh-basket-warning" role="alert">{errors[key]}</p>}
        </div>;
      })}
      {confirmationNote}
      <div className="baagh-request-actions">
        <button className="baagh-request-open" type="submit" disabled={!canEnquire || !whatsappConfigured || preparing} aria-busy={preparing}>{preparing ? 'Preparing message…' : 'Review WhatsApp message'}</button>
        <button className="baagh-basket-continue" type="button" onClick={onBack}>← Back to basket</button>
      </div>
    </form>}
  </section>;
};
