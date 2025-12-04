/**
 * Patterns Module
 * 
 * Provides design patterns for application architecture.
 */

export { ServiceFactory, createServiceFactory, serviceFactory } from './ServiceFactory.js';
export {
  BaseRepository,
  RepositoryFactory,
  createRepositoryFactory,
  repositoryFactory,
} from './RepositoryFactory.js';
