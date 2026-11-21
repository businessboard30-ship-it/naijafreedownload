import { describe, expect, it } from 'vitest';
import { adsAllowedOnPath, adsTxtFor, parsePublisherId, resolveAdsConfig } from './ads';

describe('ads configuration', () => {
  it('never invents or accepts a malformed publisher ID', () => {
    expect(parsePublisherId(undefined)).toBe('');
    expect(parsePublisherId('')).toBe('');
    expect(parsePublisherId('pub-123')).toBe('');
    expect(parsePublisherId('ca-pub-abc')).toBe('');
    expect(parsePublisherId('ca-pub-1234567890123456')).toBe('ca-pub-1234567890123456');
  });
  it('stays disabled unless explicitly enabled with a valid publisher and slot', () => {
    expect(resolveAdsConfig({}).enabled).toBe(false);
    expect(resolveAdsConfig({ enabled: 'true' }).enabled).toBe(false);
    expect(resolveAdsConfig({ enabled: 'true', publisherId: 'ca-pub-1234567890123456' }).enabled).toBe(false);
    expect(resolveAdsConfig({ publisherId: 'ca-pub-1234567890123456', slotId: '1234567890' }).enabled).toBe(false);
    expect(resolveAdsConfig({ enabled: 'true', publisherId: 'ca-pub-1234567890123456', slotId: '1234567890' }).enabled).toBe(true);
  });
  it('produces ads.txt only for a valid ID', () => {
    expect(adsTxtFor('')).toBe('');
    expect(adsTxtFor('nonsense')).toBe('');
    expect(adsTxtFor('ca-pub-1234567890123456')).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
  });
  it('only allows ads on content pages, never on download, policy, search or error pages', () => {
    for (const ok of ['/movies/550', '/tv/1399', '/music/song/123', '/anime/21', '/people/287']) expect(adsAllowedOnPath(ok)).toBe(true);
    for (const no of ['/', '/downloads', '/privacy', '/terms', '/copyright', '/contact', '/about', '/search', '/adult', '/nigeria-movies', '/movies', '/music', '/nope']) expect(adsAllowedOnPath(no)).toBe(false);
  });
});
