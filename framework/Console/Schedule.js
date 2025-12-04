/**
 * Schedule
 * Laravel-inspired task scheduling
 */

import { EventEmitter } from 'events';

export class Schedule extends EventEmitter {
  constructor() {
    super();
    this.events = [];
  }

  /**
   * Schedule a command
   */
  command(command, args = []) {
    const event = new ScheduledEvent(command, args);
    this.events.push(event);
    return event;
  }

  /**
   * Schedule a callback
   */
  call(callback, args = []) {
    const event = new ScheduledCallback(callback, args);
    this.events.push(event);
    return event;
  }

  /**
   * Schedule an exec command
   */
  exec(command) {
    const event = new ScheduledExec(command);
    this.events.push(event);
    return event;
  }

  /**
   * Get all scheduled events that are due
   */
  dueEvents() {
    return this.events.filter(event => event.isDue());
  }

  /**
   * Run all due events
   */
  async run() {
    const dueEvents = this.dueEvents();

    for (const event of dueEvents) {
      await event.run();
    }

    return dueEvents.length;
  }

  /**
   * Start the scheduler (runs every minute)
   */
  start() {
    // Run immediately
    this.run();

    // Then run every minute
    setInterval(() => {
      this.run();
    }, 60000);
  }
}

/**
 * Scheduled Event
 */
class ScheduledEvent {
  constructor(command, args = []) {
    this.command = command;
    this.args = args;
    this.expression = '* * * * *'; // Default: every minute
    this.timezone = null;
    this.description = null;
    this.runInBackground = false;
  }

  /**
   * Set cron expression
   */
  cron(expression) {
    this.expression = expression;
    return this;
  }

  /**
   * Run every minute
   */
  everyMinute() {
    return this.cron('* * * * *');
  }

  /**
   * Run every five minutes
   */
  everyFiveMinutes() {
    return this.cron('*/5 * * * *');
  }

  /**
   * Run every ten minutes
   */
  everyTenMinutes() {
    return this.cron('*/10 * * * *');
  }

  /**
   * Run every fifteen minutes
   */
  everyFifteenMinutes() {
    return this.cron('*/15 * * * *');
  }

  /**
   * Run every thirty minutes
   */
  everyThirtyMinutes() {
    return this.cron('*/30 * * * *');
  }

  /**
   * Run hourly
   */
  hourly() {
    return this.cron('0 * * * *');
  }

  /**
   * Run daily
   */
  daily() {
    return this.cron('0 0 * * *');
  }

  /**
   * Run daily at specific time
   */
  dailyAt(time) {
    const [hour, minute] = time.split(':');
    return this.cron(`${minute || 0} ${hour} * * *`);
  }

  /**
   * Run weekly
   */
  weekly() {
    return this.cron('0 0 * * 0');
  }

  /**
   * Run monthly
   */
  monthly() {
    return this.cron('0 0 1 * *');
  }

  /**
   * Run yearly
   */
  yearly() {
    return this.cron('0 0 1 1 *');
  }

  /**
   * Run on weekdays
   */
  weekdays() {
    return this.cron('0 0 * * 1-5');
  }

  /**
   * Run on weekends
   */
  weekends() {
    return this.cron('0 0 * * 0,6');
  }

  /**
   * Run on mondays
   */
  mondays() {
    return this.cron('0 0 * * 1');
  }

  /**
   * Run on tuesdays
   */
  tuesdays() {
    return this.cron('0 0 * * 2');
  }

  /**
   * Run on wednesdays
   */
  wednesdays() {
    return this.cron('0 0 * * 3');
  }

  /**
   * Run on thursdays
   */
  thursdays() {
    return this.cron('0 0 * * 4');
  }

  /**
   * Run on fridays
   */
  fridays() {
    return this.cron('0 0 * * 5');
  }

  /**
   * Run on saturdays
   */
  saturdays() {
    return this.cron('0 0 * * 6');
  }

  /**
   * Run on sundays
   */
  sundays() {
    return this.cron('0 0 * * 0');
  }

  /**
   * Set timezone
   */
  timezone(tz) {
    this.timezone = tz;
    return this;
  }

  /**
   * Set description
   */
  name(description) {
    this.description = description;
    return this;
  }

  /**
   * Run in background
   */
  runInBackground() {
    this.runInBackground = true;
    return this;
  }

  /**
   * Check if event is due
   */
  isDue() {
    const cronParser = require('cron-parser');
    
    try {
      const interval = cronParser.parseExpression(this.expression, {
        currentDate: new Date(),
        tz: this.timezone
      });

      const next = interval.next().toDate();
      const now = new Date();

      // Check if we're within the same minute
      return (
        next.getFullYear() === now.getFullYear() &&
        next.getMonth() === now.getMonth() &&
        next.getDate() === now.getDate() &&
        next.getHours() === now.getHours() &&
        next.getMinutes() === now.getMinutes()
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Run the event
   */
  async run() {
    throw new Error('run() must be implemented');
  }
}

/**
 * Scheduled Callback
 */
class ScheduledCallback extends ScheduledEvent {
  constructor(callback, args = []) {
    super(callback, args);
    this.callback = callback;
  }

  async run() {
    await this.callback(...this.args);
  }
}

/**
 * Scheduled Exec
 */
class ScheduledExec extends ScheduledEvent {
  constructor(command) {
    super(command);
    this.execCommand = command;
  }

  async run() {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);

    await execPromise(this.execCommand);
  }
}

export default Schedule;
