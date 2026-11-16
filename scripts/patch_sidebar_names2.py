#!/usr/bin/env python3
"""Second pass of sidebar renames, matched by key rather than by label text.

    gatehouse       Monitoring Alpha   -> Fleet Monitoring
    alarms-factory  Alarm Factory      -> Alarm Center
    tokens          Token Engine       -> Tokens
    money           Money Switchboard  -> Transactions
    tenant-tower    Tenant Tower       -> Tenants

Matched on the row's `key` (and the module's `id`), not on the old label. The
gatehouse module is called three different things across these files —
"Monitoring Alpha" in the sidebar, "Gatehouse" in modules.ts `name`, "Gatehouse
Alpha" in the other array — and a text replace for "Gatehouse" would also hit
src/features/gatehouse/, HITLQueueBlade, route paths and permission strings.
Keying on the identifier renames the label and only the label.

Untouched, as before: key, id, path, permission, catalogModuleName.

Alignment is rebuilt per array afterwards, because "Tokens" is shorter than
"Token Engine" and "Fleet Monitoring" is longer than "Monitoring Alpha".

Idempotent.
"""
import io
import os
import re
import sys

ROOT = os.path.join(os.path.expanduser('~'), 'mnt', '3d-cms-stable-v1')

RENAMES = {
    'gatehouse':      'Fleet Monitoring',
    'alarms-factory': 'Alarm Center',
    'tokens':         'Tokens',
    'money':          'Transactions',
    'tenant-tower':   'Tenants',
}

ARRAYS = ('src/components/navigation/Sidebar.tsx', 'src/data/navigation.ts')

ROW = re.compile(
    r'^(?P<head>\s*(?://\s*)?\{\s*key:\s*"(?P<key>[^"]+)".*?label:\s*)'
    r'"(?P<label>[^"]*)",(?P<pad> *)(?P<tail>.*)$')


def rename_rows(path):
    lines = io.open(path, encoding='utf-8', newline='').read().splitlines(keepends=True)
    changed = []
    for i, line in enumerate(lines):
        body = line.rstrip('\r\n')
        m = ROW.match(body)
        if not m:
            continue
        new = RENAMES.get(m.group('key'))
        if not new or m.group('label') == new:
            continue
        ending = line[len(body):]
        lines[i] = (f"{m.group('head')}\"{new}\",{m.group('pad')}"
                    f"{m.group('tail')}{ending}")
        changed.append(f"{m.group('key')}: {m.group('label')} -> {new}")
    if changed:
        io.open(path, 'w', encoding='utf-8', newline='').write(''.join(lines))
    return changed


def realign(path):
    """One column per array block, computed from that block's own widest row."""
    lines = io.open(path, encoding='utf-8', newline='').read().splitlines(keepends=True)
    blocks, start = [], None
    for i, line in enumerate(lines):
        if re.search(r'(SidebarItem|NavRailItem)\[\]\s*=\s*\[', line):
            start = i
        elif start is not None and line.rstrip().startswith('];'):
            blocks.append((start, i))
            start = None
    if start is not None:
        blocks.append((start, len(lines) - 1))

    touched = 0
    for begin, end in blocks:
        idx = [i for i in range(begin, end + 1)
               if ROW.match(lines[i].rstrip('\r\n'))]
        if not idx:
            continue
        width = 1 + max(
            len(ROW.match(lines[i].rstrip('\r\n')).group('head'))
            + len(ROW.match(lines[i].rstrip('\r\n')).group('label')) + 2
            for i in idx)
        for i in idx:
            body = lines[i].rstrip('\r\n')
            ending = lines[i][len(body):]
            m = ROW.match(body)
            head, label, tail = m.group('head'), m.group('label'), m.group('tail')
            pad = ' ' * max(1, width - (len(head) + len(label) + 2))
            lines[i] = f'{head}"{label}",{pad}{tail}{ending}'
        touched += len(idx)
    io.open(path, 'w', encoding='utf-8', newline='').write(''.join(lines))
    return touched, len(blocks)


def rename_modules():
    """Walk modules.ts block by block so `name`/`navLabel` are set on the right
    module and catalogModuleName is never in range."""
    path = os.path.join(ROOT, 'src/auth/modules.ts')
    lines = io.open(path, encoding='utf-8', newline='').read().splitlines(keepends=True)
    current, changed = None, []
    for i, line in enumerate(lines):
        hit = re.search(r'^\s*id:\s*"([^"]+)"', line)
        if hit:
            current = hit.group(1)
            continue
        if current not in RENAMES:
            continue
        field = re.match(r'^(?P<lead>\s*(?:name|navLabel):\s*)"(?P<old>[^"]*)"(?P<rest>.*)$',
                         line.rstrip('\r\n'))
        if not field:
            continue
        new = RENAMES[current]
        if field.group('old') == new:
            continue
        ending = line[len(line.rstrip('\r\n')):]
        lines[i] = f"{field.group('lead')}\"{new}\"{field.group('rest')}{ending}"
        changed.append(f"{current}: {field.group('old')} -> {new}")
    if changed:
        io.open(path, 'w', encoding='utf-8', newline='').write(''.join(lines))
    return changed


def collisions():
    """A label that now matches another one is worth saying out loud."""
    seen = {}
    for rel in ARRAYS + ('src/auth/modules.ts',):
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            continue
        for line in io.open(path, encoding='utf-8'):
            if line.strip().startswith('//'):
                continue
            for m in re.finditer(r'(?:label|navLabel):\s*"([^"]+)"', line):
                seen.setdefault(m.group(1).lower(), set()).add(rel)
    near = []
    labels = sorted(seen)
    for a in labels:
        for b in labels:
            if a < b and (a in b or b in a):
                near.append((a, b))
    return near


def main():
    if not os.path.isdir(ROOT):
        print(f'!! {ROOT} not found')
        return 1

    for rel in ARRAYS:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print(f'  !! missing {rel}')
            continue
        done = rename_rows(path)
        for d in done:
            print(f'  {rel}: {d}')
        if not done:
            print(f'  {rel}: nothing to rename')
        rows, blocks = realign(path)
        print(f'     re-aligned {rows} row(s) across {blocks} array(s)')

    for d in rename_modules():
        print(f'  modules.ts: {d}')

    near = collisions()
    if near:
        print('\n  Labels that now overlap — check these read right:')
        for a, b in near:
            print(f'   !! "{a}"  vs  "{b}"')
    return 0


if __name__ == '__main__':
    sys.exit(main())
