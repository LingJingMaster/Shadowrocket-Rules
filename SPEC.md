# Shadowrocket 与 Clash Verge 一致性规格

## 1. 目标

建立一套单一规则来源，为 Shadowrocket 和 Clash Verge 生成客户端适配配置，使两端在域名/IP 规则命中、策略组语义、默认出口和安全约束上保持接近一致。

核心安全目标是：规则命中接近一致、防止 DNS 泄漏、防止 WebRTC/STUN UDP 直连泄漏。DNS 内核实现允许存在客户端差异：Clash Verge 保留 fake-ip 与按域名 DNS 分流；Shadowrocket 使用其支持的加密 DNS 和 Host/直连规则进行近似实现。不得以“配置文本相似”替代实际行为验证。

## 2. 能力地图

| 模块 ID | 责任 | 依赖 |
|---|---|---|
| `rule-source` | 维护规范化的域名、IP、进程和自定义规则 | 无 |
| `policy-contract` | 定义规则优先级、策略组名称、默认出口 | `rule-source` |
| `clash-adapter` | 生成 Clash Verge/Mihomo DNS、规则集、代理组和规则 | `rule-source`、`policy-contract` |
| `shadowrocket-adapter` | 生成 Shadowrocket 配置和本地规则集引用 | `rule-source`、`policy-contract` |
| `verification` | 做静态校验、配置导入校验和跨客户端行为对照 | `clash-adapter`、`shadowrocket-adapter` |

实施顺序：`rule-source` → `policy-contract` → `clash-adapter` 与 `shadowrocket-adapter` → `verification`。

## 3. 功能范围

### 3.1 必须统一的行为

- 自定义规则优先于通用规则。
- 局域网、localhost、反向解析和私有域名直连。
- 广告/HTTPDNS 拦截。
- YouTube、Google/Gemini、OpenAI、Claude、XAI、Perplexity、Telegram、代码托管、Microsoft、Apple、Apple Push、券商、国内和境外流量分流。
- 规则首次匹配即停止，两个客户端使用相同的优先级。
- 默认策略组的逻辑出口一致；节点筛选名称可以保留客户端差异。

### 3.2 允许存在差异的行为

- Clash Verge 使用 fake-ip、`nameserver-policy` 和 `fake-ip-filter`。
- Shadowrocket 使用 `dns-server`、`fallback-dns-server`、Host 和 `DOMAIN-SUFFIX` 规则近似实现。
- Clash 支持 `PROCESS-NAME`，Shadowrocket 不保证支持；进程规则必须有域名/IP替代方案。
- 代理订阅管理由客户端适配层负责，不进入公共规则源。

## 4. 规范目录

```text
rules/
  custom-direct.list
  custom-proxy.list
  custom-google.list
  custom-code.list
  webrtc.list
  openai.list
  anthropic.list
  google-gemini.list
  google.list
  xai.list
  perplexity.list
  broker.list
  apple-push.list
  apple.list
clients/
  clash-verge.js
  Shadowrocket.conf
tests/
  validate_rules.py
  expected-routing.json
tasks/
  plan.md
  todo.md
```

仓库自维护规则位于 `rules/`；广告、局域网、Telegram、代码托管、Microsoft、国内和境外规则由两个客户端引用相同的 blackmatrix7 Shadowrocket 规则集。生成物必须能独立导入客户端。

## 5. 规则优先级契约

1. `custom`
2. `private` / `lan`
3. `reject` / HTTPDNS
4. `webrtc` / STUN UDP
5. `youtube`
6. `openai` / `anthropic` / `xai` / `perplexity`
7. `google-gemini`
8. `google`
9. `telegram`
10. `github` / GitLab / Atlassian
11. `microsoft`
12. `broker`
13. `apple-push`
14. `apple`
15. `cn`
16. `global`
17. `GEOIP,CN`
18. 兜底策略

如果某服务需要覆盖更高优先级规则，必须在对应的 `custom-*.list` 中明确记录并添加测试样例。

## 6. DNS 契约

### Clash Verge

- 全局 `ipv6` 必须为 `false`，禁止 IPv6 出站。
- 开启 fake-ip，范围固定为 `198.18.0.1/16`。
- DNS 不返回或使用 IPv6 地址作为出站目标。
- 国内域名使用国内 DoH。
- 国外域名使用国外 DoH。
- `proxy-server-nameserver` 和 `direct-nameserver` 使用国内 DoH。
- 不使用 IP 形式的 HTTPS DNS 地址，避免证书/SNI 不匹配。

### Shadowrocket

- `ipv6 = false` 且 `prefer-ipv6 = false`，禁止 IPv6 出站。
- 仅使用域名形式的加密 DNS；不得混入明文 DNS。
- 本地域名和反向解析交给系统 Host/直连处理。
- 明确记录其无法实现按域名 DNS 分流的限制。

## 6.1 WebRTC/UDP 防泄漏契约

- 默认拒绝 STUN 常用 UDP 端口（3478、5349、19302-19309）以及规则源中明确的 STUN/TURN 域名。
- Clash 和 Shadowrocket 必须在规则顺序中优先处理 WebRTC 规则，不能让其落入普通兜底策略。
- `block-quic` 仅用于阻断 QUIC，不能被视为完整的 WebRTC 防护。
- 若用户需要 WebRTC 通话，必须显式切换到允许 UDP 的策略；默认安全模式不允许例外。

## 7. 安全约束

- 不提交订阅 token、用户名、密码或真实节点地址。
- 空服务器、空端口或无效代理不得进入生成配置。
- 外部规则集下载失败时必须可诊断，不能静默生成空规则。
- 规则源的外部 URL 必须固定、可审计，并记录格式（text/yaml）。
- 生成配置不得默认允许 WebRTC/STUN UDP 直连。
- 两端均不得产生 IPv6 出站；配置中必须显式关闭 IPv6，而不能依赖默认值。

## 8. 验收标准

- Clash 所有 `.txt` 规则集使用 `format: text`，MetaCubeX YAML 使用 `format: yaml`。
- 两端拥有相同的规则集合和优先级契约，差异仅限客户端能力边界。
- 测试覆盖至少 20 个代表性域名/IP：本地、广告、YouTube、Gemini、ChatGPT、Claude、Telegram、Apple Push、券商、国内和兜底。
- 测试覆盖 DNS 明文端口劫持、DoH 上游、STUN 域名以及 UDP 3478/5349/19302-19309。
- 测试确认 AAAA 查询不会形成 IPv6 代理或直连出口。
- 静态校验无未知规则类型、无非法 CIDR、无空策略组引用、无重复规则。
- Shadowrocket 配置可导入；Clash 配置可解析并成功加载规则集。
- README 说明实际 DNS 能力、默认出口和客户端差异，不宣称无法验证的“完全一致”。

## 9. 不在本阶段范围内

- 自动维护第三方规则内容的业务正确性。
- 为 Shadowrocket 实现 Clash fake-ip 的完全等价行为。
- 自动获取、验证或托管用户代理订阅。
- 修改用户的节点供应商配置。

## 10. 待确认决策

- AI 服务在 Shadowrocket 和 Clash 中均拆成 OpenAI、Claude、Google/Gemini、XAI、Perplexity 五个独立策略组。
- Apple Push 在 Clash 中新增独立策略组。
- `googleapis.cn` 默认进入 Google 服务还是主模式；默认建议进入 Google 服务，保持与 Google 规则语义一致。
