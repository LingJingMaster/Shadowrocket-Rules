# Shadowrocket 配置文件

一份开箱即用的 Shadowrocket 规则配置，导入后添加自己的节点或订阅即可使用。

## 快速开始

1. 复制配置文件的 Raw 链接：https://raw.githubusercontent.com/LingJingMaster/Shadowrocket-Rules/refs/heads/main/Shadowrocket.conf
2. 打开 Shadowrocket → 配置 → 右上角 `+` → 粘贴链接 → 下载
3. 点击已下载的配置，设为使用中（✔️）
4. 首页添加你自己的节点或订阅
5. 连通性测试，选择可用节点连接

## 策略组说明

| 策略组 | 类型 | 说明 |
|--------|------|------|
| 🚀 节点选择 | 手动选择 | 主策略，可选地区分组或直连 |
| ⚡ 自动选择 | 手动选择 | 预留，可自行改为 url-test |
| 🇭🇰 香港节点 | 自动测速 | 按节点名关键词匹配香港节点 |
| 🇹🇼 台湾节点 | 自动测速 | 按节点名关键词匹配台湾节点 |
| 🇯🇵 日本节点 | 自动测速 | 按节点名关键词匹配日本节点 |
| 🇺🇸 美国节点 | 自动测速 | 按节点名关键词匹配美国节点 |
| 🌐 其他节点 | 自动测速 | 匹配不属于以上地区的节点 |

## 分流规则

规则从上到下依次匹配，**谷歌服务优先级高于 AI 服务**（Gemini 走谷歌而非 AI 组）。

| 优先级 | 服务 | 默认策略 |
|--------|------|----------|
| 1 | 🛑 广告拦截 | REJECT |
| 2 | 🔍 谷歌服务（含 Gemini） | 日本节点 |
| 3 | 🤖 AI 服务（ChatGPT、Claude 等） | 美国节点 |
| 4 | 📹 油管视频 | 节点选择 |
| 5 | 🏠 私有网络 / 局域网 | DIRECT |
| 6 | 📲 电报消息 | 节点选择 |
| 7 | 🐱 代码托管（GitHub、GitLab、Atlassian） | 节点选择 |
| 8 | Ⓜ️ 微软服务 | 节点选择 |
| 9 | 🍏 苹果服务 | 节点选择 |
| 10 | 🔒 国内服务 | DIRECT |
| 11 | 🌍 非中国（境外流量） | 节点选择 |
| 12 | GEOIP CN | DIRECT |
| 13 | 🐟 漏网之鱼（兜底） | 节点选择 |

## 规则集来源

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) — 主要规则集
- [iab0x00/ProxyRules](https://github.com/iab0x00/ProxyRules) — AI 服务补充规则

## 其他特性

- DNS：DoH（DNSPod + AliDNS）+ 传统 DNS 双备份
- DNS 劫持：拦截 8.8.8.8 / 8.8.4.4 防止硬编码 DNS 绕过规则
- QUIC 屏蔽：对代理连接屏蔽 UDP/443，强制回退 HTTP/2
- Google 防跳转：`google.cn` / `g.cn` 自动 302 到 `google.com`
- MITM：仅解密 `*.google.cn`

## 注意事项

- 地区分组通过节点名称关键词自动匹配，请确保你的节点名称包含地区标识（如 🇭🇰、HK、香港等）
- AI 服务默认走美国节点，谷歌服务默认走日本节点，可在 App 内手动切换
- 如需 HTTPS 解密功能，请在 Shadowrocket 中生成并安装 CA 证书

## License

MIT
