# TJA-Tatsujin

English | [中文版](./README.md)


A resource download site for Taiko no Tatsujin players, providing convenient chart search and download features. Supports custom data source configuration and is maintained by the community.

---

## 🚀 Project Overview

TJA-Tatsujin is a static web project deployed on Cloudflare Pages, aiming to provide a clear and user-friendly chart download platform for Taiko no Tatsujin players. The project supports user-configurable data source APIs and enables quick chart lookup via alias search.

All data comes from user-configured public resources and is for learning and communication purposes only. Please respect the original authors' copyrights.

---

## 📦 Data Source

- **Data Source**: User-Configurable

This project supports users to configure their own API data sources in the web interface, including:
- API Host Address
- Repository Owner
- Repository Name

After configuration, the system will fetch chart information from the specified data source and generate frontend-readable resource files for display.

---

## 🔧 Usage Instructions

### API Configuration
On first use, you need to fill in the "API Configuration" section at the top of the webpage:
1. **API Host** - The host address of the data source
2. **Repository Owner** - The owner of the target repository
3. **Repository Name** - The name of the target repository

After completing the configuration, click the "Save Configuration" button. The configuration information will be saved in the browser's local storage.

### Alias Management
Aliases are used to search for charts. To modify chart aliases, please edit the `alias.json` file in the root directory.

Follow the existing format in the file for additions or modifications, and ensure valid JSON syntax. Each key is a unique chart identifier (Song Name), and the value is a nested JSON object containing supported search aliases for that chart and its relative path in the data source repository. After editing, submit your changes to take effect on the website.

---

## 🛠️ Tech Stack

- **Frontend**: HTML / CSS / JavaScript
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **Automation**: GitHub Actions
- **Features**: 
  - Multi-language internationalization
  - Responsive design
  - Local storage configuration
  - Dynamic API configuration

---

## 🌍 Website

👉 [https://taiko.vanillaaaa.org](https://taiko.vanillaaaa.org)

---

## 🤝 Contribution & Feedback

Feel free to submit Issues or Pull Requests to help improve this project!  
Whether it's fixing aliases, optimizing the UI, or enhancing search features, your contributions are greatly appreciated.

- Submit Issues → [Issues](https://github.com/KirisameVanilla/TJA-Tatsujin/issues)
- Contribute → Fork this project and submit a PR

---

## 📄 License

This project does not own any song audio or copyrights, and only provides a general chart resource management tool.  
All data comes from user-configured public data sources.  
Please use this tool within legal boundaries and do not use it for commercial purposes.

---

✨ Thanks to the Taiko no Tatsujin community for their support and contributions!
