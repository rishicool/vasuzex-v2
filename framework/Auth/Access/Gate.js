/**
 * Gate
 * Laravel-inspired authorization gate
 */

export class Gate {
  constructor(app, userResolver) {
    this.app = app;
    this.userResolver = userResolver;
    this.abilities = new Map();
    this.policies = new Map();
    this.beforeCallbacks = [];
    this.afterCallbacks = [];
  }

  /**
   * Check if ability is defined
   */
  has(ability) {
    const abilities = Array.isArray(ability) ? ability : [ability];
    return abilities.every(a => this.abilities.has(a));
  }

  /**
   * Define a new ability
   */
  define(ability, callback) {
    this.abilities.set(ability, callback);
    return this;
  }

  /**
   * Define abilities for a resource
   */
  resource(name, policyClass, abilities = null) {
    const defaultAbilities = abilities || {
      viewAny: 'viewAny',
      view: 'view',
      create: 'create',
      update: 'update',
      delete: 'delete'
    };

    for (const [ability, method] of Object.entries(defaultAbilities)) {
      this.define(`${name}.${ability}`, async (user, ...args) => {
        const policy = this.resolvePolicy(policyClass);
        return await policy[method](user, ...args);
      });
    }

    return this;
  }

  /**
   * Define a policy for a model
   */
  policy(model, policyClass) {
    this.policies.set(model, policyClass);
    return this;
  }

  /**
   * Register before callback
   */
  before(callback) {
    this.beforeCallbacks.push(callback);
    return this;
  }

  /**
   * Register after callback
   */
  after(callback) {
    this.afterCallbacks.push(callback);
    return this;
  }

  /**
   * Check if user has ability
   */
  async allows(ability, args = []) {
    return await this.check(ability, args);
  }

  /**
   * Check if user is denied ability
   */
  async denies(ability, args = []) {
    return !(await this.allows(ability, args));
  }

  /**
   * Check ability
   */
  async check(ability, args = []) {
    const user = await this.resolveUser();

    // Run before callbacks
    for (const callback of this.beforeCallbacks) {
      const result = await callback(user, ability, args);
      if (result !== null && result !== undefined) {
        return result;
      }
    }

    // Check if ability exists
    if (this.abilities.has(ability)) {
      const callback = this.abilities.get(ability);
      const result = await callback(user, ...args);
      
      // Run after callbacks
      for (const afterCallback of this.afterCallbacks) {
        const afterResult = await afterCallback(user, ability, result, args);
        if (afterResult !== null && afterResult !== undefined) {
          return afterResult;
        }
      }

      return result;
    }

    // Try to find policy for first argument
    if (args.length > 0) {
      const model = args[0];
      const policy = this.getPolicyFor(model);

      if (policy && typeof policy[ability] === 'function') {
        const policyResult = await this.callPolicyMethod(policy, ability, user, args);
        
        // Run after callbacks
        for (const afterCallback of this.afterCallbacks) {
          const afterResult = await afterCallback(user, ability, policyResult, args);
          if (afterResult !== null && afterResult !== undefined) {
            return afterResult;
          }
        }

        return policyResult;
      }
    }

    return false;
  }

  /**
   * Authorize ability or throw exception
   */
  async authorize(ability, args = []) {
    const result = await this.check(ability, args);

    if (!result) {
      throw new Error(`This action is unauthorized. Missing ability: ${ability}`);
    }

    return result;
  }

  /**
   * Check any ability
   */
  async any(abilities, args = []) {
    for (const ability of abilities) {
      if (await this.check(ability, args)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check all abilities
   */
  async every(abilities, args = []) {
    for (const ability of abilities) {
      if (!(await this.check(ability, args))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get policy for model
   */
  getPolicyFor(model) {
    // If model is a class constructor
    if (typeof model === 'function') {
      if (this.policies.has(model)) {
        return this.resolvePolicy(this.policies.get(model));
      }
      if (this.policies.has(model.name)) {
        return this.resolvePolicy(this.policies.get(model.name));
      }
    }

    // If model is an instance
    if (typeof model === 'object' && model.constructor) {
      const modelName = model.constructor.name;
      if (this.policies.has(modelName)) {
        return this.resolvePolicy(this.policies.get(modelName));
      }
    }

    return null;
  }

  /**
   * Resolve policy instance
   */
  resolvePolicy(policyClass) {
    if (typeof policyClass === 'function') {
      return new policyClass();
    }

    if (typeof policyClass === 'string') {
      const PolicyClass = require(policyClass).default || require(policyClass);
      return new PolicyClass();
    }

    return policyClass;
  }

  /**
   * Call policy method with before/after hooks
   */
  async callPolicyMethod(policy, method, user, args) {
    // Call before method if exists
    if (typeof policy.before === 'function') {
      const result = await policy.before(user, method, ...args);
      if (result !== null && result !== undefined) {
        return result;
      }
    }

    // Call the actual method
    const result = await policy[method](user, ...args);

    return result;
  }

  /**
   * Resolve the user
   */
  async resolveUser() {
    return await this.userResolver();
  }

  /**
   * For the given user
   */
  forUser(user) {
    const gate = new Gate(this.app, async () => user);
    gate.abilities = new Map(this.abilities);
    gate.policies = new Map(this.policies);
    gate.beforeCallbacks = [...this.beforeCallbacks];
    gate.afterCallbacks = [...this.afterCallbacks];
    return gate;
  }
}

export default Gate;
