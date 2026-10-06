# herdr-layouts

tmux's preset layouts for [Herdr](https://herdr.dev). Rearranges the panes of the current tab into
even-horizontal, even-vertical, main-horizontal, main-vertical or tiled, and spreads panes evenly.
Panes keep their IDs and running processes; only the arrangement changes.

| Action | tmux equivalent |
|---|---|
| `jorgeraad.layouts.next-layout` | `next-layout` (prefix+Space) |
| `jorgeraad.layouts.previous-layout` | `previous-layout` |
| `jorgeraad.layouts.even-horizontal` | `select-layout even-horizontal` (M-1) |
| `jorgeraad.layouts.even-vertical` | `select-layout even-vertical` (M-2) |
| `jorgeraad.layouts.main-horizontal` | `select-layout main-horizontal` (M-3) |
| `jorgeraad.layouts.main-vertical` | `select-layout main-vertical` (M-4) |
| `jorgeraad.layouts.tiled` | `select-layout tiled` (M-5) |
| `jorgeraad.layouts.balance` | `select-layout -E` (prefix+E) |

The main pane is the first pane in reading order and gets half the tab. Requires Node 22+.

## Install

```sh
herdr plugin install jorgeraad/herdr-layouts
# or pin a commit
herdr plugin install jorgeraad/herdr-layouts --ref <sha>
```

## Keys

In your Herdr `config.toml`:

```toml
[[keys.command]]
key = "prefix+space"
type = "plugin_action"
command = "jorgeraad.layouts.next-layout"

[[keys.command]]
key = "prefix+e"
type = "plugin_action"
command = "jorgeraad.layouts.balance"
```

## Security

No network access and no dependencies; it only talks to Herdr over its local socket.

## Test

```sh
node test.mjs
```
