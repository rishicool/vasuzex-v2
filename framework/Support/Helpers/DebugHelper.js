/**
 * DebugHelper - Debugging utilities
 * 
 * Laravel-style debugging functions for development.
 */

import util from 'util';
import chalk from 'chalk';

/**
 * Get colored output based on type
 * 
 * @param {*} value - Value to format
 * @returns {string} Formatted string
 */
function formatValue(value) {
  const options = {
    depth: null,
    colors: true,
    maxArrayLength: null,
    maxStringLength: null,
    breakLength: 80,
    compact: false,
  };
  
  return util.inspect(value, options);
}

/**
 * Get caller information (file and line number)
 * 
 * @returns {object} Caller info
 */
function getCallerInfo() {
  const stack = new Error().stack;
  const lines = stack.split('\n');
  
  // Skip first 3 lines (Error, getCallerInfo, inspect/dd)
  const callerLine = lines[3] || lines[2] || '';
  
  // Extract file path and line number
  const match = callerLine.match(/\((.+):(\d+):(\d+)\)/) || 
                callerLine.match(/at (.+):(\d+):(\d+)/);
  
  if (match) {
    const [, file, line, column] = match;
    // Get just the filename, not full path
    const filename = file.split('/').pop();
    return { file: filename, line, column };
  }
  
  return { file: 'unknown', line: '?', column: '?' };
}

/**
 * Print separator line
 * 
 * @param {string} char - Character to repeat
 * @param {number} length - Line length
 */
function printSeparator(char = '─', length = 80) {
  console.log(chalk.gray(char.repeat(length)));
}

/**
 * Inspect value and continue execution (Laravel's dump())
 * 
 * Pretty-prints the value with colors and continues execution.
 * Useful for debugging without stopping the application.
 * 
 * @param {*} value - Value to inspect
 * @param {string} label - Optional label for the output
 * @returns {*} The original value (for chaining)
 * 
 * @example
 * // Simple inspection
 * inspect(user);
 * 
 * @example
 * // With label
 * inspect(orders, 'User Orders');
 * 
 * @example
 * // Chain multiple inspects
 * inspect(user, 'User')
 * inspect(user.orders, 'Orders')
 * inspect(user.profile, 'Profile')
 * 
 * @example
 * // Inspect in middleware
 * app.use((req, res, next) => {
 *   inspect(req.body, 'Request Body');
 *   inspect(req.headers, 'Headers');
 *   next();
 * });
 */
export function inspect(value, label = null) {
  const caller = getCallerInfo();
  
  console.log(''); // Empty line for spacing
  printSeparator('═');
  
  // Print header with location
  console.log(chalk.cyan.bold('🔍 INSPECT') + chalk.gray(` @ ${caller.file}:${caller.line}`));
  
  if (label) {
    console.log(chalk.yellow.bold(`📋 ${label}`));
  }
  
  printSeparator();
  
  // Print the value
  console.log(formatValue(value));
  
  printSeparator('═');
  console.log(''); // Empty line for spacing
  
  return value; // Return value for chaining
}

/**
 * Dump and Die (Laravel's dd())
 * 
 * Pretty-prints the value with colors and exits the process.
 * Use this when you want to stop execution immediately for debugging.
 * 
 * @param {*} value - Value to dump
 * @param {string} label - Optional label for the output
 * @param {number} exitCode - Exit code (default: 1)
 * 
 * @example
 * // Stop execution and dump
 * dd(user);
 * 
 * @example
 * // With label
 * dd(response, 'API Response');
 * 
 * @example
 * // Dump multiple values before exit
 * inspect(user, 'User');
 * inspect(orders, 'Orders');
 * dd(finalData, 'Final Data'); // This will exit
 * 
 * @example
 * // In route handler
 * router.get('/users/:id', async (req, res) => {
 *   const user = await User.find(req.params.id);
 *   dd(user); // Stop here to inspect user
 *   res.json(user);
 * });
 */
export function dd(value, label = null, exitCode = 1) {
  const caller = getCallerInfo();
  
  console.log(''); // Empty line for spacing
  printSeparator('═');
  
  // Print header with location
  console.log(chalk.red.bold('💀 DUMP AND DIE') + chalk.gray(` @ ${caller.file}:${caller.line}`));
  
  if (label) {
    console.log(chalk.yellow.bold(`📋 ${label}`));
  }
  
  printSeparator();
  
  // Print the value
  console.log(formatValue(value));
  
  printSeparator('═');
  console.log(chalk.red.bold('\n⚠️  Process terminated by dd()\n'));
  
  // Exit the process
  process.exit(exitCode);
}

/**
 * Dump value and continue (Laravel's dump())
 * Alias for inspect() - more Laravel-like naming
 * 
 * @param {*} value - Value to dump
 * @param {string} label - Optional label
 * @returns {*} The original value
 */
export function dump(value, label = null) {
  return inspect(value, label);
}

/**
 * Debug helper class for OOP approach
 */
export class DebugHelper {
  static inspect = inspect;
  static dd = dd;
  static dump = dump;
}

export default DebugHelper;
