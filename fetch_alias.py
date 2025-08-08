import json
import os
import requests
from urllib.parse import quote

def get_directory_structure(base_url):
    """从 API 获取目录结构（只获取二级目录）"""
    headers = {'accept': 'application/json'}
    
    structure_paths = set()
    
    try:
        response = requests.get(f"{base_url}/.", headers=headers)
        response.raise_for_status()
        root_contents = response.json()
        
        for item in root_contents:
            if item.get('type') == 'dir':
                dir_name = item['name']
                
                try:
                    encoded_dir_name = quote(dir_name)
                    new_url = f"{base_url}/{encoded_dir_name}"
                    sub_response = requests.get(new_url, headers=headers)
                    sub_response.raise_for_status()
                    sub_contents = sub_response.json()
                    
                    for sub_item in sub_contents:
                        if sub_item.get('type') == 'dir':
                            dir_path = f"{dir_name}/{sub_item['name']}"
                            structure_paths.add(dir_path)
                            
                except requests.RequestException as e:
                    print(f"获取 {dir_name} 内容时出错: {e}")
                    
    except requests.RequestException as e:
        print(f"获取根目录内容时出错: {e}")
    
    return structure_paths

def main():
    API_URL = os.getenv("API_URL", None)

    if API_URL is None:
        print("API_URL 环境变量未设置.")
        return

    base_url = API_URL
    structure_paths: set[str] = get_directory_structure(base_url)

    alias_path = "alias.json"
    if os.path.exists(alias_path):
        with open(alias_path, "r", encoding="utf-8") as f:
            alias = json.load(f)
    else:
        alias = {}

    alias_keys = set(alias.keys())

    updated = False
    for full_path in sorted(structure_paths):
        folder_name = full_path.split("/")[-1]
        if folder_name not in alias_keys:
            alias[folder_name] = {
                "path": full_path,
                "alias": []
            }
            updated = True
        elif alias[folder_name]["path"] != full_path:
            backup_alias = alias[folder_name]["alias"]
            alias[folder_name] = {
                "path": full_path,
                "alias": backup_alias
            }
            updated = True

    if updated:
        with open(alias_path, "w", encoding="utf-8") as f:
            json.dump(alias, f, ensure_ascii=False, indent=4, sort_keys=True)
    else:
        print("No new keys to add.")

if __name__ == "__main__":
    main()
