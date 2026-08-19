# Shadowrocket 与 Clash Verge 一致性实施计划

> **面向执行代理：** 按任务顺序执行，每个任务完成后运行对应验证；未经规格变更确认，不扩大范围。

**目标：** 基于单一规则源生成可验证的 Clash Verge 和 Shadowrocket 配置，使规则命中接近一致，并默认阻断 DNS、IPv6 与 WebRTC/STUN UDP 泄漏。

**架构：** 规则文件只保存客户端无关的域名/IP规则；两个适配器分别负责 Clash 的 rule-provider/DNS/代理组和 Shadowrocket 的 `[Rule]`/DNS/策略组语法。通过固定路由样例验证两端行为。

**技术栈：** Markdown 规则文件、JavaScript（Clash Verge 全局扩展脚本）、Shadowrocket INI 配置、Python 标准库静态校验。

## 任务清单

### 阶段 1：规则源和契约

#### 任务 1：建立规范化规则目录

文件：创建 `rules/*.list`，保留现有根目录文件不变。

验收：每个规则文件只包含客户端无关规则；自定义规则按目标策略拆分；注释不参与规则；同一规则不在多个服务文件重复定义，除非有优先级说明；`webrtc.list` 覆盖 STUN/TURN 域名和 UDP 端口。

验证：运行 `python3 tests/validate_rules.py`，无未知类型、非法 CIDR 和重复项。

#### 任务 2：建立路由样例和策略契约

文件：创建 `tests/expected-routing.json`。

验收：至少覆盖本地、广告、YouTube 翻译 API、Gemini、ChatGPT、Claude、Telegram、Apple Push、券商、国内、境外和兜底；每条样例包含期望逻辑策略组。

验证：样例中的逻辑组均在策略契约中定义。

### 阶段 2：Clash 适配器

#### 任务 3：修正 Clash 规则提供器格式

文件：创建或修改 `clients/clash-verge.js`。

验收：Loyalsoldier `.txt` 使用 `format: text`；MetaCubeX `.yaml` 使用 `format: yaml`；规则提供器名称与规则引用一一对应。

验证：脚本静态检查通过；生成配置中的每个 `RULE-SET` 均存在提供器。

#### 任务 4：迁移统一规则和策略组

文件：修改 `clients/clash-verge.js`。

验收：规则顺序符合规格；新增 Apple Push、Broker 和自定义规则；无空落地节点；不包含订阅凭据；显式设置 `ipv6: false`。

验证：Clash Verge/Mihomo 配置解析成功，规则提供器可加载。

### 阶段 3：Shadowrocket 适配器

#### 任务 5：生成 Shadowrocket 配置

文件：创建或修改 `clients/Shadowrocket.conf`。

验收：规则顺序与 Clash 契约一致；Apple Push、Broker、自定义规则均有对应引用；DNS 不含明文上游；`ipv6 = false` 且 `prefer-ipv6 = false`；策略组引用均已定义。

验证：Shadowrocket 导入成功，并用路由样例逐条检查命中策略。

### 阶段 4：跨客户端验证和文档

#### 任务 6：实现静态校验器

文件：创建 `tests/validate_rules.py`。

验收：检查规则类型、CIDR、重复规则、空值、策略组引用、provider 格式和敏感 token 模式。

验证：故意注入非法规则时测试必须失败；恢复后测试通过。

#### 任务 7：更新 README 和迁移说明

文件：修改 `README.md`，必要时新增 `docs/client-differences.md`。

验收：文档准确说明 fake-ip 与 Shadowrocket DNS 的差异，不宣称完全等价；提供导入和验证步骤。

验证：文档中的链接、文件名和策略组名称与生成配置一致。

## 检查点

### 检查点 1：规则源完成

- [ ] 规则目录和优先级契约通过审阅
- [ ] 路由样例覆盖核心服务
- [ ] DNS 明文上游和 WebRTC UDP 默认行为已明确
- [ ] 两端 IPv6 出口均显式关闭
- [ ] 静态校验器可运行

### 检查点 2：双端配置完成

- [ ] Clash 配置解析并加载规则集
- [ ] Shadowrocket 配置导入成功
- [ ] 两端路由样例结果一致或已记录能力差异

### 检查点 3：发布前

- [ ] 无敏感凭据
- [ ] 无空代理节点
- [ ] README 与实际配置一致
- [ ] 生成文件和源规则之间可追溯

## 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| 第三方规则格式变化 | 规则无法加载 | 显式记录 text/yaml，静态检查 URL 与格式 |
| 两客户端规则语义不同 | 路由结果不一致 | 使用逻辑策略契约和固定路由样例 |
| Shadowrocket 不支持进程规则 | 应用流量漏分流 | 为进程规则提供域名/IP替代规则 |
| DNS fake-ip 行为不同 | 本地服务或应用异常 | 保留客户端专属例外并做实际连通性测试 |
| 订阅凭据泄露 | 账户被盗用 | 订阅配置移出公共脚本并轮换凭据 |

## 执行约束

- 先完成任务 1-2 并审阅，再开始适配器改动。
- 每次只修改一个适配层，避免同时破坏两个客户端。
- 不删除现有根目录规则，直到新生成配置通过实际导入验证。
