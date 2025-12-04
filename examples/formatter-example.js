/**
 * Formatter Service Examples
 * 
 * Run: node examples/formatter-example.js
 */

import { Format } from 'vasuzex/Support/Facades/Format';
import { Application } from 'vasuzex/Foundation/Application';
import { FormatterServiceProvider } from 'vasuzex/Services/Formatter/FormatterServiceProvider';

// Bootstrap application
const app = new Application('/Users/rishi/Desktop/work/vasuzex');
app.register(new FormatterServiceProvider(app));

console.log('═══════════════════════════════════════════════════');
console.log('          FORMATTER SERVICE EXAMPLES');
console.log('═══════════════════════════════════════════════════\n');

// ============================================
// Example 1: Date Formatting
// ============================================
console.log('1. DATE FORMATTING\n');

const now = new Date();
const pastDate = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
const futureDate = new Date('2025-12-25');

console.log('Current Date:');
console.log('  Short format:', Format.date(now));
console.log('  Long format:', Format.date(now, 'long'));
console.log('  ISO string input:', Format.date('2025-03-12'));

console.log('\nTime:');
console.log('  12-hour:', Format.time(now));
console.log('  24-hour:', Format.time(now, true));

console.log('\nDate & Time:');
console.log('  Short:', Format.datetime(now));
console.log('  Long:', Format.datetime(now, 'long'));

console.log('\nRelative Time:');
console.log('  2 hours ago:', Format.relativeTime(pastDate));
console.log('  Just created:', Format.relativeTime(new Date(Date.now() - 5000)));

console.log('\nDuration:');
console.log('  90 seconds:', Format.duration(90));
console.log('  1 hour:', Format.duration(3600));
console.log('  2h 15m 30s:', Format.duration(8130));

// ============================================
// Example 2: Currency Formatting
// ============================================
console.log('\n\n2. CURRENCY FORMATTING\n');

console.log('Indian Rupees (default):');
console.log('  ₹1,000:', Format.currency(1000));
console.log('  ₹1,500.75:', Format.currency(1500.75));
console.log('  ₹10,00,000:', Format.currency(1000000));

console.log('\nOther Currencies:');
console.log('  USD:', Format.currency(1000.50, 'USD', 2));
console.log('  EUR:', Format.currency(999.99, 'EUR', 2));

console.log('\nWith Decimals:');
console.log('  ₹1,000.00:', Format.currency(1000, 'INR', 2));

// ============================================
// Example 3: Number Formatting
// ============================================
console.log('\n\n3. NUMBER FORMATTING\n');

console.log('Indian Number System:');
console.log('  1,23,456:', Format.number(123456));
console.log('  12,34,567:', Format.number(1234567));
console.log('  1,23,45,678:', Format.number(12345678));

console.log('\nWith Decimals:');
console.log('  12.35:', Format.number(12.345, 2));
console.log('  100.00:', Format.number(100, 2));

console.log('\nPercentage:');
console.log('  75%:', Format.percentage(75));
console.log('  66.67%:', Format.percentage(66.666, 2));
console.log('  100%:', Format.percentage(100));

// ============================================
// Example 4: Phone Number Formatting
// ============================================
console.log('\n\n4. PHONE NUMBER FORMATTING\n');

const phone = '9876543210';

console.log('Spaced (default):', Format.phone(phone));
console.log('Dashed:', Format.phone(phone, 'dashed'));
console.log('Grouped:', Format.phone(phone, 'grouped'));

// ============================================
// Example 5: File Size Formatting
// ============================================
console.log('\n\n5. FILE SIZE FORMATTING\n');

console.log('Bytes:', Format.fileSize(0));
console.log('1 KB:', Format.fileSize(1024));
console.log('1.50 KB:', Format.fileSize(1536));
console.log('1 MB:', Format.fileSize(1048576));
console.log('2.5 GB:', Format.fileSize(2684354560));
console.log('1 TB:', Format.fileSize(1099511627776));

// ============================================
// Example 6: Text Formatting
// ============================================
console.log('\n\n6. TEXT FORMATTING\n');

console.log('Truncate:');
console.log('  "This is...":', Format.truncate('This is a long text', 10));
console.log('  "Short":', Format.truncate('Short', 10));

console.log('\nCapitalize:');
console.log('  "Hello":', Format.capitalize('hello'));
console.log('  "Hello":', Format.capitalize('HELLO'));

console.log('\nTitle Case:');
console.log('  "Hello World":', Format.title('hello world'));
console.log('  "The Quick Brown Fox":', Format.title('the quick brown fox'));

// ============================================
// Example 7: Case Conversion
// ============================================
console.log('\n\n7. CASE CONVERSION\n');

console.log('From "HelloWorld":');
console.log('  Snake case:', Format.snake('HelloWorld'));
console.log('  Kebab case:', Format.kebab('HelloWorld'));

console.log('\nFrom "hello_world":');
console.log('  Camel case:', Format.camel('hello_world'));
console.log('  Studly case:', Format.studly('hello_world'));

console.log('\nFrom "hello-world":');
console.log('  Camel case:', Format.camel('hello-world'));
console.log('  Studly case:', Format.studly('hello-world'));

// ============================================
// Example 8: Plural & Boolean
// ============================================
console.log('\n\n8. PLURAL & BOOLEAN\n');

console.log('Plural:');
console.log('  1 item:', Format.plural(1, 'item'));
console.log('  5 items:', Format.plural(5, 'item'));
console.log('  1 person:', Format.plural(1, 'person', 'people'));
console.log('  5 people:', Format.plural(5, 'person', 'people'));

console.log('\nBoolean:');
console.log('  Yes:', Format.boolean(true));
console.log('  No:', Format.boolean(false));
console.log('  Active:', Format.boolean(true, 'Active', 'Inactive'));
console.log('  Inactive:', Format.boolean(false, 'Active', 'Inactive'));

// ============================================
// Example 9: List & Ordinal
// ============================================
console.log('\n\n9. LIST & ORDINAL\n');

console.log('List:');
console.log('  3 items:', Format.list(['apple', 'banana', 'cherry']));
console.log('  2 items:', Format.list(['item1', 'item2']));
console.log('  1 item:', Format.list(['one']));

console.log('\nOrdinal:');
console.log('  1st:', Format.ordinal(1));
console.log('  2nd:', Format.ordinal(2));
console.log('  3rd:', Format.ordinal(3));
console.log('  4th:', Format.ordinal(4));
console.log('  21st:', Format.ordinal(21));
console.log('  100th:', Format.ordinal(100));

// ============================================
// Example 10: Indian Number System
// ============================================
console.log('\n\n10. INDIAN NUMBER SYSTEM\n');

console.log('Short Format:');
console.log('  1.00K:', Format.indianNumber(1000));
console.log('  50.50K:', Format.indianNumber(50500));
console.log('  1.00L:', Format.indianNumber(100000));
console.log('  10.50L:', Format.indianNumber(1050000));
console.log('  1.00Cr:', Format.indianNumber(10000000));
console.log('  25.75Cr:', Format.indianNumber(257500000));

console.log('\nAmount in Words:');
console.log('  100:', Format.rupeeWords(100));
console.log('  1,000:', Format.rupeeWords(1000));
console.log('  1,00,000:', Format.rupeeWords(100000));
console.log('  10,00,000:', Format.rupeeWords(1000000));
console.log('  1,00,00,000:', Format.rupeeWords(10000000));
console.log('  12,345:', Format.rupeeWords(12345));

// ============================================
// Example 11: Real-World Use Cases
// ============================================
console.log('\n\n11. REAL-WORLD USE CASES\n');

// E-commerce product
const product = {
  name: 'Smartphone',
  price: 49999,
  originalPrice: 59999,
  discount: 16.67,
  stock: 125,
  size: 146800640, // bytes
  createdAt: new Date('2025-01-15'),
};

console.log('Product Display:');
console.log('  Name:', product.name);
console.log('  Price:', Format.currency(product.price));
console.log('  Was:', Format.currency(product.originalPrice));
console.log('  Save:', Format.percentage(product.discount, 0));
console.log('  Stock:', Format.number(product.stock), 'units');
console.log('  Size:', Format.fileSize(product.size));
console.log('  Listed:', Format.relativeTime(product.createdAt));

// User profile
const user = {
  name: 'ravi kumar',
  phone: '9876543210',
  joinedAt: new Date('2024-06-01'),
  isActive: true,
  totalOrders: 15,
  totalSpent: 125000,
};

console.log('\nUser Profile:');
console.log('  Name:', Format.title(user.name));
console.log('  Phone:', Format.phone(user.phone));
console.log('  Joined:', Format.date(user.joinedAt, 'long'));
console.log('  Member for:', Format.relativeTime(user.joinedAt));
console.log('  Status:', Format.boolean(user.isActive, 'Active', 'Suspended'));
console.log('  Orders:', user.totalOrders, Format.plural(user.totalOrders, 'order'));
console.log('  Spent:', Format.currency(user.totalSpent));
console.log('  Spent (short):', Format.indianNumber(user.totalSpent));

// Invoice
const invoice = {
  number: 'INV-2025-001',
  amount: 50000,
  tax: 9000,
  total: 59000,
  date: new Date(),
  dueIn: 2592000, // 30 days in seconds
};

console.log('\nInvoice:');
console.log('  Invoice:', invoice.number);
console.log('  Date:', Format.datetime(invoice.date));
console.log('  Amount:', Format.currency(invoice.amount));
console.log('  Tax (18%):', Format.currency(invoice.tax));
console.log('  Total:', Format.currency(invoice.total));
console.log('  In Words:', Format.rupeeWords(invoice.total));
console.log('  Due In:', Format.duration(invoice.dueIn));

console.log('\n═══════════════════════════════════════════════════');
console.log('            ALL EXAMPLES COMPLETED');
console.log('═══════════════════════════════════════════════════\n');
