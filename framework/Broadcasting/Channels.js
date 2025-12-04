/**
 * Broadcasting Channel Classes
 */

export class Channel {
  constructor(name) {
    this.name = name;
  }
}

export class PrivateChannel extends Channel {
  constructor(name) {
    super(`private-${name}`);
  }
}

export class PresenceChannel extends Channel {
  constructor(name) {
    super(`presence-${name}`);
  }
}

export class EncryptedPrivateChannel extends PrivateChannel {
  constructor(name) {
    super(name);
    this.encrypted = true;
  }
}
