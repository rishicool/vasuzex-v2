/**
 * Schedule Tests
 * Tests for task scheduling functionality
 * 
 * Tests Cover:
 * - command() - scheduling commands
 * - call() - scheduling callbacks
 * - exec() - scheduling exec commands
 * - dueEvents() - getting due events
 * - run() - executing due events
 * - ScheduledEvent methods (cron, everyMinute, hourly, daily, etc.)
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Schedule', () => {
  let Schedule;
  let schedule;

  beforeEach(async () => {
    const module = await import('../../../framework/Console/Schedule.js');
    Schedule = module.Schedule;
    schedule = new Schedule();
  });

  describe('Constructor', () => {
    it('should initialize with empty events array', () => {
      expect(schedule.events).toEqual([]);
    });

    it('should extend EventEmitter', () => {
      expect(schedule.on).toBeDefined();
      expect(schedule.emit).toBeDefined();
    });
  });

  describe('command()', () => {
    it('should schedule a command', () => {
      const event = schedule.command('node backup.js');

      expect(schedule.events.length).toBe(1);
      expect(event.command).toBe('node backup.js');
    });

    it('should schedule command with args', () => {
      const event = schedule.command('node backup.js', ['--full']);

      expect(event.args).toEqual(['--full']);
    });

    it('should return scheduled event for chaining', () => {
      const event = schedule.command('test');

      expect(event).toBeDefined();
      expect(typeof event.cron).toBe('function');
    });
  });

  describe('call()', () => {
    it('should schedule a callback', () => {
      const callback = () => console.log('test');
      const event = schedule.call(callback);

      expect(schedule.events.length).toBe(1);
    });

    it('should schedule callback with args', () => {
      const callback = (arg) => console.log(arg);
      const event = schedule.call(callback, ['test']);

      expect(event.args).toEqual(['test']);
    });
  });

  describe('exec()', () => {
    it('should schedule an exec command', () => {
      const event = schedule.exec('ls -la');

      expect(schedule.events.length).toBe(1);
      expect(event.command).toBe('ls -la');
    });
  });

  describe('dueEvents()', () => {
    it('should return empty array when no events', () => {
      const due = schedule.dueEvents();

      expect(due).toEqual([]);
    });

    it('should filter due events', () => {
      // Mock isDue to return true
      const event = schedule.command('test');
      event.isDue = () => true;

      const due = schedule.dueEvents();

      expect(due.length).toBe(1);
    });

    it('should exclude non-due events', () => {
      const event1 = schedule.command('test1');
      const event2 = schedule.command('test2');
      
      event1.isDue = () => true;
      event2.isDue = () => false;

      const due = schedule.dueEvents();

      expect(due.length).toBe(1);
      expect(due[0]).toBe(event1);
    });
  });

  describe('run()', () => {
    it('should run all due events', async () => {
      const callback = jest.fn();
      const event = schedule.call(callback);
      event.isDue = () => true;
      event.run = jest.fn().mockResolvedValue(undefined);

      const count = await schedule.run();

      expect(event.run).toHaveBeenCalled();
      expect(count).toBe(1);
    });

    it('should return count of executed events', async () => {
      const event1 = schedule.command('test1');
      const event2 = schedule.command('test2');
      
      event1.isDue = () => true;
      event2.isDue = () => true;
      event1.run = jest.fn().mockResolvedValue(undefined);
      event2.run = jest.fn().mockResolvedValue(undefined);

      const count = await schedule.run();

      expect(count).toBe(2);
    });

    it('should not run non-due events', async () => {
      const event = schedule.command('test');
      event.isDue = () => false;
      event.run = jest.fn();

      await schedule.run();

      expect(event.run).not.toHaveBeenCalled();
    });
  });

  describe('ScheduledEvent', () => {
    it('should have default cron expression', () => {
      const event = schedule.command('test');

      expect(event.expression).toBe('* * * * *');
    });

    it('should allow custom cron expression', () => {
      const event = schedule.command('test').cron('0 0 * * *');

      expect(event.expression).toBe('0 0 * * *');
    });

    it('should support method chaining', () => {
      const event = schedule.command('test')
        .cron('0 0 * * *');

      expect(event.expression).toBe('0 0 * * *');
    });
  });

  describe('Multiple Events', () => {
    it('should handle multiple scheduled events', () => {
      schedule.command('backup');
      schedule.call(() => {});
      schedule.exec('cleanup');

      expect(schedule.events.length).toBe(3);
    });

    it('should maintain event order', () => {
      const e1 = schedule.command('first');
      const e2 = schedule.command('second');
      const e3 = schedule.command('third');

      expect(schedule.events[0]).toBe(e1);
      expect(schedule.events[1]).toBe(e2);
      expect(schedule.events[2]).toBe(e3);
    });
  });
});
