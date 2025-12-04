/**
 * Command
 * Laravel-inspired console command base class
 */

export class Command {
  constructor() {
    this.signature = '';
    this.description = '';
    this.hidden = false;
    this.arguments = [];
    this.options = [];
  }

  /**
   * Execute the command
   */
  async handle() {
    throw new Error('Command handle() method must be implemented');
  }

  /**
   * Get command name from signature
   */
  getName() {
    if (this.signature) {
      return this.signature.split(' ')[0];
    }
    return this.name;
  }

  /**
   * Write output
   */
  info(message) {
    console.log(`\x1b[32m${message}\x1b[0m`);
  }

  /**
   * Write error
   */
  error(message) {
    console.error(`\x1b[31m${message}\x1b[0m`);
  }

  /**
   * Write warning
   */
  warn(message) {
    console.warn(`\x1b[33m${message}\x1b[0m`);
  }

  /**
   * Write line
   */
  line(message = '') {
    console.log(message);
  }

  /**
   * Write new line
   */
  newLine(count = 1) {
    for (let i = 0; i < count; i++) {
      console.log('');
    }
  }

  /**
   * Ask question
   */
  async ask(question, defaultAnswer = null) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      const prompt = defaultAnswer
        ? `${question} [${defaultAnswer}]: `
        : `${question}: `;

      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer || defaultAnswer);
      });
    });
  }

  /**
   * Ask for confirmation
   */
  async confirm(question, defaultAnswer = false) {
    const answer = await this.ask(
      `${question} (yes/no)`,
      defaultAnswer ? 'yes' : 'no'
    );
    return ['yes', 'y', '1', 'true'].includes(answer.toLowerCase());
  }

  /**
   * Ask for choice
   */
  async choice(question, choices, defaultIndex = 0) {
    this.line(question);
    choices.forEach((choice, index) => {
      this.line(`  [${index}] ${choice}`);
    });

    const answer = await this.ask('Select option', defaultIndex.toString());
    const index = parseInt(answer);

    return choices[index] || choices[defaultIndex];
  }

  /**
   * Display table
   */
  table(headers, rows) {
    const columnWidths = headers.map((header, i) => {
      const values = [header, ...rows.map(row => String(row[i] || ''))];
      return Math.max(...values.map(v => v.length));
    });

    const separator = columnWidths.map(w => '-'.repeat(w + 2)).join('+');

    const formatRow = (row) => {
      return row.map((cell, i) => {
        return String(cell).padEnd(columnWidths[i]);
      }).join(' | ');
    };

    this.line(separator);
    this.line(formatRow(headers));
    this.line(separator);

    rows.forEach(row => {
      this.line(formatRow(row));
    });

    this.line(separator);
  }

  /**
   * Call another command
   */
  async call(command, args = {}) {
    const Application = require('./Application.js').default;
    const app = new Application();
    return await app.call(command, args);
  }

  /**
   * Get argument value
   */
  argument(name) {
    return this._arguments?.[name];
  }

  /**
   * Get option value
   */
  option(name) {
    return this._options?.[name];
  }

  /**
   * Get all arguments
   */
  arguments() {
    return this._arguments || {};
  }

  /**
   * Get all options
   */
  options() {
    return this._options || {};
  }
}

export default Command;
