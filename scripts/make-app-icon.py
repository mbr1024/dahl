"""程序化生成符合 macOS HIG 的 App 图标母版（1024x1024，透明背景）。

设计：与菜单栏托盘同款的纸飞机飞镖形（机头朝右的简单箭头）——
机头(812,512)、上翼尖(242,182)、折叠线(452,512)、下翼尖(242,842)。
白色实心字形在任意尺寸下都清晰可辨。

规范要点（macOS Big Sur+，系统不自动遮罩）：
- 1024x1024 RGBA，背景透明（不能是白底）
- 圆角方形(squircle) 居中，每侧留白 ~4.7%（48px），shape = 928px
- 圆角半径 ≈ shape 宽度的 22.4%
- 前景符号约占 shape 的 60%
"""
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "app-icon-1024.png"
CANVAS = 1024
PAD = 48
SHAPE = CANVAS - PAD * 2  # 928
RADIUS = int(SHAPE * 0.224)  # ~208
WHITE = (255, 255, 255, 255)

# 1. 背景：垂直渐变 + 圆角方形遮罩
img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
top = (62, 89, 200)      # #3E59C8
bottom = (16, 22, 78)    # #10164E
bg = Image.new("RGB", (CANVAS, CANVAS))
for y in range(CANVAS):
    t = y / (CANVAS - 1)
    color = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    ImageDraw.Draw(bg).line([(0, y), (CANVAS, y)], fill=color)
mask = Image.new("L", (CANVAS, CANVAS), 0)
ImageDraw.Draw(mask).rounded_rectangle(
    [PAD, PAD, PAD + SHAPE, PAD + SHAPE], radius=RADIUS, fill=255
)
img.paste(bg, (0, 0), mask)

# 2. 纸飞机飞镖（与托盘同款，x30 放大 + 居中偏移）
layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
d = ImageDraw.Draw(layer)
d.polygon([(812, 512), (242, 182), (452, 512), (242, 842)], fill=WHITE)

# 3. 按内容包围盒自动居中
bbox = layer.getbbox()
w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
off_x = (CANVAS - w) // 2 - bbox[0]
off_y = (CANVAS - h) // 2 - bbox[1]
img.alpha_composite(layer, (off_x, off_y))

img.save(OUT)
print(f"app icon saved: {OUT} ({OUT.stat().st_size} bytes)")
print("symbol bbox:", bbox, "=> 尺寸", w, "x", h)

img.save(OUT)
print(f"app icon saved: {OUT} ({OUT.stat().st_size} bytes)")
print("symbol bbox:", bbox, "=> 尺寸", w, "x", h)

img.save(OUT)
print(f"app icon saved: {OUT} ({OUT.stat().st_size} bytes)")
print("symbol bbox:", bbox, "=> 尺寸", w, "x", h)


img.save(OUT)
print(f"app icon saved: {OUT} ({OUT.stat().st_size} bytes)")
print("symbol bbox:", bbox, "=> 尺寸", w, "x", h)
