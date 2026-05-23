/**
 * C.46 — Contrat JSON stable de l’API World Bank (batch indicateur × pays), sans réseau.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { fetchWorldBankLatestDataForCountriesBatch } from './world-bank-client';

describe('world-bank-client integration (mock HTTP)', () => {
  const orig = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = orig;
  });

  it('fetchWorldBankLatestDataForCountriesBatch parses [meta, rows] contract', async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify([
          { page: 1, pages: 1 },
          [
            { country: { id: 'FR' }, date: '2023', value: 67_000_000 },
            { country: { id: 'DE' }, date: '2023', value: 83_000_000 },
          ],
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );

    const m = await fetchWorldBankLatestDataForCountriesBatch(['fr', 'de'], 'SP.POP.TOTL');
    assert.equal(m.get('fr')?.value, 67_000_000);
    assert.equal(m.get('fr')?.date, '2023');
    assert.equal(m.get('de')?.value, 83_000_000);
  });

  it('propagates non-OK HTTP as throw', async () => {
    globalThis.fetch = async () => new Response('bad', { status: 503 });

    await assert.rejects(
      () => fetchWorldBankLatestDataForCountriesBatch(['us'], 'NY.GDP.MKTP.CD'),
      /HTTP 503/,
    );
  });
});
