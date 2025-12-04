/**
 * Event Subscriber
 * Base class for event subscribers
 */

export class EventSubscriber {
  /**
   * Register the listeners for the subscriber
   * @param {EventDispatcher} events
   */
  subscribe(events) {
    // Override in child classes
  }
}

export default EventSubscriber;
