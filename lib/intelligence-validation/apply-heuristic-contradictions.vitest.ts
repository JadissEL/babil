import { describe, expect, it } from 'vitest';
import { parseHeuristicConflictLines } from './apply-heuristic-contradictions';

describe('parseHeuristicConflictLines', () => {
  it('groups field paths by country id', () => {
    const map = parseHeuristicConflictLines([
      'heuristic:12:economy.gdp:min=1:max=2:rel=0.5',
      'llm:12:general.population:reason=two_population_values',
      'heuristic:3:economy.gdp:min=1:max=2:rel=0.5',
    ]);
    expect(map.get(12)?.sort()).toEqual(['economy.gdp', 'general.population'].sort());
    expect(map.get(12)).toContain('general.population');
    expect(map.get(3)).toEqual(['economy.gdp']);
  });

  it('ignores malformed lines', () => {
    expect(parseHeuristicConflictLines(['bad', 'heuristic:0::']).size).toBe(0);
  });
});
