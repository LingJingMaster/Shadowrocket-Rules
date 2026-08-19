#!/usr/bin/env python3
"""校验客户端无关规则文件，避免生成不可导入或不安全的配置。"""

from __future__ import annotations

import ipaddress
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RULE_DIR = ROOT / "rules"
ALLOWED_TYPES = {
    "DOMAIN",
    "DOMAIN-SUFFIX",
    "DOMAIN-KEYWORD",
    "IP-CIDR",
    "IP-CIDR6",
    "USER-AGENT",
}
SENSITIVE_PATTERNS = (
    re.compile(r"(?i)(token|password|passwd|secret|api[_-]?key)\s*[=:]\s*[^\s,]+"),
    re.compile(r"https?://[^\s?]+\?[^\s]*(token|password|secret|key)=", re.I),
)


def validate_file(path: Path) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    for number, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if any(pattern.search(line) for pattern in SENSITIVE_PATTERNS):
            errors.append(f"{path}:{number}: 可能包含敏感凭据")

        fields = [field.strip() for field in line.split(",")]
        rule_type = fields[0] if fields else ""
        if rule_type not in ALLOWED_TYPES:
            errors.append(f"{path}:{number}: 不支持的规则类型 {rule_type!r}")
            continue
        if len(fields) < 2 or not fields[1]:
            errors.append(f"{path}:{number}: 缺少规则值")
            continue

        key = ",".join(fields)
        if key in seen:
            errors.append(f"{path}:{number}: 重复规则 {key}")
        seen.add(key)

        if rule_type in {"IP-CIDR", "IP-CIDR6"}:
            try:
                network = ipaddress.ip_network(fields[1], strict=False)
            except ValueError:
                errors.append(f"{path}:{number}: 非法 CIDR {fields[1]!r}")
            else:
                # Shadowrocket 允许用 IP-CIDR 表示 IPv4/IPv6；IP-CIDR6 则必须是 IPv6。
                if rule_type == "IP-CIDR" and network.version != 4:
                    errors.append(f"{path}:{number}: 共享规则中的 IPv6 必须使用 IP-CIDR6")
                if rule_type == "IP-CIDR6" and network.version != 6:
                    errors.append(f"{path}:{number}: IP-CIDR6 必须是 IPv6")
    return errors


def main() -> int:
    if not RULE_DIR.is_dir():
        print(f"缺少规则目录: {RULE_DIR}", file=sys.stderr)
        return 1
    files = sorted(RULE_DIR.glob("*.list"))
    if not files:
        print(f"规则目录为空: {RULE_DIR}", file=sys.stderr)
        return 1
    errors = [error for path in files for error in validate_file(path)]
    if errors:
        print("规则校验失败:")
        print("\n".join(errors))
        return 1
    print(f"规则校验通过: {len(files)} 个文件")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
