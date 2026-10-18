#!/usr/bin/env python3
"""Turn a project's docs/OPEN-QUESTIONS.md into uncertain.html ("What we are not sure about").
Usage: python3 scripts/build_uncertain.py . "<site title>"
Small Markdown subset: # headings, - lists (nested by 2 spaces), **bold**, `code`, [text](url). Standard library only.
"""
import html
import os
import re
import sys


def inline(t):
    t = html.escape(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"`(.+?)`", r"<code>\1</code>", t)
    t = re.sub(r"\[(.+?)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', t)
    return t


def md(text):
    out, depth = [], 0
    for line in text.splitlines():
        m = re.match(r"^( *)- (.*)$", line)
        if m:
            d = len(m.group(1)) // 2 + 1
            while depth < d:
                out.append("<ul>"); depth += 1
            while depth > d:
                out.append("</ul>"); depth -= 1
            out.append("<li>%s</li>" % inline(m.group(2)))
            continue
        while depth:
            out.append("</ul>"); depth -= 1
        h = re.match(r"^(#{1,4}) (.*)$", line)
        if h:
            n = min(len(h.group(1)) + 1, 4)
            out.append("<h%d>%s</h%d>" % (n, inline(h.group(2)), n))
        elif line.strip():
            out.append("<p>%s</p>" % inline(line))
    while depth:
        out.append("</ul>"); depth -= 1
    return "\n".join(out)


def main():
    folder, title = sys.argv[1], sys.argv[2]
    body = md(open(os.path.join(folder, "docs", "OPEN-QUESTIONS.md"), encoding="utf-8").read())
    page = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>What we are not sure about · %s</title>
<link rel="stylesheet" href="styles.css">
<style>.doc{max-width:760px;margin:0 auto;padding:24px 16px 48px}.doc h2{font:700 1.6rem/1.2 Fraunces,Georgia,serif;margin:28px 0 8px}.doc h3{font:700 1.2rem/1.3 Fraunces,Georgia,serif;margin:22px 0 6px}.doc li{margin:4px 0}.doc a{color:inherit}</style>
</head>
<body>
<main class="doc">
<p><a href="index.html">← Back to the map</a></p>
<h1>What we are not sure about</h1>
<p>This site is built from careful research, but not every fact is certain. Below is everything we marked as uncertain. If you know more, or can check an archive, please tell us.</p>
%s
</main>
</body>
</html>
""" % (html.escape(title), body)
    open(os.path.join(folder, "uncertain.html"), "w", encoding="utf-8").write(page)
    print("wrote", os.path.join(folder, "uncertain.html"))


if __name__ == "__main__":
    main()
