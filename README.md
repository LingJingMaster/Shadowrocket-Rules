# Shadowrocket 配置文件

一份开箱即用的 Shadowrocket 规则配置，导入后添加自己的节点或订阅即可使用。

## 当前重点

- 优化 DNS 防泄露
   - 上游 DNS 仅使用 DNSPod / AliDNS 的 DoH
   - 备用 DNS 不再回退系统 DNS
   - 直连域名解析不再强制使用系统 DNS
   - 扩展常见硬编码 DNS 劫持范围
   - 新增 blackmatrix7 `BlockHttpDNS`，拦截 App 内置 HTTPDNS
- 新增 `rules/broker.list`
   - 补充富途 / moomoo / 长桥券商域名
   - 合并老虎证券域名，不再依赖外部券商规则
   - 补充富途交易相关域名：`futuapi.com`、`futuin.com`、`futuhk1.com`、`futuhongkong.com`、`qtlcdn.com`
   - 补充长桥交易相关域名：`lbkrs.com`、`longbridge.app`、`longportapp.com`
   - 合并 Arthur-vx Broker 规则中的精确 API / 交易域名、IP 段、TradeUP 和 Schwab 域名
   - 补充雪盈证券 / Snowball X 官方及 OpenAPI 域名
- AI 规则拆分为 `openai.list`、`anthropic.list`、`google-gemini.list`、`xai.list`、`perplexity.list`
- Clash Verge 使用 `clients/clash-verge.js`；Shadowrocket 使用 `clients/Shadowrocket.conf`
- `🔍 谷歌服务` 默认走日本节点，同时提供香港节点作为手动可选分区，便于在不同网络环境下切换。
- 新增 `rules/apple-push.list`
   - 将 Apple Push Notification service 相关域名优先归入 `🍎 苹果推送`
   - 改善 X、Telegram 等 App 在部分网络环境下无法及时收到推送的问题。
- 本仓库维护 `rules/apple.list`
   - 基于 blackmatrix7 的 Apple 规则
   - 补充 iCloud Photos、CloudKit、Apple CDN 相关域名，优化 iCloud 照片同步。

## 默认策略

| 服务 | 默认策略 | 可选策略 |
|------|----------|----------|
| 🧱 DNS 防泄露 | REJECT | 节点选择、DIRECT |
| 🔍 谷歌服务 | 🇯🇵 日本节点 | 🇭🇰 香港节点、节点选择、PROXY、DIRECT |
| 💸 OpenAI | 🇺🇸 美国节点 | 节点选择、PROXY、DIRECT |
| 💵 Claude | 🇺🇸 美国节点 | 节点选择、PROXY、DIRECT |
| 🧠 XAI | 🇺🇸 美国节点 | 节点选择、PROXY、DIRECT |
| 🔎 Perplexity | 🇺🇸 美国节点 | 节点选择、PROXY、DIRECT |
| 🍎 苹果推送 | 🚀 节点选择 | PROXY、DIRECT |
| 🍏 苹果服务 | DIRECT | 节点选择、PROXY |
| 📈 券商服务 | 🇭🇰 香港节点 | DIRECT、节点选择、PROXY |
| 🌍 非中国 | PROXY | 节点选择、DIRECT、日本节点 |
| 🐟 漏网之鱼 | PROXY | 节点选择、DIRECT、日本节点 |

## 快速开始

### Shadowrocket

1. 复制配置文件的 Raw 链接：
   `https://raw.githubusercontent.com/kerwinruby/Shadowrocket-Rules/refs/heads/main/clients/Shadowrocket.conf`
2. 打开 Shadowrocket → 配置 → 右上角 `+` → 粘贴链接 → 下载
3. 点击已下载的配置，设为使用中（✔️）
4. 首页添加你自己的节点或订阅
5. 连通性测试，选择可用节点连接

多个订阅可直接在 Shadowrocket 首页分别添加。配置文件只维护 DNS、策略组和分流规则，不保存订阅 URL。建议节点名称包含地区标识并避免完全同名，以便地区测速组正确匹配。

### Clash Verge

1. 打开 Clash Verge Rev，确认使用 Mihomo 内核。
2. 进入“订阅”或“配置”，打开“全局扩展脚本”。
3. 将 `clients/clash-verge.js` 的完整内容粘贴到编辑器。
4. 保存并重新激活当前订阅。
5. 确认规则提供器下载成功，并为新增策略组选择出口。

脚本会覆盖 DNS 配置、加载与 Shadowrocket 相同的公共规则集，并保留订阅原有的非终结规则。原规则中的 `MATCH`、`FINAL` 和 `GEOIP,CN` 会由统一终结规则替换。

#### Clash 多订阅

Clash Verge 中多个订阅配置默认互相独立。需要同时使用多个订阅节点时，在本地脚本顶部配置 `additionalProxyProviders`：

```js
const additionalProxyProviders = {
  airport2: {
    type: "http",
    url: "https://example.com/你的私有订阅地址",
    interval: 86400,
    path: "./proxy-providers/airport2.yaml",
    "health-check": {
      enable: true,
      url: "https://www.gstatic.com/generate_204",
      interval: 600
    },
    override: { "additional-prefix": "机场二 | " }
  }
};
```

- 每个 provider 使用唯一名称和不同的 `path`。
- 建议设置不同的 `additional-prefix`，避免节点重名。
- 真实订阅 URL 只能保存在本地，不得提交到仓库。
- 脚本会合并原配置与额外 provider，自动业务策略组会纳入所有 provider 节点。
- 广告和 DNS 拦截组只提供 `REJECT` 与 `DIRECT`。
- 如果只需切换订阅，不需要合并节点，直接在 Clash Verge 中切换当前订阅即可。

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

规则从上到下依次匹配。OpenAI、Claude、XAI、Perplexity 和 Gemini 专属规则优先于通用 Google 规则。

| 优先级 | 服务 | 默认策略 |
|--------|------|----------|
| 1 | 🧱 DNS 防泄露（HTTPDNS） | REJECT |
| 2 | 🛑 广告拦截 | REJECT |
| 3 | 💸 OpenAI / 💵 Claude / 🧠 XAI / 🔎 Perplexity | 美国节点 |
| 4 | 🔍 谷歌服务（含 Gemini） | 日本节点，可手动切香港节点 |
| 5 | 📹 油管视频（含 YouTube 翻译 API） | 节点选择 |
| 6 | 🔒 哔哩哔哩 | DIRECT |
| 7 | 🏠 私有网络 / 局域网 | DIRECT |
| 8 | 📲 电报消息 | 节点选择 |
| 9 | 🐱 代码托管（GitHub、GitLab、Atlassian） | 节点选择 |
| 10 | Ⓜ️ 微软服务 | 节点选择 |
| 11 | 📈 券商服务（富途 / moomoo / 长桥 / 老虎） | 香港节点 |
| 12 | 🍎 苹果推送 | 节点选择 |
| 13 | 🍏 苹果服务 | DIRECT |
| 14 | 🔒 国内服务 | DIRECT |
| 15 | 🌍 非中国（境外流量） | PROXY |
| 16 | GEOIP CN | DIRECT |
| 17 | 🐟 漏网之鱼（兜底） | PROXY |

## 规则集来源

- [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) — 主要规则集
- [iab0x00/ProxyRules](https://github.com/iab0x00/ProxyRules) — AI 服务补充规则
- `rules/apple.list` 基于 blackmatrix7 Apple 规则，并补充 iCloud Photos / Apple CDN 直连域名
- `rules/broker.list` 补充富途 / moomoo / 长桥 / 老虎 / 雪盈 / TradeUP / Schwab 证券域名及交易 IP 段

## 其他特性

- DNS：主用 AliDNS + 腾讯 DoH，备用 Cloudflare + Google DoH，均不回退系统 DNS
- DNS 劫持：拦截常见硬编码 53 端口 DNS，防止应用绕过规则
- HTTPDNS 拦截：引用 blackmatrix7 `BlockHttpDNS`，阻止 App 通过内置 HTTPDNS 绕过系统解析
- QUIC 屏蔽：对代理连接屏蔽 UDP/443，强制回退 HTTP/2
- 本地服务保护：`localhost.weixin.qq.com` 固定解析到 `127.0.0.1` 并强制直连，避免 fake-IP 影响微信本地回调
- 腾讯云 IM：`shortconn.im.qcloud.com` 前置归入国内服务，避免被券商分流规则误挂到香港节点
- TUN 直连优化：iCloud Photos / CloudKit / Apple CDN 域名使用系统 DNS 并跳过代理，保留 Apple Push 走代理
- DNS 上游：仅使用域名形式的 DoH，不配置明文 DNS，避免 DNS 查询泄漏
- 局域网解析保护：`*.in-addr.arpa`、`*.ip6.arpa`、`*.local` 前置直连并交给系统解析，补充常见 DNS-SD 反查模式，避免 Bonjour / PTR 反查打到公共 DoH
- TUN 边界：保留 `198.18.0.0/15` 给 fake-IP / TUN 内部使用，不加入排除路由，私网桥接网段仍通过 `10.0.0.0/8`、`192.168.0.0/16` 等排除
- Apple 推送：默认走代理
   - `push.apple.com`
   - `gateway.push.apple.com`
   - `api.push.apple.com`
   - `sandbox.push.apple.com` 
- Google 防跳转：`google.cn` / `g.cn` 自动 302 到 `google.com`
- MITM：仅解密 `*.google.cn`
- IPv6：Shadowrocket 显式关闭 IPv6 出口和 IPv6 优先解析
- WebRTC：默认拒绝常见 STUN/TURN 域名及 UDP 3478、5349、19302-19309 端口，不阻断相同端口的 TCP 流量

## 注意事项

- 地区分组通过节点名称关键词自动匹配，请确保你的节点名称包含地区标识（如 🇭🇰、HK、香港等）
- WebRTC 通话默认会被阻断；需要通话时必须在客户端显式放行对应 UDP 流量
- Google、AI、非中国和漏网之鱼的默认出口可在 App 内手动切换
- 如需 HTTPS 解密功能，请在 Shadowrocket 中生成并安装 CA 证书

## 验证

连接代理后检查：

1. DNS 泄漏测试不应显示本地运营商 DNS。
2. IPv6 测试不应显示可用的公网 IPv6 出口。
3. WebRTC 泄漏测试不应显示本地或公网真实地址。
4. ChatGPT、Claude、Gemini、Grok、Perplexity 和券商域名应命中对应策略组。

WebRTC/STUN 常用 UDP 端口默认被拒绝，视频会议和点对点功能可能不可用。若必须使用，应只对明确的服务域名和端口添加最小范围例外。

本地静态校验：

```bash
node --check clients/clash-verge.js
python3 tests/validate_rules.py
python3 tests/validate_clients.py
```

静态校验不能替代实际客户端导入和泄漏测试。

## 常见问题

- 规则提供器下载失败：检查 GitHub Raw 连通性、系统时间和 TLS 证书。
- Clash 找不到策略组：重新激活订阅，并检查是否有其他扩展脚本覆盖 `proxy-groups`。
- 局域网域名无法访问：将特殊内部域名加入 `rules/custom-direct.list`，并同步加入 Clash 的 `fake-ip-filter`。
- 视频会议无法连接：这是 WebRTC UDP 默认拒绝的预期行为，按最小范围添加例外。

## License

MIT
