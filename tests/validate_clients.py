#!/usr/bin/env python3
"""校验两端配置的关键安全约束和本地引用。"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SHADOWROCKET = ROOT / "clients" / "Shadowrocket.conf"
CLASH = ROOT / "clients" / "clash-verge.js"
ROUTING_CASES = ROOT / "tests" / "expected-routing.json"
RAW_PREFIX = "https://raw.githubusercontent.com/kerwinruby/Shadowrocket-Rules/refs/heads/main/"
SENSITIVE = re.compile(r"(?i)(token|password|passwd|secret|api[_-]?key)\s*[=:]\s*[^\s,]+")


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def validate_shadowrocket(errors: list[str]) -> None:
    text = SHADOWROCKET.read_text(encoding="utf-8")
    lines = text.splitlines()
    if "ipv6 = false" not in text or "prefer-ipv6 = false" not in text:
        fail(errors, "Shadowrocket 未显式关闭 IPv6")

    for key in ("dns-server =", "fallback-dns-server ="):
        line = next((item for item in lines if item.startswith(key)), "")
        values = [value.strip() for value in line.split("=", 1)[-1].split(",")]
        if not values or any(urlparse(value).scheme != "https" for value in values):
            fail(errors, f"Shadowrocket {key.rstrip()} 必须全部使用 HTTPS DoH")

    if "DOMAIN-KEYWORD,stun" in text or "DOMAIN-KEYWORD,turn" in text:
        fail(errors, "Shadowrocket 禁止使用过宽的 STUN/TURN 关键词规则")
    for port in (3478, 5349, *range(19302, 19310)):
        rule = f"AND,((PROTOCOL,UDP),(DEST-PORT,{port})),REJECT"
        if rule not in text:
            fail(errors, f"Shadowrocket 缺少 WebRTC UDP 拒绝规则: {port}")

    for line in lines:
        if not line.startswith("RULE-SET,") or RAW_PREFIX not in line:
            continue
        url = line.split(",", 2)[1]
        relative = url.removeprefix(RAW_PREFIX)
        if relative.startswith("rules/") and not (ROOT / relative).is_file():
            fail(errors, f"Shadowrocket 引用了不存在的本地规则: {relative}")

    expected_url = RAW_PREFIX + "clients/Shadowrocket.conf"
    if f"update-url = {expected_url}" not in text:
        fail(errors, "Shadowrocket update-url 与发布路径不一致")


def validate_clash(errors: list[str]) -> None:
    text = CLASH.read_text(encoding="utf-8")
    if "config.ipv6 = false" not in text or "ipv6: false" not in text:
        fail(errors, "Clash 未同时关闭全局和 DNS IPv6")
    if '"enhanced-mode": "fake-ip"' not in text:
        fail(errors, "Clash 未启用 fake-ip")
    if '...(config["proxy-providers"] || {})' not in text or '...additionalProxyProviders' not in text:
        fail(errors, "Clash 未保留并合并多个代理订阅")
    if '"include-all": !reject' not in text:
        fail(errors, "Clash 自动策略组未纳入所有订阅节点")
    for port in ("3478", "5349", "19302-19309"):
        if f"(DST-PORT,{port})" not in text:
            fail(errors, f"Clash 缺少 WebRTC UDP 拒绝规则: {port}")
    if SENSITIVE.search(text):
        fail(errors, "Clash 脚本可能包含敏感凭据")


def main() -> int:
    errors: list[str] = []
    validate_shadowrocket(errors)
    validate_clash(errors)
    cases = json.loads(ROUTING_CASES.read_text(encoding="utf-8"))
    if len(cases) < 20:
        fail(errors, "路由验收样例少于 20 条")
    if errors:
        print("客户端配置校验失败:")
        print("\n".join(errors))
        return 1
    print(f"客户端配置校验通过: {len(cases)} 条路由样例")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
