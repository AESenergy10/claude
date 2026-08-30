#!/usr/bin/env python3
"""Inject embed.json into the widget.html template -> dashboard.html (the published page)."""
import os
HERE = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(HERE, "widget.html")).read()
data = open(os.path.join(HERE, "embed.json")).read()
if "__DATA__" not in tpl:
    raise SystemExit("widget.html has no __DATA__ placeholder.")
out = tpl.replace("__DATA__", data)
open(os.path.join(HERE, "dashboard.html"), "w").write(out)
print(f"Wrote dashboard.html ({len(out):,} bytes)")
