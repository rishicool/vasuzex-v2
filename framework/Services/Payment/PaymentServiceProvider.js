import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { PaymentManager } from './PaymentManager.js';

/**
 * Payment Service Provider
 * 
 * Registers Payment service in the application container.
 * Provides payment gateway capabilities (PhonePe, Razorpay, Stripe).
 */
export class PaymentServiceProvider extends ServiceProvider {
  /**
   * Register the service
   */
  async register() {
    this.singleton('payment', (app) => {
      return new PaymentManager(app);
    });

    // Create aliases
    this.alias('Payment', 'payment');
  }

  /**
   * Bootstrap the service
   */
  async boot() {
    // Payment service is ready to use
    if (this.config('payment.default')) {
      const payment = this.make('payment');
      console.log(`[PaymentServiceProvider] Payment service initialized with gateway: ${this.config('payment.default')}`);
    }
  }
}

export default PaymentServiceProvider;
