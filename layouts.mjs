const leaf = (pane_id) => ({ type: 'pane', pane_id });
const split = (direction, first, second) => ({ type: 'split', direction, first, second });

export function even(nodes, direction) {
  if (nodes.length === 1) return nodes[0];
  const half = Math.floor(nodes.length / 2);
  return split(direction, even(nodes.slice(0, half), direction), even(nodes.slice(half), direction));
}

function grid(ids) {
  let rows = 1;
  let columns = 1;
  while (rows * columns < ids.length) {
    rows++;
    if (rows * columns < ids.length) columns++;
  }
  const lines = [];
  for (let i = 0; i < ids.length; i += columns) lines.push(ids.slice(i, i + columns));
  return lines;
}

const main = (direction, stack) => ([first, ...rest]) =>
  split(direction, leaf(first), even(rest.map(leaf), stack));

export const LAYOUTS = {
  'even-horizontal': (ids) => even(ids.map(leaf), 'right'),
  'even-vertical': (ids) => even(ids.map(leaf), 'down'),
  'main-horizontal': main('down', 'right'),
  'main-vertical': main('right', 'down'),
  tiled: (ids) => even(grid(ids).map((line) => even(line.map(leaf), 'right')), 'down'),
};

export const leaves = (node) =>
  node.type === 'pane' ? [node.pane_id] : [...leaves(node.first), ...leaves(node.second)];

function span(node, direction) {
  if (node.type === 'pane') return 1;
  const a = span(node.first, direction);
  const b = span(node.second, direction);
  return node.direction === direction ? a + b : Math.max(a, b);
}

export function ratios(node, path = []) {
  if (node.type === 'pane') return [];
  const a = span(node.first, node.direction);
  const b = span(node.second, node.direction);
  return [
    { path, ratio: a / (a + b) },
    ...ratios(node.first, [...path, false]),
    ...ratios(node.second, [...path, true]),
  ];
}

export function moves(node) {
  if (node.type === 'pane') return [];
  return [
    { pane_id: leaves(node.second)[0], target_pane_id: leaves(node)[0], split: node.direction },
    ...moves(node.first),
    ...moves(node.second),
  ];
}
