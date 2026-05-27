/**
 * Global “primary objective” perspective — re-exports from perspective-contract.
 */

import {
  hubGateForPath,
  isExplorerNavHrefInPerspective,
  isNavHrefActionable,
  isNavHrefVisible,
  isPhdPerspectiveRelevant as isPhdPerspectiveRelevantContract,
  perspectiveContractFromDefinition,
} from '@/lib/user-objectives/perspective-contract';
import type { UserObjectiveDefinition } from '@/lib/user-objectives/registry';

export {
  hubGateForPath,
  isNavHrefActionable,
  isNavHrefVisible,
  isExplorerNavHrefInPerspective,
  perspectiveContractFromDefinition,
};

/** Doctorat / PhD promos, badges, and country doctorat routes (`/countries/.../doctorat`). */
export function isPhdPerspectiveRelevant(def: UserObjectiveDefinition | null): boolean {
  return isPhdPerspectiveRelevantContract(perspectiveContractFromDefinition(def));
}
