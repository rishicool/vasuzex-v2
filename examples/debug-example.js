/**
 * Debug Helper Examples
 * 
 * Demonstrates inspect() and dd() functions
 */

import { inspect, dd } from '../framework/Support/Helpers/DebugHelper.js';

console.log('═══════════════════════════════════════════════════');
console.log('   VASUZEX DEBUG HELPER EXAMPLES');
console.log('═══════════════════════════════════════════════════\n');

// Example 1: Simple inspect
console.log('1️⃣  Simple inspect()');
console.log('─'.repeat(50));

const user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
};

inspect(user, 'User Object');

// Example 2: Inspect with arrays
console.log('2️⃣  Inspect Arrays');
console.log('─'.repeat(50));

const orders = [
  { id: 1, total: 100, items: ['Item 1', 'Item 2'] },
  { id: 2, total: 200, items: ['Item 3'] },
  { id: 3, total: 150, items: ['Item 4', 'Item 5', 'Item 6'] },
];

inspect(orders, 'User Orders');

// Example 3: Chained inspects
console.log('3️⃣  Multiple Inspects (Chained)');
console.log('─'.repeat(50));

const profile = { bio: 'Developer', location: 'India' };
const settings = { theme: 'dark', notifications: true };

inspect(profile, 'User Profile')
inspect(settings, 'User Settings')

// Example 4: Inspect complex nested objects
console.log('4️⃣  Complex Nested Objects');
console.log('─'.repeat(50));

const apiResponse = {
  success: true,
  data: {
    user: {
      id: 1,
      name: 'John',
      profile: {
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Full stack developer',
      },
    },
    orders: [
      {
        id: 1,
        products: [
          { name: 'Product 1', price: 50 },
          { name: 'Product 2', price: 50 },
        ],
        total: 100,
      },
    ],
    metadata: {
      timestamp: new Date(),
      version: '1.0',
      server: 'api-01',
    },
  },
  message: 'Success',
};

inspect(apiResponse, 'API Response');

// Example 5: Inspect in function
console.log('5️⃣  Inspect in Function');
console.log('─'.repeat(50));

function processOrder(order) {
  inspect(order, 'Processing Order');
  
  // Do some processing
  const total = order.items.reduce((sum, item) => sum + item.price, 0);
  inspect(total, 'Calculated Total');
  
  return { ...order, total };
}

const orderData = {
  id: 1,
  items: [
    { name: 'Item 1', price: 50 },
    { name: 'Item 2', price: 75 },
  ],
};

const processedOrder = processOrder(orderData);
inspect(processedOrder, 'Final Order');

// Example 6: Inspect different data types
console.log('6️⃣  Different Data Types');
console.log('─'.repeat(50));

inspect(null, 'Null value');
inspect(undefined, 'Undefined value');
inspect(42, 'Number');
inspect('Hello World', 'String');
inspect(true, 'Boolean');
inspect([1, 2, 3], 'Array');
inspect(new Date(), 'Date');
inspect(new Map([['key', 'value']]), 'Map');
inspect(new Set([1, 2, 3]), 'Set');

// Example 7: Error handling with inspect
console.log('7️⃣  Error Handling');
console.log('─'.repeat(50));

try {
  throw new Error('Something went wrong!');
} catch (error) {
  inspect(error, 'Caught Error');
  inspect(error.message, 'Error Message');
  inspect(error.stack, 'Error Stack');
}

console.log('\n⚠️  Next example will use dd() and exit the process!\n');
console.log('Uncomment the dd() line below to test it:\n');

// Example 8: dd() - Dump and Die (commented out to continue examples)
console.log('8️⃣  dd() - Dump and Die (COMMENTED)');
console.log('─'.repeat(50));

const finalData = {
  users: [user],
  orders: orders,
  timestamp: new Date(),
};

inspect(finalData, 'Final Data (using inspect)');

// Uncomment this to test dd() - it will stop execution here
// dd(finalData, 'Final Data (using dd)');

console.log('\n✅ If you see this, dd() was not called');
console.log('   Uncomment dd() above to see it in action\n');

console.log('═══════════════════════════════════════════════════');
console.log('   EXAMPLES COMPLETED');
console.log('═══════════════════════════════════════════════════\n');

console.log('💡 Tips:');
console.log('  • Use inspect() to debug without stopping execution');
console.log('  • Use dd() to stop execution and dump values');
console.log('  • Both show file location and line number');
console.log('  • Both pretty-print with colors');
console.log('  • inspect() returns the value for chaining\n');
