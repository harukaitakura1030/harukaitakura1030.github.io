import assert from 'node:assert/strict';
import test from 'node:test';

import { agentSettings } from '$lib/stores/agent-settings';
import { agentSocketState } from './agent-socket';

const originalWebSocket = globalThis.WebSocket;

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  public url: string | URL;
  public readyState = 1;
  public closed = false;
  public sent: string[] = [];

  constructor(url: string | URL) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.closed = true;
    this.readyState = 3;
  }
}

test('reconnect closes the previous socket before creating a new one', () => {
  globalThis.WebSocket = FakeWebSocket as any;

  agentSettings.set({
    connection: { url: 'ws://localhost:8080/ws', token: '' },
    team: 'test-team',
    display: { largeScale: false },
  });

  agentSocketState.connect();
  const firstSocket = FakeWebSocket.instances.at(-1)!;

  agentSocketState.connect();
  const secondSocket = FakeWebSocket.instances.at(-1)!;

  assert.equal(firstSocket.closed, true, 'previous socket should be closed before reconnect');
  assert.notEqual(firstSocket, secondSocket, 'new websocket instance should be created');

  agentSocketState.disconnect();
  globalThis.WebSocket = originalWebSocket;
});
