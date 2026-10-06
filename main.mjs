import { connect } from 'node:net';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LAYOUTS, leaves, moves, ratios } from './layouts.mjs';

const call = (method, params) =>
  new Promise((resolve, reject) => {
    let buffer = '';
    const socket = connect(process.env.HERDR_SOCKET_PATH, () =>
      socket.write(JSON.stringify({ id: method, method, params }) + '\n'),
    );
    socket.on('data', (chunk) => {
      buffer += chunk;
      if (!buffer.includes('\n')) return;
      socket.end();
      const { result, error } = JSON.parse(buffer.slice(0, buffer.indexOf('\n')));
      error ? reject(new Error(`${method}: ${error.message}`)) : resolve(result);
    });
    socket.on('error', reject);
  });

const { layout } = await call('pane.layout', { pane_id: process.env.HERDR_PANE_ID });
const { workspace_id, tab_id, focused_pane_id, panes } = layout;
if (panes.length < 2) process.exit(0);
if (layout.zoomed) await call('pane.zoom', { pane_id: focused_pane_id, mode: 'off' });

async function balance() {
  const { root } = (await call('layout.export', { tab_id })).layout;
  for (const { path, ratio } of ratios(root)) await call('layout.set_split_ratio', { tab_id, path, ratio });
}

async function rebuild(tree) {
  const [, ...rest] = leaves(tree);
  const parked = await call('pane.move', {
    pane_id: rest[0],
    destination: { type: 'new_tab', workspace_id, label: 'layouts' },
  });
  const scratch = parked.move_result.pane.tab_id;
  for (const pane_id of rest.slice(1)) {
    await call('pane.move', {
      pane_id,
      destination: { type: 'tab', tab_id: scratch, target_pane_id: rest[0], split: 'down' },
    });
  }
  for (const { pane_id, target_pane_id, split } of moves(tree)) {
    await call('pane.move', { pane_id, destination: { type: 'tab', tab_id, target_pane_id, split } });
  }
  await call('pane.focus', { pane_id: focused_pane_id });
}

const file = join(process.env.HERDR_PLUGIN_STATE_DIR, 'layouts.json');
let state = {};
try {
  state = JSON.parse(readFileSync(file, 'utf8'));
} catch {}

async function select(name) {
  const ids = panes.toSorted((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x).map((p) => p.pane_id);
  await rebuild(LAYOUTS[name](ids));
  await balance();
  writeFileSync(file, JSON.stringify({ ...state, [tab_id]: name }));
}

const step = (offset) => {
  const names = Object.keys(LAYOUTS);
  const current = names.indexOf(state[tab_id]);
  const start = current < 0 && offset < 0 ? 0 : current;
  return select(names[(start + offset + names.length) % names.length]);
};

const [action, name] = process.argv.slice(2);
const actions = { 'next-layout': () => step(1), 'previous-layout': () => step(-1), 'select-layout': () => select(name), balance };
await actions[action]();
