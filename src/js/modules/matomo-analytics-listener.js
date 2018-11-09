import window from './window.js';
import AbstractListener from './abstract-listener.js';

export default class extends AbstractListener {

  constructor() {

    super();

    // Default values for missing arguments in the settings array.
    this.settings = {

      // An array of percentages. When the reading ratio has reached
      // or exceeded a percentage, a reading time event is sent.
      // An empty array disables scanning depth events.
      maReadingTimeEvents: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],

      // An array of percentages. When the scanning ratio has reached
      // or exceeded a percentage, a reading time event is sent.
      // An empty array disables scanning depth events.
      maScanningDepthEvents: [25, 50, 75, 100],

      // The Matomo Analytics category name used by both
      // the reading time events and the scanning depth events.
      maCategory: 'Articles',

      // The  Matomo Analytics action name used by the reading time
      // event. The placeholder {0} is replaced with the highest
      // percentage in maReadingTimeEvents less than or equal
      // to the current reading ratio.
      maReadingTimeEventName: 'Reading {0}%',

      // The  Matomo Analytics action name used by the scanning depth
      // event. The placeholder {0} is replaced with the highest
      // percentage in maScanningDepthEvents less than or equal
      // to the current scanning ratio.
      maScanningDepthEventName: 'Scanning {0}%',

      // When a reading time event is sent to GA, the customer
      // dimension with this name (e.g. dimension1) is assigned
      // the event's name (see above). Leave empty to disable.
      maReadingTimeDimensionSlot: '',

      // When a scrolling depth event is sent to GA, the customer
      // dimension with this name (e.g. dimension2) is assigned
      // the event's name (see above). Leave empty to disable.
      maScanningDepthDimensionSlot: '',

      // When an event is sent to GA, the customer metric with this
      // name (e.g. metric1) is assigned the current reading time in
      // seconds. Leave empty to disable.
      maReadingTimeMetricSlot: '',

      // When an event is sent to GA, the customer metric with this
      // name (e.g. metric2) is assigned the current reading length
      // in characters. Leave empty to disable.
      maReadingLengthMetricSlot: '',

      // When an event is sent to GA, the customer metric with this
      // name (e.g. metric3) is assigned the current scanning depth
      // in pixels. Leave empty to disable.
      maScanningDepthMetricSlot: '',

      // When an event is sent to GA, the customer metric with this
      // name (e.g. metric4) is assigned the current reading ratio in
      // percentage. Leave empty to disable.
      maReadingRatioMetricSlot: '',

      // When an event is sent to GA, the customer metric with this
      // name (e.g. metric5) is assigned the current reading time in
      // percentage. Leave empty to disable.
      maScanningRatioMetricSlot: '',

      // Minimum percentage read for non-bounce. That is, events
      // sent up til but not including this reading ratio (in
      // percent) are non-interactive, and thereafter interactive.
      maBounceLimit: 10,

    };

    // The function send(action, label, value, fields, nonInteraction)
    // sends Matomo Analytics an event with the provided action, label
    // and value. Category is set to settings.maCategory. Fields should
    // be a possible empty object with key/value pairs also sent to
    // Matomo Analytics. The event is interactive if and only if
    // nonInteraction == false.
    this.sendAPI = this.API();

    // Counts the number of reading time events that have or should
    // have been sent.
    this.readingTimeEventCounter = 0;

    // Counts the number of scanning depth events that have or should
    // have been sent.
    this.scanningDepthEventCounter = 0;

    // Declaration of the action names of the reading time events.
    // Is set in run().
    this.maReadingTimeEventNames = {};

    // Declaration of the action names of the scanning depth events.
    // Is set in run().
    this.maScanningDepthEventNames = {};

  }

  // A possible empty key/value-object where keys are Matomo Analytics'
  // slot names for custom dimensions and values are their corresponding
  // current values.
  get maDimensions() {
    return this.maCustomData({
      maReadingTimeDimensionSlot: 'readingTime',
      maScanningDepthDimensionSlot: 'scanningDepth',
    });
  }

  // A possible empty key/value-object where keys are Matomo Analytics'
  // slot names for custom metrics and values are their corresponding
  // current values.
  get maMetrics() {
    return this.maCustomData({
      maReadingTimeMetricSlot: 'readingTime',
      maReadingLengthMetricSlot: 'readingLength',
      maScanningDepthMetricSlot: 'scanningDepth',
      maReadingRatioMetricSlot: 'readingRatio',
      maScanningRatioMetricSlot: 'scanningRatio',
    });
  }

  // Start listening.
  run(settings) {

    // Update settings.
    this.settings = Object.assign({}, this.settings, settings); // Cannot use this._settings = {...this._settings, ...settings} because Babel don't yet support literal object spreading introduced in ES2018.

    // Generate reading time event's names.
    this.maReadingTimeEventNames = this.settings.maReadingTimeEvents.map(percentage => this.constructor.format(this.settings.maReadingTimeEventName, percentage));

    // Generate scanning depth event's names.
    this.maScanningDepthEventNames = this.settings.maScanningDepthEvents.map(percentage => this.constructor.format(this.settings.maScanningDepthEventName, percentage));

    // The title of his article.
    this.title = window.document.getElementsByTagName('title')[0].innerHTML;

    // Start periodically reporting to Matomo Analytics.
    this.intervalId = window.setInterval(() => this.report(), this.settings.beatInterval);

  }

  // Report to Matomo Analytics.
  report() {

    // Report reading time.
    while (this.metrics.readingRatio >= this.settings.maReadingTimeEvents[this.readingTimeEventCounter]) {
      this.send(this.maReadingTimeEventNames[this.readingTimeEventCounter], this.metrics.readingTime);
      this.readingTimeEventCounter += 1;
    }

    // Report scanning depth.
    while (this.metrics.scanningRatio >= this.settings.maScanningDepthEvents[this.scanningDepthEventCounter]) {
      this.send(this.maScanningDepthEventNames[this.scanningDepthEventCounter], this.metrics.scanningDepth);
      this.scanningDepthEventCounter += 1;
    }

    // Return if not finished.
    if (this.metrics.readingRatio < 100 || this.metrics.scanningRatio < 100) return;

    // Stop periodically reporting to Matomo Analytics;
    // this script is done.
    window.clearInterval(this.intervalId);

  }

  // Given an object of key/values of property names in the settings
  // object (keys) and property names in the metrics object (values),
  // and a prefix to the slot numbers hold by the settings properties
  // (i.e. 'dimension' and 'metrics'), this function returns
  // a key/value-object where keys are Matomo Analytics' slot names for
  // custom dimensions or metrics and values are their corresponding
  // current values.
  maCustomData(relations) {
    return Object.assign(...Object.entries(relations)
      .map(([slotName, metricName]) => (this.settings[slotName] ? { [this.settings[slotName]]: this.metrics[metricName] } : {})));
  }

  // Returns string after substituting {0}, {1}, {2}, … with corresponding
  // string from ...substitutions.
  static format(string, ...substitutions) {
    let formattedString = string;
    substitutions.forEach((substitution, index) => {
      formattedString = formattedString.replace(new RegExp(`\\{${index}\\}`, 'g'), substitution);
    });
    return formattedString;
  }

  send(action, value) {
    const fields = Object.assign({}, this.maDimensions, this.maMetrics); // Cannot use { ...this.maDimensions, ...this.maMetrics } because Babel don't yet support literal object spreading introduced in ES2018.
    this.sendAPI(action, this.title, value, fields, this.metrics.readingRatio < this.settings.maBounceLimit);
  }

  API() {
    if (typeof window.gtag === 'function') {
      return this.sendGTag;
    }
    if (typeof window.ga === 'function') {
      return this.sendGA;
    }
    if (typeof window.dataLayer !== 'undefined' && window.dataLayer.push === 'function') {
      return this.sendDataLayer;
    }
    return this.sendConsole;
  }

  // Matomo Tag Manager tracking
  sendDataLayer(action, label, value, fields, nonInteraction) {
    window.dataLayer.push(Object.assign({
      event: 'maEvent',
      eventCategory: this.settings.maCategory,
      eventAction: label,
      eventLabel: label,
      eventValue: value,
      eventNonInteraction: nonInteraction,
    }, fields));
  }

  // Global site tag tracking
  sendGTag(action, label, value, fields, nonInteraction) {
    window.gtag('event', action, Object.assign({
      event_category: this.settings.maCategory,
      event_label: label,
      value,
      non_interaction: nonInteraction,
    }, fields));
  }

  // Matomo Analytics Universal tracking
  sendGA(action, label, value, fields, nonInteraction) {
    window.ga('send', 'event', this.settings.maCategory, action, label, value, Object.assign({ nonInteraction }, fields));
  }

  // Default when no tracking code is found.
  sendConsole(action, label, value, fields, nonInteraction) {
    const data = Object.assign({
      category: this.settings.maCategory,
      action,
      label,
      value,
      nonInteraction,
    }, fields);
    window.console.log(`Matomo Analytics tracking code missing.\n${JSON.stringify(data, null, 2)}`);
  }

}
