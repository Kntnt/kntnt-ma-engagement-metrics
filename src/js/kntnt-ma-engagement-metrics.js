import measurer from './modules/measurer.js';
import MatomoAnalyticsListener from './modules/matomo-analytics-listener.js';

// Add a MatomoAnalyticsListener to the measurer.
measurer.addListener(new MatomoAnalyticsListener());
