# Shadowrocket 配置文件

一份开箱即用的 Shadowrocket 规则配置，导入后添加自己的节点或订阅即可使用。

## 当前重点

- Google AI 相关规则已并入 `Google.list`，`gemini.google.com`、`bard.google.com`、`generativelanguage.googleapis.com` 等请求统一归入 `🔍 谷歌服务`。
- `🔍 谷歌服务` 默认走日本节点，同时提供香港节点作为手动可选分区，便于在不同网络环境下切换。
- 新增 `ApplePush.list`，将 Apple Push Notification service 相关域名优先归入 `🍎 苹果推送`，改善 X、Telegram 等 App 在部分网络环境下无法及时收到推送的问题。

## 默认策略

| 服务 | 默认策略 | 可选策略 |
|------|----------|----------|
| 🔍 谷歌服务 | 🇯🇵 日本节点 | 🇭🇰 香港节点、节点选择、PROXY、DIRECT |
| 🤖 AI 服务 | 🇺🇸 美国节点 | 节点选择、PROXY、DIRECT |
| 🍎 苹果推送 | 🚀 节点选择 | PROXY、DIRECT |
| 🍏 苹果服务 | DIRECT | 节点选择、PROXY |
| 🌍 非中国 | 🇯🇵 日本节点 | 节点选择、PROXY、DIRECT |
| 🐟 漏网之鱼 | 🇯🇵 日本节点 | 节点选择、PROXY、DIRECT |

## 快速开始

1. 复制配置文件的 Raw 链接：
   `https://raw.githubusercontent.com/LingJingMaster/Shadowrocket-Rules/refs/heads/main/Shadowrocket.conf`
2. 打开 Shadowrocket → 配置 → 右上角 `+` → 粘贴链接 → 下载
3. 点击已下载的配置，设为使用中（✔️）
4. 首页添加你自己的节点或订阅
5. 连通性测试，选择可用节点连接

或者扫描二维码

<img width="200" height="200" alt="ctool-2026-02-26-17-13-16" src="https://github.com/user-attachments/assets/22f1b4f7-3265-493c-9e5a-2b662924ed2f" />

## 策略组说明

| 策略组 | 类型 | 说明 |
|--------|------|------|
| 🚀 节点选择 | 手动选择 | 主策略，可选内置代理、地区分组或直连 |
| 🇭🇰 香港节点 | 自动测速 | 按节点名关键词匹配香港节点 |
| 🇹🇼 台湾节点 | 自动测速 | 按节点名关键词匹配台湾节点 |
| 🇯🇵 日本节点 | 自动测速 | 按节点名关键词匹配日本节点 |
| 🇺🇸 美国节点 | 自动测速 | 按节点名关键词匹配美国节点 |
| 🌐 其他节点 | 自动测速 | 匹配不属于以上地区的节点 |

## 分流规则

规则从上到下依次匹配。`🔍 谷歌服务` 优先级高于 `🤖 AI 服务`，因此 Gemini 会走谷歌服务策略组。

| 优先级 | 服务 | 默认策略 |
|--------|------|----------|
| 1 | 🛑 广告拦截 | REJECT |
| 2 | 🔍 谷歌服务（含 Gemini） | 日本节点，可手动切香港节点 |
| 3 | 🤖 AI 服务（ChatGPT、Claude 等） | 美国节点 |
| 4 | 📹 油管视频 | 节点选择 |
| 5 | 🏠 私有网络 / 局域网 | DIRECT |
| 6 | 📲 电报消息 | 节点选择 |
| 7 | 🐱 代码托管（GitHub、GitLab、Atlassian） | 节点选择 |
| 8 | Ⓜ️ 微软服务 | 节点选择 |
| 9 | 🍎 苹果推送 | 节点选择 |
| 10 | 🍏 苹果服务 | DIRECT |
| 11 | 🔒 国内服务 | DIRECT |
| 12 | 🌍 非中国（境外流量） | 日本节点 |
| 13 | GEOIP CN | DIRECT |
| 14 | 🐟 漏网之鱼（兜底） | 日本节点 |

## 规则集来源

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) — 主要规则集
- [iab0x00/ProxyRules](https://github.com/iab0x00/ProxyRules) — AI 服务补充规则

## 其他特性

- DNS：DoH（DNSPod + AliDNS）+ 传统 DNS 双备份
- DNS 劫持：拦截 8.8.8.8 / 8.8.4.4 防止硬编码 DNS 绕过规则
- QUIC 屏蔽：对代理连接屏蔽 UDP/443，强制回退 HTTP/2
- 本地服务保护：`localhost.weixin.qq.com` 固定解析到 `127.0.0.1` 并强制直连，避免 fake-IP 影响微信本地回调
- Apple 推送：`push.apple.com`、`gateway.push.apple.com`、`api.push.apple.com`、`sandbox.push.apple.com` 默认走代理
- Google 防跳转：`google.cn` / `g.cn` 自动 302 到 `google.com`
- MITM：仅解密 `*.google.cn`

## 注意事项

- 地区分组通过节点名称关键词自动匹配，请确保你的节点名称包含地区标识（如 🇭🇰、HK、香港等）
- Google、AI、非中国和漏网之鱼的默认出口可在 App 内手动切换
- 如需 HTTPS 解密功能，请在 Shadowrocket 中生成并安装 CA 证书

## License

MIT
