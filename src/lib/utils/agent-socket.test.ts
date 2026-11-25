import assert from 'node:assert/strict';
import test from 'node:test';

import { agentSettings } from '$lib/stores/agent-settings';
import { realtimeSettings } from '$lib/stores/realtime-settings';
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

  let realtimeUrl = '';
  const unsubscribeRealtimeSettings = realtimeSettings.subscribe((value) => {
    realtimeUrl = value.connection.url;
  });

  agentSocketState.connect();
  const firstSocket = FakeWebSocket.instances.at(-1)!;
  assert.equal(realtimeUrl, 'http://localhost:8080');

  agentSocketState.connect();
  const secondSocket = FakeWebSocket.instances.at(-1)!;

  assert.equal(firstSocket.closed, true, 'previous socket should be closed before reconnect');
  assert.notEqual(firstSocket, secondSocket, 'new websocket instance should be created');

  agentSettings.update((current) => ({
    ...current,
    connection: { ...current.connection, url: 'wss://viewer.example/api/ws' },
  }));
  agentSocketState.connect();
  assert.equal(realtimeUrl, 'https://viewer.example/api');

  agentSocketState.disconnect();
  unsubscribeRealtimeSettings();
  globalThis.WebSocket = originalWebSocket;
});
