/**
 * Indian Validators Examples
 * 
 * Run: node examples/indian-validators-example.js
 */

import { IndianValidators } from 'vasuzex/Services/Validation/IndianValidators';

console.log('═══════════════════════════════════════════════════');
console.log('        INDIAN VALIDATORS EXAMPLES');
console.log('═══════════════════════════════════════════════════\n');

// ============================================
// Example 1: Phone Number Validation
// ============================================
console.log('1. PHONE NUMBER VALIDATION\n');

const phones = [
  '9876543210',    // Valid
  '8123456789',    // Valid
  '7000000000',    // Valid
  '5876543210',    // Invalid (starts with 5)
  '98765432',      // Invalid (too short)
  '98765432109',   // Invalid (too long)
];

phones.forEach(phone => {
  const result = IndianValidators.phone(phone);
  console.log(`${phone}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 2: PIN Code Validation
// ============================================
console.log('\n\n2. PIN CODE VALIDATION\n');

const pincodes = [
  '110001',    // Valid (Delhi)
  '400001',    // Valid (Mumbai)
  '560001',    // Valid (Bangalore)
  '011001',    // Invalid (starts with 0)
  '1100',      // Invalid (too short)
  '1100011',   // Invalid (too long)
];

pincodes.forEach(pincode => {
  const result = IndianValidators.pincode(pincode);
  console.log(`${pincode}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 3: IFSC Code Validation
// ============================================
console.log('\n\n3. IFSC CODE VALIDATION\n');

const ifscCodes = [
  'SBIN0001234',    // Valid (State Bank)
  'HDFC0000123',    // Valid (HDFC)
  'ICIC0001234',    // Valid (ICICI)
  'SBIN1001234',    // Invalid (5th char must be 0)
  'SBI00001234',    // Invalid (too short)
  'sbin0001234',    // Invalid (lowercase)
];

ifscCodes.forEach(ifsc => {
  const result = IndianValidators.ifsc(ifsc);
  console.log(`${ifsc}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 4: PAN Card Validation
// ============================================
console.log('\n\n4. PAN CARD VALIDATION\n');

const panNumbers = [
  'ABCDE1234F',    // Valid
  'AAAPL1234C',    // Valid
  'BBBBB5678D',    // Valid
  'ABC1234567',    // Invalid (wrong format)
  'abcde1234f',    // Invalid (lowercase)
  'ABCDE12345',    // Invalid (wrong format)
];

panNumbers.forEach(pan => {
  const result = IndianValidators.pan(pan);
  console.log(`${pan}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 5: Aadhaar Validation
// ============================================
console.log('\n\n5. AADHAAR VALIDATION\n');

const aadhaarNumbers = [
  '234567890123',    // Valid format (12 digits, starts with 2-9)
  '987654321098',    // Valid format
  '123456789012',    // Invalid (starts with 1)
  '012345678901',    // Invalid (starts with 0)
  '23456789012',     // Invalid (too short)
  '2345678901234',   // Invalid (too long)
];

aadhaarNumbers.forEach(aadhaar => {
  const result = IndianValidators.aadhaar(aadhaar);
  console.log(`${aadhaar}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 6: GSTIN Validation
// ============================================
console.log('\n\n6. GSTIN VALIDATION\n');

const gstinNumbers = [
  '29ABCDE1234F1Z5',    // Valid
  '07AAAPL1234C1ZF',    // Valid
  '29ABCDE1234F1Z',     // Invalid (too short)
  '29abcde1234f1z5',    // Invalid (lowercase)
  '29ABCDE1234F0Z5',    // Invalid (12th char can't be 0)
];

gstinNumbers.forEach(gstin => {
  const result = IndianValidators.gstin(gstin);
  console.log(`${gstin}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 7: Vehicle Number Validation
// ============================================
console.log('\n\n7. VEHICLE NUMBER VALIDATION\n');

const vehicleNumbers = [
  'DL01AB1234',        // Valid
  'MH12DE5678',        // Valid
  'KA03MH9999',        // Valid
  'DL-01-AB-1234',     // Valid (with dashes)
  'DL 01 AB 1234',     // Valid (with spaces)
  'DL01A12345',        // Invalid (wrong format)
  'dl01ab1234',        // Invalid (lowercase)
];

vehicleNumbers.forEach(vehicle => {
  const result = IndianValidators.vehicleNumber(vehicle);
  console.log(`${vehicle}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 8: UPI ID Validation
// ============================================
console.log('\n\n8. UPI ID VALIDATION\n');

const upiIds = [
  'user@paytm',           // Valid
  'myname@okaxis',        // Valid
  'john.doe@ybl',         // Valid
  'user_123@phonepe',     // Valid
  'user@',                // Invalid (no bank)
  '@bank',                // Invalid (no username)
  'user name@bank',       // Invalid (space)
];

upiIds.forEach(upi => {
  const result = IndianValidators.upi(upi);
  console.log(`${upi}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 9: Passport Validation
// ============================================
console.log('\n\n9. PASSPORT VALIDATION\n');

const passports = [
  'A1234567',    // Valid
  'Z9876543',    // Valid
  'K1111111',    // Valid
  'a1234567',    // Invalid (lowercase)
  'A123456',     // Invalid (too short)
  'AB1234567',   // Invalid (2 letters)
];

passports.forEach(passport => {
  const result = IndianValidators.passport(passport);
  console.log(`${passport}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 10: Voter ID Validation
// ============================================
console.log('\n\n10. VOTER ID VALIDATION\n');

const voterIds = [
  'ABC1234567',    // Valid
  'XYZ9876543',    // Valid
  'DEF0000000',    // Valid
  'abc1234567',    // Invalid (lowercase)
  'AB1234567',     // Invalid (2 letters)
  'ABCD1234567',   // Invalid (4 letters)
];

voterIds.forEach(voterId => {
  const result = IndianValidators.voterId(voterId);
  console.log(`${voterId}: ${result.isValid ? '✓ Valid' : '✗ ' + result.message}`);
});

// ============================================
// Example 11: Integration with Validation
// ============================================
console.log('\n\n11. INTEGRATION WITH VALIDATION FACTORY\n');

import { ValidationFactory } from 'vasuzex/Services/Validation/ValidationFactory';

const validator = new ValidationFactory();

// User registration data
const userData = {
  phone: '9876543210',
  pincode: '110001',
  pan: 'ABCDE1234F',
  ifsc: 'SBIN0001234',
};

const rules = {
  phone: 'required|phone',
  pincode: 'required|pincode',
  pan: 'required|pan',
  ifsc: 'required|ifsc',
};

try {
  const result = validator.make(userData, rules);
  await result.validate();
  console.log('✓ All validations passed!');
  console.log('Validated data:', result.validated);
} catch (error) {
  console.log('✗ Validation failed:');
  console.log(error.errors);
}

// ============================================
// Example 12: Real-World KYC Form
// ============================================
console.log('\n\n12. REAL-WORLD KYC FORM VALIDATION\n');

const kycData = {
  fullName: 'Ravi Kumar',
  email: 'ravi@example.com',
  phone: '9876543210',
  aadhaar: '234567890123',
  pan: 'ABCDE1234F',
  address: '123 Main Street',
  pincode: '110001',
  bankIfsc: 'SBIN0001234',
  accountNumber: '12345678901234',
};

const kycRules = {
  fullName: 'required|string',
  email: 'required|email',
  phone: 'required|phone',
  aadhaar: 'required|aadhaar',
  pan: 'required|pan',
  address: 'required|string|min:10',
  pincode: 'required|pincode',
  bankIfsc: 'required|ifsc',
  accountNumber: 'required|string|min:9|max:18',
};

try {
  const kycValidator = validator.make(kycData, kycRules);
  await kycValidator.validate();
  console.log('✓ KYC validation passed!');
  console.log('Applicant:', kycData.fullName);
  console.log('Phone:', kycData.phone);
  console.log('PAN:', kycData.pan);
  console.log('Aadhaar:', kycData.aadhaar);
} catch (error) {
  console.log('✗ KYC validation failed:');
  console.log(error.errors);
}

console.log('\n═══════════════════════════════════════════════════');
console.log('          ALL EXAMPLES COMPLETED');
console.log('═══════════════════════════════════════════════════\n');
