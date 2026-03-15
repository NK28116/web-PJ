import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// window.location のモック (navigation error 回避)
const mockLocation = new URL('http://localhost');
mockLocation.assign = jest.fn();
mockLocation.replace = jest.fn();
delete window.location;
window.location = mockLocation;

if (typeof global.fetch !== 'function') {
  global.fetch = jest.fn((url) => {
    let data = {};
    if (url.includes('/api/google/reviews') || url.includes('/api/instagram/media')) {
      data = [];
    } else if (url.includes('/api/reports/summary')) {
      data = {
        period: { start: '2026-01-01', end: '2026-01-31' },
        profile_views: { value: 0, change_percent: 0 },
        total_actions: { value: 0, change_percent: 0 },
        action_breakdown: { google: 0, instagram: 0 },
        conversion_rate: { value: 0, change_percent: 0 },
        review_avg_rating: { value: 0, change_point: 0 }
      };
    }

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      blob: () => Promise.resolve(new Blob()),
    });
  });
}
if (typeof global.Request !== 'function') {
  global.Request = jest.fn();
}
if (typeof global.Response !== 'function') {
  global.Response = jest.fn();
}
