import test from 'node:test';
import assert from 'node:assert/strict';
import { sitePages, sitePageForPath } from '../src/data/sitePages.ts';
import { resolveRoute } from '../src/navigation/route.ts';

test('every public information page has a route and readable content', () => {
  for (const page of Object.values(sitePages)) {
    assert.deepEqual(resolveRoute(`/${page.id}`), { view: 'information', page: page.id });
    assert.equal(sitePageForPath(`/${page.id}/`), page.id);
    assert.ok(page.title && page.intro && page.sections.length >= 3);
    assert.ok(page.sections.every(section => section.title && section.body));
  }
});

test('common about, contact and policy aliases resolve without intercepting unknown pages', () => {
  for (const [path, page] of [['/about-us', 'our-story'], ['/contact-us', 'contact'], ['/privacy', 'privacy-policy'], ['/faq', 'help'], ['/refund-policy', 'returns']]) {
    assert.equal(resolveRoute(path).page, page);
  }
  assert.deepEqual(resolveRoute('/', '#story'), { view: 'information', page: 'our-story' });
  for (const path of ['/constructor', '/__proto__', '/toString', '/privacy-policy/extra']) assert.equal(resolveRoute(path).view, 'not-found');
});
