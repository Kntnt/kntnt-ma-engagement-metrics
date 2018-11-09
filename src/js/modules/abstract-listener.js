import window from './window.js';

if (typeof window === 'undefined' || typeof window.Kntnt === 'undefined' || typeof window.Kntnt.EngagementMetrics === 'undefined' || typeof window.Kntnt.EngagementMetrics.AbstractListener === 'undefined') {
  throw new Error('Kntnt.EngagementMetrics.AbstractListener not defined.');
}

export default window.Kntnt.EngagementMetrics.AbstractListener;
