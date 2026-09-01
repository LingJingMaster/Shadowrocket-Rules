# Shadowrocket 配置文件

一份开箱即用的 Shadowrocket 规则配置，导入后添加自己的节点或订阅即可使用。

## 默认策略

| 服务 | 默认策略 | 可选策略 |
|------|----------|----------|
| 🧱 DNS 防泄露 | REJECT | 节点选择、DIRECT |
| 📧 邮件服务 | PROXY | DIRECT、节点选择、日本节点、香港节点 |
| 🔍 谷歌服务 | 🇯🇵 日本节点 | 🇭🇰 香港节点、节点选择、PROXY、DIRECT |
| 🤖 AI 服务 | 🇺🇸 美国节点 | 节点选择、PROXY、DIRECT |
| 🍎 苹果推送 | 🚀 节点选择 | PROXY、DIRECT |
| 🍏 苹果服务 | DIRECT | 节点选择、PROXY |
| 🏦 汇丰香港 | 🇭🇰 香港节点 | DIRECT、节点选择、PROXY |
| 🏦 香港银行 | DIRECT | 香港节点、节点选择、PROXY |
| 📈 券商服务 | 🇭🇰 香港节点 | DIRECT、节点选择、PROXY |
| 🌍 非中国 | PROXY | 节点选择、DIRECT、日本节点 |
| 🐟 漏网之鱼 | PROXY | 节点选择、DIRECT、日本节点 |

## 快速开始

1. 复制配置文件的 Raw 链接：
   `https://raw.githubusercontent.com/LingJingMaster/Shadowrocket-Rules/refs/heads/main/Shadowrocket.conf`
2. 打开 Shadowrocket → 配置 → 右上角 `+` → 粘贴链接 → 下载
3. 点击已下载的配置，设为使用中（✔️）
4. 首页添加你自己的节点或订阅
5. 连通性测试，选择可用节点连接

或者扫描二维码

<img width="200" height="200" alt="ctool-2026-02-26-17-13-16" src="https://github.com/user-attachments/assets/22f1b4f7-3265-493c-9e5a-2b662924ed2f" />

## 分流规则

| 优先级 | 服务 | 默认策略 |
|--------|------|----------|
| 1 | 🧱 DNS 防泄露（HTTPDNS） | REJECT |
| 2 | 📧 邮件服务（IMAP / POP3 / SMTP） | PROXY，可切换 DIRECT 或地区节点 |
| 3 | 🔍 谷歌服务（含 Gemini） | 日本节点，可手动切香港节点 |
| 4 | 🤖 AI 服务（ChatGPT、Claude 等） | 美国节点 |
| 5 | 📹 油管视频（含 YouTube 翻译 API） | 节点选择 |
| 6 | 🔒 哔哩哔哩 | DIRECT |
| 7 | 🏠 私有网络 / 局域网 | DIRECT |
| 8 | 📲 电报消息 | 节点选择 |
| 9 | 🐱 代码托管（GitHub、GitLab、Atlassian） | 节点选择 |
| 10 | Ⓜ️ 微软服务 | 节点选择 |
| 11 | 🏦 汇丰香港（含 Reward+） | 香港节点 |
| 12 | 🏦 其他香港银行 | DIRECT |
| 13 | 📈 券商服务（富途 / moomoo / 长桥 / 老虎 / 雪盈 / 盈透） | 香港节点 |
| 14 | 🍎 苹果推送 | 节点选择 |
| 15 | 🍏 苹果服务 | DIRECT |
| 16 | 🔒 国内服务 | DIRECT |
| 17 | 🌍 非中国（境外流量） | PROXY |
| 18 | GEOIP CN | DIRECT |
| 19 | 🐟 漏网之鱼（兜底） | PROXY |

## 规则集来源

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) — 主要规则集
- [iab0x00/ProxyRules](https://github.com/iab0x00/ProxyRules) — AI 服务补充规则
- `Mail.list` 收录 Apple、Gmail、Outlook、Yahoo、Yandex 的邮件协议端点
- `Apple.list` 基于 blackmatrix7 Apple 规则，并配套加载 `Apple_Domain.list`，补充 iCloud Photos / Apple CDN 直连域名
- `HK_Broker.list` 补充富途 / moomoo / 长桥 / 老虎 / 雪盈 / 盈透 / TradeUP / Schwab 证券域名及交易 IP 段
- `HSBC_HK.list` 与 `HK_Banks_Direct.list` 收录香港银行网站及 App 服务域名

## 当前重点

- 优化 DNS 防泄露
   - 代理域名默认通过代理访问 Cloudflare DoH，备用使用 Google DoH
   - 代理 DNS 不回退系统 DNS，避免代理域名查询从本地网络泄露
   - 直连域名使用系统 DNS，改善国内服务和 CDN 调度
   - 扩展常见硬编码 DNS 劫持范围
   - 新增 blackmatrix7 `BlockHttpDNS`，拦截 App 内置 HTTPDNS
- 新增 `Mail.list`
   - 精确收录常见 IMAP、POP3 与 SMTP 服务端点
   - 默认使用 PROXY，可手动切换 DIRECT 或地区节点
- 新增 `HK_Broker.list`
   - 补充富途 / moomoo / 长桥券商域名
   - 合并老虎证券域名，不再依赖外部券商规则
   - 补充富途交易相关域名：`futuapi.com`、`futuin.com`、`futuhk1.com`、`futuhongkong.com`、`qtlcdn.com`
   - 补充长桥交易相关域名：`lbkrs.com`、`longbridge.app`、`longportapp.com`
   - 合并 Arthur-vx Broker 规则中的精确 API / 交易域名、IP 段、TradeUP 和 Schwab 域名
   - 补充雪盈证券 / Snowball X 官方及 OpenAPI 域名
   - 补充盈透证券 / Interactive Brokers 官方域名
- 新增香港银行分流
   - 汇丰香港及 Reward+ 默认使用香港节点
   - 其他香港银行默认直连，减少代理 IP 变化带来的风控风险
   - 美国运通因不同地区共用主域名，不纳入自动分流
- Google AI 相关规则已并入 `Google.list`
- `🔍 谷歌服务` 默认走日本节点，同时提供香港节点作为手动可选分区，便于在不同网络环境下切换。
- 新增 `ApplePush.list`
   - 将 Apple Push Notification service 相关域名优先归入 `🍎 苹果推送`
   - 改善 X、Telegram 等 App 在部分网络环境下无法及时收到推送的问题。
- 本仓库维护 `Apple.list`
   - 基于 blackmatrix7 的 Apple 规则
   - 配套加载 `Apple_Domain.list`，补齐完整 Apple 域名集
   - 补充 iCloud Photos、CloudKit、Apple CDN 相关域名，优化 iCloud 照片同步。

## 其他特性

- DNS：代理域名使用经代理转发的 Cloudflare / Google DoH，直连域名使用系统 DNS
- DNS 劫持：拦截常见硬编码 53 端口 DNS，防止应用绕过规则
- HTTPDNS 拦截：引用 blackmatrix7 `BlockHttpDNS`，阻止 App 通过内置 HTTPDNS 绕过系统解析
- 邮件分流：常见邮件协议端点默认使用 PROXY，可按网络情况切换直连或地区节点
- QUIC 屏蔽：对代理连接屏蔽 UDP/443，强制回退 HTTP/2
- 本地服务保护：`localhost.weixin.qq.com` 固定解析到 `127.0.0.1` 并强制直连，避免 fake-IP 影响微信本地回调
- TUN 直连优化：iCloud Photos / CloudKit / Apple CDN 域名使用系统 DNS 并跳过代理，保留 Apple Push 走代理
- Apple 分流一致性：Apple Push 域名与 TCP 5223 优先走苹果推送；`Apple.list` 与 `Apple_Domain.list` 共同覆盖其余 Apple 服务，避免因解析 IP 不同而在直连与代理间漂移
- 豆包服务：`doubao.com` 明确直连，避免语音及输入法接口因解析 IP 不同而改变出口
- DNS 上游：Cloudflare DoH 为主、Google DoH 为备用，均通过代理连接；代理解析不回退系统 DNS
- 局域网解析保护：`*.in-addr.arpa`、`*.ip6.arpa`、`*.local` 前置直连并交给系统解析，补充常见 DNS-SD 反查模式，避免 Bonjour / PTR 反查打到公共 DoH
- TUN 边界：保留 `198.18.0.0/15` 给 fake-IP / TUN 内部使用，不加入排除路由，私网桥接网段仍通过 `10.0.0.0/8`、`192.168.0.0/16` 等排除
- Apple 推送：默认走代理
   - `push.apple.com`
   - `gateway.push.apple.com`
   - `api.push.apple.com`
   - `sandbox.push.apple.com` 
- Google 防跳转：`google.cn` / `g.cn` 自动 302 到 `google.com`
- MITM：仅解密 `*.google.cn`

## 注意事项

- 地区分组通过节点名称关键词自动匹配，请确保你的节点名称包含地区标识（如 🇭🇰、HK、香港等）
- 银行服务对出口 IP 稳定性较敏感；使用香港代理时，建议尽量保持同一节点
- Google、AI、非中国和漏网之鱼的默认出口可在 App 内手动切换
- 如需 HTTPS 解密功能，请在 Shadowrocket 中生成并安装 CA 证书

## License

MIT
