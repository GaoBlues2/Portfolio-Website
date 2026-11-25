# Sinh css/<tên>.css từ mọi css/<tên>.src.css (about, work…): U(n) → calc(npx * var(--u))
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
for src in sorted((root / 'css').glob('*.src.css')):
    out = re.sub(r'U\((-?[\d.]+)\)', lambda m: f'calc({m.group(1)}px * var(--u))', src.read_text())
    out = out.replace('File nguồn: U(n)', f'FILE SINH TỰ ĐỘNG từ {src.name}. U(n)', 1)
    dst = src.with_name(src.name.replace('.src.css', '.css'))
    dst.write_text(out)
    print('ok', dst.name, len(out))
