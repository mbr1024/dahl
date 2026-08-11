---
"dahl": patch
---

fix: 更新后重启改用「先 destroy single-instance 锁再 request_restart」——取代 v0.3.2 的延迟启动器方案（固定 sleep 是时序巧合、Windows 分支不可用）
