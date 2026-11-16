#!/usr/bin/env python3
"""Rename the CMS sidebar from codenames to the pages they actually open.

    NOC Bridge     -> System Health
    Protocol Port  -> Device Integrations
    Signal Vault   -> SIM Cards
    Ops War Room   -> Device Management

Labels live in three places, and all three have to agree or the sidebar and the
rail disagree with each other:

    src/components/navigation/Sidebar.tsx   DEFAULT_ITEMS
    src/data/navigation.ts                  DEFAULT_NAV_ITEMS (the NavRail)
    src/auth/modules.ts                     name + navLabel per module

What is deliberately NOT touched:

  * key, path, permission — routes and permission checks. A label is what a
    person reads; these are what the app and the API agree on. Changing
    "Signal Vault" to "SIM Cards" must not move /sim.
  * catalogModuleName — e.g. "Ops War Room & Device Management". That string is
    matched against the backend permission catalogue (permissionCatalog.ts
    keys on it). Renaming it would silently strip permissions from whoever has
    them. It keeps the old wording on purpose, and that is now a place where the
    UI and the catalogue use different names for the same thing — worth a
    follow-up on the backend, not a rename here.
  * the comment in audit.types.ts that reads "Signal Vault — SIM create,
    suspend, reactivate": it documents an audit event code, and the code itself
    is "SIM".

Column alignment in the two arrays is preserved, so the diff is the labels and
nothing else.

Idempotent.
"""
import io
import os
import re
import sys

ROOT = os.path.join(os.path.expanduser('~'), 'mnt', '3d-cms-stable-v1')

RENAMES = (
    ('NOC Bridge',    'System Health'),
    ('Protocol Port', 'Device Integrations'),
    ('Signal Vault',  'SIM Cards'),
    ('Ops War Room',  'Device Management'),
)

ARRAYS = (
    'src/components/navigation/Sidebar.tsx',
    'src/data/navigation.ts',
)


def realign(text, old, new):
    """Swap a quoted label, keeping whatever follows it in the same column.

    These arrays are hand-aligned, and a longer label would push `path:` out of
    line on four rows and nowhere else — a diff that looks like a reformat.
    """
    changed = 0

    def swap(match):
        nonlocal changed
        pad = match.group('pad')
        width = len(old) + len(pad)
        keep = max(1, width - len(new))
        changed += 1
        return f'"{new}"' + ' ' * keep

    pattern = re.compile(r'"' + re.escape(old) + r'"(?P<pad> *)')
    return pattern.sub(swap, text), changed


def patch_arrays():
    for rel in ARRAYS:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print(f'  !! missing {rel}')
            continue
        src = io.open(path, encoding='utf-8', newline='').read()
        total = 0
        for old, new in RENAMES:
            src, n = realign(src, old, new)
            total += n
        if total:
            io.open(path, 'w', encoding='utf-8', newline='').write(src)
            print(f'  {rel}: {total} label(s) renamed')
        else:
            print(f'  {rel}: nothing to change (already renamed)')


def patch_modules():
    """name and navLabel only. catalogModuleName is left exactly as it is."""
    path = os.path.join(ROOT, 'src/auth/modules.ts')
    src = io.open(path, encoding='utf-8', newline='').read()
    total = 0
    for old, new in RENAMES:
        for field in ('name', 'navLabel'):
            needle = f'{field}: "{old}"'
            if needle in src:
                src = src.replace(needle, f'{field}: "{new}"')
                total += 1
    # sim's `name` is "SIM & Connectivity", not the codename, so it needs naming
    # explicitly rather than by substitution.
    if 'name: "SIM & Connectivity"' in src:
        src = src.replace('name: "SIM & Connectivity"', 'name: "SIM Cards"', 1)
        total += 1
    if total:
        io.open(path, 'w', encoding='utf-8', newline='').write(src)
        print(f'  src/auth/modules.ts: {total} field(s) renamed '
              f'(catalogModuleName untouched)')
    else:
        print('  src/auth/modules.ts: nothing to change')


def patch_topbar():
    path = os.path.join(ROOT, 'src/components/navigation/TopBar.tsx')
    if not os.path.exists(path):
        return
    src = io.open(path, encoding='utf-8', newline='').read()
    if 'NOC Bridge — Console' in src:
        src = src.replace('NOC Bridge — Console', 'System Health — Console', 1)
        io.open(path, 'w', encoding='utf-8', newline='').write(src)
        print('  src/components/navigation/TopBar.tsx: default page title')
    else:
        print('  src/components/navigation/TopBar.tsx: nothing to change')


def report_collisions():
    """A rename can create a duplicate, and a sidebar with two identically
    named entries is worse than one with a codename."""
    print('\n  Checks after renaming:')
    for rel in ARRAYS + ('src/auth/modules.ts',):
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            continue
        src = io.open(path, encoding='utf-8').read()
        for _old, new in RENAMES:
            hits = len(re.findall(r'label: *"' + re.escape(new) + r'"', src))
            hits += len(re.findall(r'navLabel: "' + re.escape(new) + r'"', src))
            if hits > 1:
                print(f'   !! {rel}: "{new}" now appears {hits} times')
    print('   (an entry commented out in Sidebar.tsx is not a visible duplicate)')


def main():
    if not os.path.isdir(ROOT):
        print(f'!! {ROOT} not found')
        return 1
    patch_arrays()
    patch_modules()
    patch_topbar()
    report_collisions()
    return 0


if __name__ == '__main__':
    sys.exit(main())
