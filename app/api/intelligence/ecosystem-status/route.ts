import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { listIntelligenceFieldPathGlossaryEntries } from '@/lib/intelligence-fieldpath-glossary';
import {
  INTELLIGENCE_TAXONOMY_VERSION,
  MATERIALIZE_TARGETS,
} from '@/lib/intelligence-pipeline/taxonomy-v1';
import { getJobBudgetSnapshot } from '@/lib/intelligence-pipeline/job-budget';
import { DATA_CONTRACT_VERSION } from '@/lib/intelligence-validation/contract-sli';

/** Public read-only intelligence ecosystem snapshot (no PII, no DB required). */
export async function GET() {
  const mapPath = path.join(process.cwd(), 'data', 'agent-manifest-url-map.committed.json');
  let manifest = { total: 0, fetchable: 0, skipped: 0, version: null as string | null };

  if (existsSync(mapPath)) {
    const doc = JSON.parse(readFileSync(mapPath, 'utf8')) as {
      version?: string;
      entries: { skipped?: boolean; urlTemplate?: string }[];
    };
    manifest = {
      version: doc.version ?? null,
      total: doc.entries.length,
      fetchable: doc.entries.filter(
        (e) => !e.skipped && (e.urlTemplate ?? '').startsWith('https://'),
      ).length,
      skipped: doc.entries.filter((e) => e.skipped).length,
    };
  }

  return NextResponse.json(
    {
      taxonomyVersion: INTELLIGENCE_TAXONOMY_VERSION,
      dataContractVersion: DATA_CONTRACT_VERSION,
      materializeFieldCount: Object.keys(MATERIALIZE_TARGETS).length,
      glossaryEntryCount: listIntelligenceFieldPathGlossaryEntries().length,
      jobBudgetLimits: getJobBudgetSnapshot({
        jobsCreatedToday: 0,
        manifestFetchCreatedToday: 0,
      }),
      medallionLayers: ['bronze', 'silver', 'gold'] as const,
      manifest,
      capabilities: [
        'bronze_observations',
        'silver_validation',
        'gold_materialize',
        'manifest_fetch_allowlist',
        'hitl_review_queue',
        'dead_letter_triage',
        'slo_metrics',
        'data_contract_audit',
        'golden_signals_latency_saturation',
      ],
    },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
