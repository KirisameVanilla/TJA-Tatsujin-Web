"""生成/更新 alias.json，支持同名不同路径共存的新结构（方案C：稳定ID+挑战值）。

新结构：
{
    "version": 3,
  "items": [
         {"id": "<稳定短ID>", "name": "曲名", "path": "父目录/子目录", "alias": []},
     ...
  ]
}

兼容旧结构（对象形式）读取；输出始终为新结构。
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, asdict
import argparse
from typing import Iterable, List, Dict, Any, Set, Tuple, Optional
import requests
from urllib.parse import quote


@dataclass
class AliasItem:
    id: str  # 稳定唯一ID（不随 path 改变）
    name: str  # 末级目录名
    path: str  # 完整路径
    alias: List[str]

    @staticmethod
    def from_old(name: str, data: Dict[str, Any]):
        return AliasItem(
            id=str(data.get("id") or data.get("path") or name),
            name=str(name),
            path=str(data.get("path", "")),
            alias=(data.get("alias") if isinstance(data.get("alias"), list) else []),  # type: ignore[arg-type]
        )

    @staticmethod
    def from_new(data: Dict[str, Any]):
        return AliasItem(
            id=str(data.get("id") or data.get("path") or data.get("name") or ""),
            name=str(data.get("name") or ""),
            path=str(data.get("path") or ""),
            alias=(data.get("alias") if isinstance(data.get("alias"), list) else []),  # type: ignore[arg-type]
        )


def load_existing(path: str) -> Tuple[List[AliasItem], Optional[int]]:
    """返回 (items, version)  version: None(旧对象) / 2 / 3"""
    if not os.path.exists(path):
        return [], None
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return [], None

    items: List[AliasItem] = []
    if isinstance(data, dict) and "items" in data and isinstance(data["items"], list):
        for it in data["items"]:
            if isinstance(it, dict):
                items.append(AliasItem.from_new(it))
        ver = data.get("version")
        if isinstance(ver, int):
            return items, ver
        return items, 2
    if isinstance(data, list):  # 早期纯数组
        for it in data:
            if isinstance(it, dict):
                items.append(AliasItem.from_new(it))
        return items, 2
    if isinstance(data, dict):  # 旧对象形式
        for name, val in data.items():
            if isinstance(val, dict):
                items.append(AliasItem.from_old(name, val))
        return items, None
    return [], None


def get_directory_structure(base_url: str) -> Set[str]:
    """获取二级目录路径集合 parent/child"""
    headers = {"accept": "application/json"}
    result: Set[str] = set()

    try:
        root_resp = requests.get(f"{base_url}/.", headers=headers)
        root_resp.raise_for_status()
        root_contents = root_resp.json()
    except requests.RequestException as e:
        print(f"获取根目录内容时出错: {e}")
        return result

    for item in root_contents:
        if item.get("type") != "dir":
            continue
        dir_name = item["name"]
        try:
            encoded_dir_name = quote(dir_name)
            sub_url = f"{base_url}/{encoded_dir_name}"
            sub_resp = requests.get(sub_url, headers=headers)
            sub_resp.raise_for_status()
            for sub_item in sub_resp.json():
                if sub_item.get("type") == "dir":
                    result.add(f"{dir_name}/{sub_item['name']}")
        except requests.RequestException as e:
            print(f"获取 {dir_name} 内容时出错: {e}")
            continue
    return result


def _slug(name: str) -> str:
    import re

    s = name.lower().strip()
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"[^a-z0-9\-]", "", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "item"


def _generate_id(base_name: str, used: Set[str]) -> str:
    base = _slug(base_name)
    if base not in used:
        used.add(base)
        return base
    # 冲突：挑战值递增
    i = 2
    while True:
        cand = f"{base}-{i}"
        if cand not in used:
            used.add(cand)
            return cand
        i += 1


def _migrate_ids(existing: List[AliasItem]) -> List[AliasItem]:
    """为旧格式（id 为 path / 含 / / 为空 / 冲突）重新分配稳定ID。"""
    used: Set[str] = set()
    migrated: List[AliasItem] = []
    for it in existing:
        regen = False
        if not it.id:
            regen = True
        elif "/" in it.id:  # 旧版 path 形式
            regen = True
        elif it.id in used:  # 冲突
            regen = True
        if regen:
            new_id = _generate_id(it.name, used)
            migrated.append(
                AliasItem(id=new_id, name=it.name, path=it.path, alias=it.alias)
            )
        else:
            used.add(it.id)
            migrated.append(it)
    return migrated


def ensure_items(
    structure_paths: Iterable[str], existing: List[AliasItem]
) -> List[AliasItem]:
    # 先迁移已有 ID
    existing = _migrate_ids(existing)
    by_path: Dict[str, AliasItem] = {it.path: it for it in existing}
    used_ids: Set[str] = {it.id for it in existing}
    result: List[AliasItem] = []
    for p in sorted(structure_paths):
        name = p.split("/")[-1]
        if p in by_path:
            result.append(by_path[p])
        else:
            new_id = _generate_id(name, used_ids)
            result.append(AliasItem(id=new_id, name=name, path=p, alias=[]))
    return result


def save_items(path: str, items: List[AliasItem]):
    data = {"version": 3, "items": [asdict(it) for it in items]}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def main():
    parser = argparse.ArgumentParser(
        description="Generate / migrate alias.json (version 3 with stable IDs)."
    )
    parser.add_argument(
        "--migrate-only", action="store_true", help="只进行格式迁移，不调用 API。"
    )
    parser.add_argument(
        "--force", action="store_true", help="无论是否有变化都重写文件。"
    )
    args = parser.parse_args()

    existing_items, version = load_existing("alias.json")

    def needs_id_upgrade(items: List[AliasItem], ver: Optional[int]) -> bool:
        if ver is None or (ver is not None and ver < 3):
            return True
        seen: Set[str] = set()
        for it in items:
            if not it.id or "/" in it.id or it.id in seen:
                return True
            seen.add(it.id)
        return False

    if args.migrate_only:
        if needs_id_upgrade(existing_items, version):
            migrated = _migrate_ids(existing_items)
            save_items("alias.json", migrated)
            print(f"Migrated alias.json to version 3, total items: {len(migrated)}")
        else:
            print("Already stable version 3, no action.")
        return

    api_url = os.getenv("API_URL")
    if not api_url:
        print("API_URL 环境变量未设置 (生成最新结构需要 API)。尝试执行 ID 迁移。")
        if needs_id_upgrade(existing_items, version):
            migrated = _migrate_ids(existing_items)
            save_items("alias.json", migrated)
            print(f"Migrated alias.json to version 3, total items: {len(migrated)}")
        return

    structure_paths = get_directory_structure(api_url)
    new_items = ensure_items(structure_paths, existing_items)

    before = {(it.path, tuple(it.alias)) for it in existing_items}
    after = {(it.path, tuple(it.alias)) for it in new_items}
    if version == 3 and not args.force and before == after:
        print("No changes (already v3 IDs).")
        return

    save_items("alias.json", new_items)
    action = (
        "Forced write"
        if args.force
        else ("Migrated & updated" if (version or 0) < 3 else "Updated")
    )
    print(f"{action} alias.json (v3), total items: {len(new_items)}")


if __name__ == "__main__":
    main()
