/**
 * Console Application
 * Laravel-inspired Artisan console application
 */

export class Application {
  constructor(app = null) {
    this.app = app;
    this.commands = new Map();
  }

  /**
   * Register a command
   */
  add(command) {
    const instance = typeof command === 'function' ? new command() : command;
    const name = instance.getName();
    this.commands.set(name, instance);
    return this;
  }

  /**
   * Register multiple commands
   */
  addCommands(commands) {
    commands.forEach(command => this.add(command));
    return this;
  }

  /**
   * Find command by name
   */
  find(name) {
    return this.commands.get(name);
  }

  /**
   * Check if command exists
   */
  has(name) {
    return this.commands.has(name);
  }

  /**
   * Run console application
   */
  async run(argv = process.argv) {
    const args = argv.slice(2);
    
    if (args.length === 0 || args[0] === 'list') {
      return this.listCommands();
    }

    const commandName = args[0];
    const command = this.find(commandName);

    if (!command) {
      console.error(`Command "${commandName}" not found.`);
      return 1;
    }

    // Parse arguments and options
    const parsedArgs = this.parseArguments(args.slice(1));
    command._arguments = parsedArgs.arguments;
    command._options = parsedArgs.options;

    try {
      const result = await command.handle();
      return result || 0;
    } catch (error) {
      console.error(`Error executing command: ${error.message}`);
      console.error(error.stack);
      return 1;
    }
  }

  /**
   * Call a command programmatically
   */
  async call(commandName, args = {}) {
    const command = this.find(commandName);

    if (!command) {
      throw new Error(`Command "${commandName}" not found.`);
    }

    command._arguments = args;
    command._options = args;

    return await command.handle();
  }

  /**
   * Parse command arguments and options
   */
  parseArguments(args) {
    const result = {
      arguments: {},
      options: {}
    };

    let argIndex = 0;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        // Long option
        const [key, value] = arg.substring(2).split('=');
        result.options[key] = value !== undefined ? value : true;
      } else if (arg.startsWith('-')) {
        // Short option
        const key = arg.substring(1);
        result.options[key] = true;
      } else {
        // Positional argument
        result.arguments[argIndex++] = arg;
      }
    }

    return result;
  }

  /**
   * List all registered commands
   */
  listCommands() {
    console.log('\x1b[33mAvailable commands:\x1b[0m');
    console.log('');

    const commands = Array.from(this.commands.values())
      .filter(cmd => !cmd.hidden)
      .sort((a, b) => a.getName().localeCompare(b.getName()));

    const maxLength = Math.max(...commands.map(cmd => cmd.getName().length));

    commands.forEach(command => {
      const name = command.getName().padEnd(maxLength + 2);
      const description = command.description || '';
      console.log(`  \x1b[32m${name}\x1b[0m ${description}`);
    });

    console.log('');
  }

  /**
   * Get all registered commands
   */
  all() {
    return Array.from(this.commands.values());
  }
}

export default Application;
