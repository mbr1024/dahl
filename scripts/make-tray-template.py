"""程序化生成 macOS 菜单栏 template 图标（纸飞机飞镖，与 App 图标同款）。

macOS template image 规范：单色（黑色）+ alpha 通道，系统按菜单栏深浅色自动反色。
按 Bjango 实践：16×16pt（32×32 @2x）设计、无内边距、最小细节。

与 App 图标（assets/app-icon-1024.png）同款造型：纸飞机飞镖形——
机头(26,16)、上翼尖(7,5)、折叠线(14,16)、下翼尖(7,27)。
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
# 母版 + 应用实际读取的位置（lib.rs include_bytes!("../icons/tray.png")）
OUTS = [ROOT / "assets" / "tray-template.png", ROOT / "src-tauri" / "icons" / "tray.png"]
SIZE = 32
BLACK = (0, 0, 0, 255)

for OUT in OUTS:
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.polygon([(26, 16), (7, 5), (14, 16), (7, 27)], fill=BLACK)
    img.save(OUT)
    print(f"tray template saved: {OUT} ({OUT.stat().st_size} bytes)")
