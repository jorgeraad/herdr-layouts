import assert from 'node:assert/strict';
import { LAYOUTS, leaves, moves, ratios } from './layouts.mjs';

const ids = ['a', 'b', 'c', 'd', 'e'];
const shape = (node) => (node.type === 'pane' ? node.pane_id : [node.direction, shape(node.first), shape(node.second)]);

assert.deepEqual(Object.keys(LAYOUTS), ['even-horizontal', 'even-vertical', 'main-horizontal', 'main-vertical', 'tiled']);
assert.deepEqual(shape(LAYOUTS['even-horizontal'](ids)), ['right', ['right', 'a', 'b'], ['right', 'c', ['right', 'd', 'e']]]);
assert.deepEqual(shape(LAYOUTS['even-vertical'](['a', 'b'])), ['down', 'a', 'b']);
assert.deepEqual(shape(LAYOUTS['main-horizontal'](['a', 'b', 'c'])), ['down', 'a', ['right', 'b', 'c']]);
assert.deepEqual(shape(LAYOUTS['main-vertical'](['a', 'b', 'c'])), ['right', 'a', ['down', 'b', 'c']]);
assert.deepEqual(shape(LAYOUTS.tiled(ids)), ['down', ['right', 'a', 'b'], ['down', ['right', 'c', 'd'], 'e']]);
assert.deepEqual(shape(LAYOUTS.tiled(['a', 'b', 'c'])), ['down', ['right', 'a', 'b'], 'c']);

for (const build of Object.values(LAYOUTS)) assert.deepEqual(leaves(build(ids)), ids);

const r = (tree) => ratios(tree).map(({ path, ratio }) => [path.map(Number).join(''), +ratio.toFixed(3)]);
assert.deepEqual(r(LAYOUTS['even-horizontal'](ids)), [['', 0.4], ['0', 0.5], ['1', 0.333], ['11', 0.5]]);
assert.deepEqual(r(LAYOUTS.tiled(ids)), [['', 0.333], ['0', 0.5], ['1', 0.5], ['10', 0.5]]);
assert.deepEqual(r(LAYOUTS['main-vertical'](['a', 'b', 'c'])), [['', 0.5], ['1', 0.5]]);

assert.deepEqual(moves(LAYOUTS['even-vertical'](['a', 'b', 'c'])), [
  { pane_id: 'b', target_pane_id: 'a', split: 'down' },
  { pane_id: 'c', target_pane_id: 'b', split: 'down' },
]);

console.log('ok');
