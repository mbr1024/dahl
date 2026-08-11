---
"dahl": patch
---

fix: 更新安装后重启改用自定义 restart_app（延迟启动器模式）——直接 relaunch 会被 single-instance 让位，导致重启后仍运行旧版本
