#!/usr/bin/env python3
"""Repair the spacing my own rename broke, line by line.

My realign() matched the label's closing quote and the spaces after it — but in
these arrays the comma sits between the two:

    label: "NOC Bridge",              path: ...
                       ^ comma first, THEN the padding

so the pattern saw zero padding, inserted one space to compensate, and produced

    label: "System Health" ,              path: ...

Valid TypeScript, ugly diff, and exactly the kind of thing that gets waved
through in review. This puts the comma back against the quote and re-pads so
`path:` sits in the column its neighbours use — computed per line from the
original text, so unchanged rows are not reformatted and the diff stays on the
rows that were actually renamed.

Idempotent.
"""
import io
import os
import re
import sys

ROOT = os.path.join(os.path.expanduser('~'), 'mnt', '3d-cms-stable-v1')
FILES = ('src/components/navigation/Sidebar.tsx', 'src/data/navigation.ts')

# { key: "x", glyph: "y", label: "Label" ,   path: "/x" },
LINE = re.compile(
    r'^(?P<head>\s*(?://\s*)?\{.*?label:\s*)"(?P<label>[^"]*)"(?P<gap>\s*),(?P<pad>\s*)(?P<tail>path:.*)$')


def fix(path):
    lines = io.open(path, encoding='utf-8', newline='').read().splitlines(keepends=True)

    # The column `path:` starts at on rows that were never touched — those are
    # the ones with no stray space before the comma.
    columns = []
    for line in lines:
        m = LINE.match(line.rstrip('\r\n'))
        if m and not m.group('gap'):
            columns.append(len(m.group('head')) + len(m.group('label')) + 2
                           + len(m.group('pad')))
    target = max(set(columns), key=columns.count) if columns else None

    out, fixed = [], 0
    for line in lines:
        ending = line[len(line.rstrip('\r\n')):]
        body = line.rstrip('\r\n')
        m = LINE.match(body)
        if not m or not m.group('gap'):
            out.append(line)
            continue
        head, label, tail = m.group('head'), m.group('label'), m.group('tail')
        start = len(head) + len(label) + 2          # past "label",
        pad = ' ' * max(1, (target or start + 1) - start)
        out.append(f'{head}"{label}",{pad}{tail}{ending}')
        fixed += 1

    if fixed:
        io.open(path, 'w', encoding='utf-8', newline='').write(''.join(out))
    return fixed, target


def main():
    for rel in FILES:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print(f'  !! missing {rel}')
            continue
        fixed, target = fix(path)
        if fixed:
            print(f'  {rel}: {fixed} line(s) re-aligned (path: at column {target})')
        else:
            print(f'  {rel}: already tidy')
    return 0


if __name__ == '__main__':
    sys.exit(main())
