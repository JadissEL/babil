import { promises as fs } from 'node:fs';

import type { Domain } from '../lib/agent-adaptive-query';
import { CONTRACT_VERSION } from '../lib/country-intelligence-contract';
import { STATE_DIR, STATE_FILE } from './runner-constants';
import type { AgentState } from './runner-types';

/**
 * Charge l’état de la file d’agents depuis le disque (F.84).
 * Crée le répertoire `.agent-state` si besoin ; en cas d’absence ou JSON invalide, état vide.
 */
export async function loadAgentStateFromDisk(
  normalizeDomain: (domain: unknown) => Domain,
  newTaskId: () => string,
): Promise<AgentState> {
  await fs.mkdir(STATE_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AgentState>;
    const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    return {
      tasks: tasks.map((task) => ({
        id: String(task.id || newTaskId()),
        country: String(task.country || ''),
        region: String(task.region || 'Other'),
        domain: normalizeDomain(task.domain),
        query: String(task.query || 'country-first-completion-loop'),
        priority: Number(task.priority || 50),
        attempts: Number(task.attempts || 0),
        pass: Number(task.pass || 0),
        nextRunAt: String(task.nextRunAt || new Date().toISOString()),
        status:
          task.status === 'running' || task.status === 'done' || task.status === 'failed'
            ? task.status
            : 'queued',
        completenessScore: Number(task.completenessScore || 0),
        missingCritical: Array.isArray(task.missingCritical)
          ? task.missingCritical.map((v) => String(v))
          : [],
        lastError: task.lastError ? String(task.lastError) : undefined,
      })),
      generatedAt:
        typeof parsed.generatedAt === 'string' ? parsed.generatedAt : new Date().toISOString(),
      contractVersion:
        typeof parsed.contractVersion === 'string' ? parsed.contractVersion : CONTRACT_VERSION,
      worldOrderCursor:
        typeof parsed.worldOrderCursor === 'number' &&
        Number.isFinite(parsed.worldOrderCursor) &&
        parsed.worldOrderCursor >= 0
          ? Math.floor(parsed.worldOrderCursor)
          : 0,
    };
  } catch {
    return {
      tasks: [],
      generatedAt: new Date().toISOString(),
      contractVersion: CONTRACT_VERSION,
      worldOrderCursor: 0,
    };
  }
}

/** Sérialise l’état courant dans `tasks.json` (horodatage + version contrat à jour). */
export async function saveAgentStateToDisk(state: AgentState): Promise<void> {
  state.generatedAt = new Date().toISOString();
  state.contractVersion = CONTRACT_VERSION;
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}
