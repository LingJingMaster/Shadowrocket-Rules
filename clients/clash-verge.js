// Clash Verge 全局扩展脚本：共享规则、安全 DNS、IPv6 和 WebRTC 防护。
// 代理订阅、节点和代理组由用户原始配置提供，本脚本不写入凭据。

const repo = "https://raw.githubusercontent.com/kerwinruby/Shadowrocket-Rules/refs/heads/main/rules";
const blackmatrix = "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket";

// 多订阅入口。仅在本地副本中填写，不要把真实订阅 URL 提交到仓库。
// 每个 key 必须唯一；additional-prefix 用于区分不同订阅的同名节点。
const additionalProxyProviders = {
  // airport2: {
  //   type: "http",
  //   url: "在本地填写订阅地址",
  //   interval: 86400,
  //   path: "./proxy-providers/airport2.yaml",
  //   "health-check": {
  //     enable: true,
  //     url: "https://www.gstatic.com/generate_204",
  //     interval: 600
  //   },
  //   override: { "additional-prefix": "机场二 | " }
  // }
};

const dns = {
  enable: true,
  listen: "0.0.0.0:1053",
  ipv6: false,
  "prefer-h3": false,
  "respect-rules": true,
  "use-system-hosts": false,
  "cache-algorithm": "arc",
  "enhanced-mode": "fake-ip",
  "fake-ip-range": "198.18.0.1/16",
  "fake-ip-filter": [
    "+.lan",
    "+.local",
    "+.msftconnecttest.com",
    "+.msftncsi.com",
    "localhost.ptlogin2.qq.com",
    "localhost.sec.qq.com",
    "localhost.work.weixin.qq.com",
    "+.datahunter.cn"
  ],
  "default-nameserver": ["223.5.5.5", "1.2.4.8"],
  nameserver: [
    "https://cloudflare-dns.com/dns-query",
    "https://dns.google/dns-query",
    "https://dns.quad9.net/dns-query"
  ],
  "proxy-server-nameserver": [
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query"
  ],
  "direct-nameserver": [
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query"
  ],
  "direct-nameserver-follow-policy": false,
  "nameserver-policy": {
    "geosite:cn": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ]
  }
};

const textProvider = (name, url = `${repo}/${name}.list`) => ({
  type: "http",
  behavior: "classical",
  format: "text",
  interval: 86400,
  url,
  path: `./ruleset/shadowrocket/${name}.txt`
});

const ruleProviders = {
  customDirect: textProvider("custom-direct"),
  customProxy: textProvider("custom-proxy"),
  customGoogle: textProvider("custom-google"),
  customCode: textProvider("custom-code"),
  webrtc: textProvider("webrtc"),
  openai: textProvider("openai"),
  anthropic: textProvider("anthropic"),
  googleGemini: textProvider("google-gemini"),
  xai: textProvider("xai"),
  perplexity: textProvider("perplexity"),
  google: textProvider("google"),
  apple: textProvider("apple"),
  applePush: textProvider("apple-push"),
  broker: textProvider("broker"),
  blockHttpDns: textProvider("block-http-dns", `${blackmatrix}/BlockHttpDNS/BlockHttpDNS.list`),
  advertising: textProvider("advertising", `${blackmatrix}/Advertising/Advertising.list`),
  youtube: textProvider("youtube", `${blackmatrix}/YouTube/YouTube.list`),
  bilibili: textProvider("bilibili", `${blackmatrix}/BiliBili/BiliBili.list`),
  lan: textProvider("lan", `${blackmatrix}/Lan/Lan.list`),
  telegram: textProvider("telegram", `${blackmatrix}/Telegram/Telegram.list`),
  github: textProvider("github", `${blackmatrix}/GitHub/GitHub.list`),
  gitlab: textProvider("gitlab", `${blackmatrix}/GitLab/GitLab.list`),
  atlassian: textProvider("atlassian", `${blackmatrix}/Atlassian/Atlassian.list`),
  microsoft: textProvider("microsoft", `${blackmatrix}/Microsoft/Microsoft.list`),
  china: textProvider("china", `${blackmatrix}/China/China.list`),
  global: textProvider("global", `${blackmatrix}/Global/Global.list`)
};

function main(config) {
  const originalRules = Array.isArray(config.rules) ? config.rules : [];
  config.ipv6 = false;
  config.dns = dns;
  config["proxy-providers"] = {
    ...(config["proxy-providers"] || {}),
    ...additionalProxyProviders
  };
  config["rule-providers"] = {
    ...(config["rule-providers"] || {}),
    ...ruleProviders
  };

  const existingGroups = new Set(
    (config["proxy-groups"] || []).map((group) => group && group.name).filter(Boolean)
  );
  const availableTargets = new Set([
    ...(config.proxies || []).map((proxy) => proxy && proxy.name).filter(Boolean),
    ...existingGroups,
    "DIRECT",
    "REJECT"
  ]);
  const defaultTargets = [
    "🔰 模式选择",
    "⚙️ 节点选择",
    "🕊️ 落地节点",
    "♻️ 延迟选优",
    "🚑 故障转移",
    "🔗 全局直连",
    "DIRECT"
  ].filter((name) => availableTargets.has(name));
  const requiredGroups = [
    { name: "🔰 模式选择", direct: false },
    { name: "🔗 全局直连", direct: true },
    { name: "🏠 私有网络", direct: true },
    { name: "🧱 DNS 防泄露", direct: false, reject: true },
    { name: "🛑 广告拦截", direct: false, reject: true },
    { name: "📹 油管视频", direct: false },
    { name: "📢 谷歌服务", direct: false },
    { name: "📲 电报消息", direct: false },
    { name: "🐱 代码托管", direct: false },
    { name: "Ⓜ️ 微软服务", direct: false },
    { name: "💸 OpenAI", direct: false },
    { name: "💵 Claude", direct: false },
    { name: "🧠 XAI", direct: false },
    { name: "🔎 Perplexity", direct: false },
    { name: "🍎 苹果推送", direct: false },
    { name: "🍎 苹果服务", direct: true },
    { name: "📈 券商服务", direct: false },
    { name: "🔒 国内服务", direct: true },
    { name: "🌍 非中国", direct: false },
    { name: "🐟 漏网之鱼", direct: false }
  ];
  config["proxy-groups"] = config["proxy-groups"] || [];
  for (const { name, direct, reject = false } of requiredGroups) {
    if (!existingGroups.has(name)) {
      config["proxy-groups"].push({
        name,
        type: "select",
        "include-all": !reject,
        proxies: reject
          ? ["REJECT", "DIRECT"]
          : direct
          ? ["DIRECT", ...defaultTargets.filter((target) => target !== "DIRECT")]
          : defaultTargets.length ? defaultTargets : ["DIRECT"]
      });
    }
  }

  // 规则顺序必须与 clients/Shadowrocket.conf 一致；首次命中后停止。
  const preservedRules = originalRules.filter(
    (rule) => typeof rule === "string"
      && !rule.startsWith("MATCH,")
      && !rule.startsWith("FINAL,")
      && !rule.startsWith("GEOIP,CN,")
  );
  config.rules = [
    "RULE-SET,customDirect,🔗 全局直连",
    "RULE-SET,customProxy,🔰 模式选择",
    "RULE-SET,customGoogle,📢 谷歌服务",
    "RULE-SET,customCode,🐱 代码托管",
    "RULE-SET,lan,🏠 私有网络",
    "RULE-SET,blockHttpDns,🧱 DNS 防泄露",
    "RULE-SET,advertising,🛑 广告拦截",
    "RULE-SET,webrtc,REJECT",
    "AND,((NETWORK,UDP),(DST-PORT,3478)),REJECT",
    "AND,((NETWORK,UDP),(DST-PORT,5349)),REJECT",
    "AND,((NETWORK,UDP),(DST-PORT,19302-19309)),REJECT",
    "DOMAIN,translate.googleapis.com,📹 油管视频",
    "DOMAIN,translate-pa.googleapis.com,📹 油管视频",
    "RULE-SET,openai,💸 OpenAI",
    "RULE-SET,anthropic,💵 Claude",
    "RULE-SET,xai,🧠 XAI",
    "RULE-SET,perplexity,🔎 Perplexity",
    "RULE-SET,googleGemini,📢 谷歌服务",
    "RULE-SET,google,📢 谷歌服务",
    "RULE-SET,youtube,📹 油管视频",
    "RULE-SET,bilibili,🔒 国内服务",
    "RULE-SET,telegram,📲 电报消息",
    "RULE-SET,github,🐱 代码托管",
    "RULE-SET,gitlab,🐱 代码托管",
    "RULE-SET,atlassian,🐱 代码托管",
    "RULE-SET,microsoft,Ⓜ️ 微软服务",
    "RULE-SET,broker,📈 券商服务",
    "RULE-SET,applePush,🍎 苹果推送",
    "RULE-SET,apple,🍎 苹果服务",
    ...preservedRules,
    "RULE-SET,china,🔒 国内服务",
    "RULE-SET,global,🌍 非中国",
    "GEOIP,CN,🔗 全局直连,no-resolve",
    "MATCH,🐟 漏网之鱼"
  ];
  return config;
}
