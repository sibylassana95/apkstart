# -*- coding: utf-8 -*-
"""把 docs/USER-MANUAL.md 转成单文件、可打印的 HTML（无外部依赖）。
只用标准库，便于离线重建：
  python docs/build-manual-html.py            # 中文（默认）
  python docs/build-manual-html.py --lang fr  # 法语

标题行末尾可写显式锚点 `{#identifiant}`，会被当成 HTML id 并从显示文本/目录里去掉；
没有写时仍按原逻辑 slug() 生成。
"""
import argparse
import html
import os
import re
import sys

# Windows 控制台默认 cp1252，中文 print 会直接抛 UnicodeEncodeError；强制 UTF-8。
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except (AttributeError, ValueError):
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


# 界面文案（只做 HTML 外壳本地化，CSS 与脚本两语共用）
CHROME = {
    'zh': {
        'lang': 'zh-CN',
        'title': 'ApkStart 产品使用手册与问题解决方案',
        'toc': '目录',
        'search': '筛选目录（Ctrl+F 全文搜索）',
        'print': '打印 / 存为 PDF',
    },
    'fr': {
        'lang': 'fr',
        'title': "ApkStart — Manuel d'utilisateur et solutions aux problèmes",
        'toc': 'Sommaire',
        'search': 'Filtrer le sommaire (Ctrl+F pour la recherche plein texte)',
        'print': 'Imprimer / Enregistrer en PDF',
    },
}


def paths_for(lang):
    """返回 (源文件, docs 输出, src/ui 输出)。"""
    if lang == 'fr':
        return (
            os.path.join(HERE, 'USER-MANUAL.fr.md'),
            os.path.join(HERE, 'ApkStart-Manuel-utilisateur-FR.html'),
            os.path.join(ROOT, 'src', 'ui', 'manual.fr.html'),
        )
    return (
        os.path.join(HERE, 'USER-MANUAL.md'),
        os.path.join(HERE, 'ApkStart-用户手册.html'),
        # 0.6.2 起手册内嵌进软件：同一份 HTML 也要落到 src/ui，随包分发。
        # 主进程打开的就是这一份，绝不依赖 docs/ 或外部文件。
        os.path.join(ROOT, 'src', 'ui', 'manual.html'),
    )


def main():
    ap = argparse.ArgumentParser(description='生成单文件 HTML 使用手册')
    ap.add_argument('--lang', choices=['zh', 'fr'], default='zh', help='语言（默认 zh）')
    ap.add_argument('--src', help='覆盖 Markdown 源文件路径')
    ap.add_argument('--out', help='覆盖 docs 输出路径')
    ap.add_argument('--app-out', help='覆盖 src/ui 输出路径')
    args = ap.parse_args()

    src_default, out_default, app_default = paths_for(args.lang)
    SRC = args.src or src_default
    OUT = args.out or out_default
    APP_OUT = args.app_out or app_default
    chrome = CHROME[args.lang]

    with open(SRC, encoding='utf-8') as f:
        lines = f.read().split('\n')

    def inline(s):
        s = html.escape(s, quote=False)
        s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
        s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
        s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', s)
        return s

    def slug(text, used):
        base = re.sub(r'[^\w\u4e00-\u9fa5]+', '-', text).strip('-').lower() or 'sec'
        s = base
        i = 2
        while s in used:
            s = base + '-' + str(i)
            i += 1
        used.add(s)
        return s

    out = []
    toc = []
    used = set()
    i = 0
    n = len(lines)
    in_code = False
    code_buf = []

    while i < n:
        line = lines[i]

        # 代码块
        if line.startswith('```'):
            if not in_code:
                in_code = True
                code_buf = []
            else:
                out.append('<pre><code>' + html.escape('\n'.join(code_buf)) + '</code></pre>')
                in_code = False
            i += 1
            continue
        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # 水平线
        if re.match(r'^---+\s*$', line):
            out.append('<hr/>')
            i += 1
            continue

        # 标题（支持行尾显式锚点 {#id}）
        m = re.match(r'^(#{1,4})\s+(.*)$', line)
        if m:
            lvl = len(m.group(1))
            text = m.group(2).strip()
            explicit = re.search(r'\{#([A-Za-z0-9_-]+)\}\s*$', text)
            if explicit:
                anchor = explicit.group(1)
                text = text[:explicit.start()].strip()
                used.add(anchor)
            else:
                anchor = slug(text, used)
            if lvl in (2, 3):
                toc.append((lvl, anchor, text))
            out.append('<h%d id="%s">%s</h%d>' % (lvl, anchor, inline(text), lvl))
            i += 1
            continue

        # 表格
        if line.strip().startswith('|') and i + 1 < n and re.match(r'^\s*\|?[\s:\-|]+\|?\s*$', lines[i + 1]):
            def cells(row):
                return [c.strip() for c in row.strip().strip('|').split('|')]
            header = cells(line)
            i += 2
            rows = []
            while i < n and lines[i].strip().startswith('|'):
                rows.append(cells(lines[i]))
                i += 1
            t = ['<div class="tw"><table><thead><tr>']
            t += ['<th>' + inline(c) + '</th>' for c in header]
            t.append('</tr></thead><tbody>')
            for r in rows:
                t.append('<tr>')
                t += ['<td>' + inline(c) + '</td>' for c in r]
                t.append('</tr>')
            t.append('</tbody></table></div>')
            out.append(''.join(t))
            continue

        # 引用
        if line.startswith('> '):
            q = []
            while i < n and lines[i].startswith('>'):
                q.append(lines[i].lstrip('>').strip())
                i += 1
            out.append('<blockquote>' + inline(' '.join(q)) + '</blockquote>')
            continue

        # 有序列表
        if re.match(r'^\d+\.\s+', line):
            items = []
            while i < n and re.match(r'^\d+\.\s+', lines[i]):
                items.append(re.sub(r'^\d+\.\s+', '', lines[i]))
                i += 1
            out.append('<ol>' + ''.join('<li>' + inline(x) + '</li>' for x in items) + '</ol>')
            continue

        # 无序列表
        if re.match(r'^\s*[-*]\s+', line):
            items = []
            while i < n and re.match(r'^\s*[-*]\s+', lines[i]):
                items.append(re.sub(r'^\s*[-*]\s+', '', lines[i]))
                i += 1
            out.append('<ul>' + ''.join('<li>' + inline(x) + '</li>' for x in items) + '</ul>')
            continue

        # 空行
        if not line.strip():
            i += 1
            continue

        # 段落（合并连续普通行）
        para = [line.strip()]
        i += 1
        while i < n and lines[i].strip() and not re.match(r'^(#{1,4})\s|^\s*[-*]\s+|^\d+\.\s+|^>|^\s*\||^```|^---+\s*$', lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append('<p>' + inline(' '.join(para)) + '</p>')

    body = '\n'.join(out)

    toc_html = []
    for lvl, anchor, text in toc:
        cls = 'toc-l2' if lvl == 2 else 'toc-l3'
        toc_html.append('<a class="%s" href="#%s">%s</a>' % (cls, anchor, html.escape(text)))
    toc_html = '\n'.join(toc_html)

    doc = '''<!DOCTYPE html>
<html lang="__LANG__">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
:root{--bg:#ffffff;--fg:#1f2328;--mut:#57606a;--line:#d0d7de;--code:#eff1f3;--accent:#0969da;--accent-soft:#ddf4ff;--warn:#9a6700;--warn-bg:#fff8c5;--head:#f6f8fa;--tbl:#f6f8fa}
*{box-sizing:border-box}
body{margin:0;font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:var(--fg);background:var(--bg)}
.wrap{display:flex;max-width:1180px;margin:0 auto}
aside{position:sticky;top:0;height:100vh;overflow:auto;width:280px;flex:0 0 280px;border-right:1px solid var(--line);padding:24px 18px;background:var(--head)}
aside h2{font-size:15px;margin:0 0 14px;letter-spacing:.5px}
aside a{display:block;color:var(--mut);text-decoration:none;padding:3px 8px;border-radius:6px;font-size:13.5px;line-height:1.45}
aside a:hover{background:var(--accent-soft);color:var(--accent)}
#tocSearch{width:100%;margin-bottom:12px;padding:7px 9px;border:1px solid var(--line);border-radius:6px;font:13px/1.4 inherit;background:#fff;color:var(--fg)}
#tocSearch:focus{outline:2px solid var(--accent-soft);border-color:var(--accent)}
.toc-l3{padding-left:22px!important;font-size:12.5px!important;color:#8c959f!important}
main{flex:1;min-width:0;padding:40px 48px 80px}
h1{font-size:30px;margin:0 0 8px;padding-bottom:16px;border-bottom:2px solid var(--line)}
h2{font-size:23px;margin:42px 0 16px;padding-bottom:8px;border-bottom:1px solid var(--line);scroll-margin-top:16px}
h3{font-size:18px;margin:30px 0 12px;scroll-margin-top:16px}
h4{font-size:16px;margin:22px 0 8px}
p{margin:12px 0}
a{color:var(--accent)}
code{background:var(--code);padding:2px 6px;border-radius:6px;font:13.5px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace}
pre{background:var(--code);padding:16px 18px;border-radius:8px;overflow:auto;border:1px solid var(--line)}
pre code{background:none;padding:0}
blockquote{margin:16px 0;padding:10px 16px;border-left:4px solid var(--warn);background:var(--warn-bg);color:#633c01;border-radius:0 8px 8px 0}
blockquote p{margin:0}
ul,ol{margin:12px 0;padding-left:26px}
li{margin:5px 0}
hr{border:0;border-top:1px solid var(--line);margin:28px 0}
.tw{overflow:auto;margin:16px 0}
table{border-collapse:collapse;width:100%;font-size:14.5px}
th,td{border:1px solid var(--line);padding:9px 12px;text-align:left;vertical-align:top}
th{background:var(--tbl);font-weight:600;white-space:nowrap}
tbody tr:nth-child(even){background:#fbfcfd}
.btnbar{position:fixed;right:22px;bottom:22px;display:flex;gap:8px}
.btnbar button{border:1px solid var(--line);background:#fff;color:var(--fg);border-radius:8px;padding:9px 14px;font-size:13px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.btnbar button:hover{border-color:var(--accent);color:var(--accent)}
@media (max-width:880px){aside{display:none}main{padding:24px 20px 60px}h1{font-size:25px}}
@media print{aside,.btnbar{display:none}main{padding:0;max-width:none}h2{page-break-after:avoid}table,pre,blockquote{page-break-inside:avoid}a{color:inherit;text-decoration:none}}
</style>
</head>
<body>
<div class="wrap">
<aside><h2>__TOC_LABEL__</h2>
<input id="tocSearch" type="search" placeholder="__SEARCH__" autocomplete="off" />
<div id="tocList">__TOC__</div>
</aside>
<main>
__BODY__
</main>
</div>
<div class="btnbar"><button onclick="window.print()">__PRINT__</button></div>
<script>
(function () {
  var input = document.getElementById('tocSearch');
  var links = Array.prototype.slice.call(document.querySelectorAll('#tocList a'));
  if (!input) return;
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase();
    links.forEach(function (a) { a.hidden = !!q && a.textContent.toLowerCase().indexOf(q) < 0; });
  });
  // 自动教程按锚点打开时，把命中的目录项滚进视野
  if (location.hash) {
    var hit = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (hit) setTimeout(function () { hit.scrollIntoView({ block: 'start' }); }, 80);
  }
}());
</script>
</body>
</html>
'''

    doc = (doc.replace('__LANG__', chrome['lang'])
              .replace('__TITLE__', html.escape(chrome['title'], quote=False))
              .replace('__TOC_LABEL__', html.escape(chrome['toc']))
              .replace('__SEARCH__', html.escape(chrome['search'], quote=True))
              .replace('__PRINT__', html.escape(chrome['print']))
              .replace('__TOC__', toc_html)
              .replace('__BODY__', body))
    for target in (OUT, APP_OUT):
        with open(target, 'w', encoding='utf-8', newline='\n') as f:
            f.write(doc)
        print('生成:', target)
        print('大小: %d KB' % (os.path.getsize(target) // 1024))


if __name__ == '__main__':
    main()
