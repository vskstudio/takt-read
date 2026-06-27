import { describe, it, expect } from 'vitest';
import { toSearchParams } from '../src/query';

describe('toSearchParams', () => {
  it('returns empty params for empty query', () => {
    expect(toSearchParams({}).toString()).toBe('');
  });

  it('sets scalar fields', () => {
    const sp = toSearchParams({
      period: '7d',
      from: '2026-01-01',
      to: '2026-01-31',
      tz: 'Europe/Paris',
      country: 'FR',
      interval: 'day',
      compare: true,
      limit: 10,
      dimension: 'page',
    });
    expect(sp.get('period')).toBe('7d');
    expect(sp.get('from')).toBe('2026-01-01');
    expect(sp.get('to')).toBe('2026-01-31');
    expect(sp.get('tz')).toBe('Europe/Paris');
    expect(sp.get('country')).toBe('FR');
    expect(sp.get('interval')).toBe('day');
    expect(sp.get('compare')).toBe('true');
    expect(sp.get('limit')).toBe('10');
    expect(sp.get('dimension')).toBe('page');
  });

  it('omits undefined fields', () => {
    const sp = toSearchParams({ period: 'day' });
    expect(sp.has('from')).toBe(false);
    expect(sp.has('compare')).toBe(false);
  });

  it('encodes a single segment without a join', () => {
    const sp = toSearchParams({ segment: [{ dim: 'country', op: 'is', val: 'FR' }] });
    expect(sp.getAll('segment')).toEqual(['country:is:FR']);
    expect(sp.getAll('segment_join')).toEqual([]);
  });

  it('offsets segment_join by one for multiple segments', () => {
    const sp = toSearchParams({
      segment: [
        { dim: 'country', op: 'is', val: 'FR' },
        { dim: 'browser', op: 'is', val: 'Firefox', join: 'or' },
        { dim: 'page', op: 'contains', val: '/blog' },
      ],
    });
    expect(sp.getAll('segment')).toEqual([
      'country:is:FR',
      'browser:is:Firefox',
      'page:contains:/blog',
    ]);
    expect(sp.getAll('segment_join')).toEqual(['or', 'and']);
  });
});
