/**
 * Model Observer
 * Observe model events and execute callbacks
 */

export class Observer {
  /**
   * Called when model is being retrieved
   */
  retrieved(model) {
    // Override in subclass
  }

  /**
   * Called before model is created
   */
  creating(model) {
    // Override in subclass
  }

  /**
   * Called after model is created
   */
  created(model) {
    // Override in subclass
  }

  /**
   * Called before model is updated
   */
  updating(model) {
    // Override in subclass
  }

  /**
   * Called after model is updated
   */
  updated(model) {
    // Override in subclass
  }

  /**
   * Called before model is saved (creating or updating)
   */
  saving(model) {
    // Override in subclass
  }

  /**
   * Called after model is saved (created or updated)
   */
  saved(model) {
    // Override in subclass
  }

  /**
   * Called before model is deleted
   */
  deleting(model) {
    // Override in subclass
  }

  /**
   * Called after model is deleted
   */
  deleted(model) {
    // Override in subclass
  }

  /**
   * Called before soft deleted model is restored
   */
  restoring(model) {
    // Override in subclass
  }

  /**
   * Called after soft deleted model is restored
   */
  restored(model) {
    // Override in subclass
  }

  /**
   * Called when model is force deleted
   */
  forceDeleted(model) {
    // Override in subclass
  }
}

/**
 * Register observer with model
 */
export function observe(modelClass, observer) {
  const observerInstance = typeof observer === 'function' ? new observer() : observer;

  const events = [
    'retrieved', 'creating', 'created', 'updating', 'updated',
    'saving', 'saved', 'deleting', 'deleted', 'restoring', 
    'restored', 'forceDeleted'
  ];

  if (!modelClass.dispatcher) {
    throw new Error('Event dispatcher not set on model. Make sure DatabaseServiceProvider is registered.');
  }

  for (const event of events) {
    if (typeof observerInstance[event] === 'function') {
      const eventName = `eloquent.${event}: ${modelClass.name}`;
      
      modelClass.dispatcher.listen(eventName, async (model) => {
        return await observerInstance[event](model);
      });
    }
  }
}

export default Observer;
