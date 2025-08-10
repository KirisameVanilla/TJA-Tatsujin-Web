// 多语言配置
const translations = {
  'zh-CN': {
    // 页面标题和元信息
    title: 'TJA-Tatsujin',

    // 页面头部
    githubTitle: '查看项目源码',
    headerTitle: 'TJA-Tatsujin',

    // 主要内容
    searchPlaceholder: '输入搜索关键字',
    startDownload: '开始下载',
    previewBtn: '预览谱面',
    startGeneratingPreviewZip: '正在生成预览包……',

    // API 配置
    apiConfigTitle: '设置',
    apiListTitle: 'API 配置列表',
    addApi: '添加 API',
    addApiTitle: '添加 API 配置',
    editApiTitle: '编辑 API 配置',
    apiTypeLabel: 'API 类型',
    apiNameLabel: '配置名称',
    apiNamePlaceholder: '例如: 主服务器',
    apiUseProxy: '使用加速代理（推荐开启）',
    saveApi: '保存 API',
    cancelApi: '取消',
    deleteApi: '删除',
    editApi: '编辑',
    apiSaved: 'API 配置已保存！',
    apiDeleted: 'API 配置已删除',
    noApiConfigured: '未配置任何 API，请先添加',
    apiConfigNotFound: '未找到API配置，请先设置',
    apiHostLabel: 'API 主机地址',
    apiHostPlaceholder: '例如: xxx.xxx.xx',
    repoOwnerLabel: '仓库所有者',
    repoOwnerPlaceholder: '例如: xxx',
    repoNameLabel: '仓库名称',
    repoNamePlaceholder: '例如: xxx',
    configRequired: '请填写完整的API配置信息',
    proxyEnabled: '代理已启用',
    proxyDisabled: '代理已禁用',

    // 状态信息
    greeting: '你好~ (*・ω・)ﾉ',
    loadingAlias: '加载 alias.json 失败啦 (；´д｀)ゞ',
    searching: '搜索中...',
    downloading: '下载中...',
    downloadComplete: '下载完成！',
    downloadError: '下载失败！',
    noResults: '没有找到相关结果，请重试',
    fetchFilesSuccess: '获取文件列表成功！',

    // 初始化和加载相关
    loadingJSZip: '加载压缩库 JSZip 中...... (。-`ω´-)',
    jsZipInitFailed: '初始化失败：无法加载压缩库 JSZip。请检查网络或刷新页面。 (；へ：)',
    loadingDataFiles: '加载数据文件中...... (。-`ω´-)',
    loadDataFilesFailed: '加载数据文件失败:',
    loadingCompleted: '加载完成！ (＾▽＾)',

    // 文件操作相关
    fetchingFileList: '正在获取文件列表...',
    fetchFileListFailed: '获取文件列表失败:',
    generatingZip: '正在生成压缩包... (￣ω￣;)',
    filesPackaged: '个文件打包',
    filesPackagedPrefix: '共',
    errorLabel: '错误:',

    // 页脚
    footerText: '非官方项目，仅供学习交流。',

    // Discord 社区
    discordCommunityTitle: '加入我们的 Discord 社区',
    discordCommunityDesc: '与其他玩家交流讨论，获取最新资讯，分享游戏心得',
    discordCommunityBtn: 'Discord 社区',

    // 语言切换
    languageSwitch: '切换语言',

    // 主题切换
    toggleTheme: '切换主题',
    autoTheme: '自动',
    themeSettings: '主题设置',
    currentTheme: '当前主题',
    lightTheme: '浅色模式',
    darkTheme: '深色模式',
    autoThemeDay: '自动选择 (白天)',
    autoThemeNight: '自动选择 (夜晚)'
  },

  'en': {
    // 页面标题和元信息
    title: 'TJA-Tatsujin',

    // 页面头部
    githubTitle: 'View source code',
    headerTitle: 'TJA-Tatsujin',

    // 主要内容
    searchPlaceholder: 'Enter search keywords',
    startDownload: 'Start Download',
    previewBtn: 'Preview Chart',
    startGeneratingPreviewZip: 'Start Generating Preview Zip',

    // API 配置
    apiConfigTitle: 'Settings',
    apiListTitle: 'API Configuration List',
    addApi: 'Add API',
    addApiTitle: 'Add API Configuration',
    editApiTitle: 'Edit API Configuration',
    apiTypeLabel: 'API Type',
    apiNameLabel: 'Configuration Name',
    apiNamePlaceholder: 'e.g.: Main Server',
    apiUseProxy: 'Use acceleration proxy (recommended)',
    saveApi: 'Save API',
    cancelApi: 'Cancel',
    deleteApi: 'Delete',
    editApi: 'Edit',
    apiSaved: 'API configuration saved!',
    apiDeleted: 'API configuration deleted',
    noApiConfigured: 'No API configured, please add one first',
    apiConfigNotFound: 'API configuration not found, please set it first',
    apiHostLabel: 'API Host',
    apiHostPlaceholder: 'e.g.: xxx.xxx.xx',
    repoOwnerLabel: 'Repository Owner',
    repoOwnerPlaceholder: 'e.g.: xxx',
    repoNameLabel: 'Repository Name',
    repoNamePlaceholder: 'e.g.: xxx',
    configRequired: 'Please fill in complete API configuration',
    proxyEnabled: 'Proxy enabled',
    proxyDisabled: 'Proxy disabled',

    // 状态信息
    greeting: 'Hello~ (*・ω・)ﾉ',
    loadingAlias: 'Failed to load alias.json (；´д｀)ゞ',
    searching: 'Searching...',
    downloading: 'Downloading...',
    downloadComplete: 'Download completed!',
    downloadError: 'Download failed!',
    noResults: 'No results found, please try again',
    fetchFilesSuccess: 'File list fetched successfully!',

    // 初始化和加载相关
    loadingJSZip: 'Loading JSZip library... (。-`ω´-)',
    jsZipInitFailed: 'Initialization failed: Unable to load JSZip library. Please check your network or refresh the page. (；へ：)',
    loadingDataFiles: 'Loading data files... (。-`ω´-)',
    loadDataFilesFailed: 'Failed to load data files:',
    loadingCompleted: 'Loading completed! (＾▽＾)',

    // 文件操作相关
    fetchingFileList: 'Fetching file list...',
    fetchFileListFailed: 'Failed to fetch file list:',
    generatingZip: 'Generating zip file... (￣ω￣;)',
    filesPackaged: 'files packaged',
    filesPackagedPrefix: '',
    errorLabel: 'Error:',

    // 页脚
    footerText: 'Unofficial project, for learning and communication only.',

    // Discord 社区
    discordCommunityTitle: 'Join Our Discord Community',
    discordCommunityDesc: 'Chat with other players, get latest updates, and share your gaming experiences',
    discordCommunityBtn: 'Discord Community',

    // 语言切换
    languageSwitch: 'Switch Language',

    // 主题切换
    toggleTheme: 'Toggle Theme',
    autoTheme: 'Auto',
    themeSettings: 'Theme Settings',
    currentTheme: 'Current Theme',
    lightTheme: 'Light Mode',
    darkTheme: 'Dark Mode',
    autoThemeDay: 'Auto (Day)',
    autoThemeNight: 'Auto (Night)'
  }
};

class I18n {
  constructor() {
    // 检测浏览器语言或从本地存储获取
    this.currentLanguage = this.detectLanguage();
    this.init();
  }

  detectLanguage() {
    // 优先从 localStorage 获取用户选择的语言
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }

    // 检测浏览器语言
    const browserLanguage = navigator.language || navigator.userLanguage;

    // 如果是中文相关，返回中文
    if (browserLanguage.startsWith('zh')) {
      return 'zh-CN';
    }

    // 默认返回英文
    return 'en';
  }

  init() {
    this.updatePageLanguage();
    this.createLanguageSwitch();
  }

  t(key) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }

    return value || key;
  }

  // 格式化带参数的文本
  formatFilesPackaged(count) {
    const prefix = this.t('filesPackagedPrefix');
    const suffix = this.t('filesPackaged');
    if (this.currentLanguage === 'zh-CN') {
      return `${prefix} ${count} ${suffix}`;
    } else {
      return `${count} ${suffix}`;
    }
  }

  setLanguage(language) {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
      this.updatePageLanguage();

      // 触发语言切换事件
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: language }
      }));
    }
  }

  updatePageLanguage() {
    // 更新页面标题
    document.title = this.t('title');

    // 更新 HTML lang 属性
    document.documentElement.lang = this.currentLanguage === 'zh-CN' ? 'zh-CN' : 'en';

    // 更新页面文本
    this.updateTexts();
  }

  updateTexts() {
    // 更新所有带有 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const text = this.t(key);

      if (element.tagName === 'INPUT' && element.type === 'text') {
        element.placeholder = text;
      } else if (element.hasAttribute('title')) {
        element.title = text;
      } else {
        element.textContent = text;
      }
    });
  }

  createLanguageSwitch() {
    // 创建语言切换按钮
    const header = document.querySelector('header');
    const languageSwitch = document.createElement('div');
    languageSwitch.className = 'language-switch';
    languageSwitch.innerHTML = `
      <button class="bg-white/20 border border-white/30 text-white px-3 py-2 rounded-md cursor-pointer flex items-center gap-1.5 text-sm transition-all duration-100 hover:bg-white/30 hover:scale-105" title="${this.t('languageSwitch')}">
        <i class="fas fa-globe"></i>
        <span class="font-medium">${this.currentLanguage === 'zh-CN' ? '中' : 'EN'}</span>
      </button>
      <div class="absolute top-full left-0 bg-white border border-gray-300 rounded-md shadow-lg min-w-[120px] z-[1000] opacity-0 invisible -translate-y-2 transition-all duration-100 mt-2">
        <div class="px-4 py-2.5 text-gray-700 cursor-pointer transition-all duration-100 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${this.currentLanguage === 'zh-CN' ? 'bg-red-500 text-white' : ''}" data-lang="zh-CN">
          <span class="font-medium">中文</span>
        </div>
        <div class="px-4 py-2.5 text-gray-700 cursor-pointer transition-all duration-100 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 ${this.currentLanguage === 'en' ? 'bg-red-500 text-white' : ''}" data-lang="en">
          <span class="font-medium">English</span>
        </div>
      </div>
    `;

    // 插入到 GitHub 链接之前
    const githubLink = header.querySelector('a');
    header.insertBefore(languageSwitch, githubLink);

    // 添加事件监听
    this.bindLanguageSwitchEvents(languageSwitch);
  }

  bindLanguageSwitchEvents(languageSwitch) {
    const btn = languageSwitch.querySelector('button');
    const dropdown = languageSwitch.querySelector('div:nth-child(2)'); // 第二个div是下拉菜单
    const options = languageSwitch.querySelectorAll('[data-lang]');

    // 点击按钮显示/隐藏下拉菜单
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('opacity-0')) {
        dropdown.classList.remove('opacity-0', 'invisible', '-translate-y-2');
        dropdown.classList.add('opacity-100', 'visible', 'translate-y-0');
      } else {
        dropdown.classList.add('opacity-0', 'invisible', '-translate-y-2');
        dropdown.classList.remove('opacity-100', 'visible', 'translate-y-0');
      }
    });

    // 点击选项切换语言
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        this.setLanguage(lang);

        // 更新按钮文本
        const languageText = btn.querySelector('span');
        languageText.textContent = lang === 'zh-CN' ? '中' : 'EN';

        // 更新选中状态
        options.forEach(opt => {
          opt.classList.remove('bg-red-500', 'text-white');
          opt.classList.add('text-gray-700');
        });
        option.classList.add('bg-red-500', 'text-white');
        option.classList.remove('text-gray-700');

        // 隐藏下拉菜单
        dropdown.classList.add('opacity-0', 'invisible', '-translate-y-2');
        dropdown.classList.remove('opacity-100', 'visible', 'translate-y-0');
      });
    });

    // 点击其他地方隐藏下拉菜单
    document.addEventListener('click', () => {
      if (!dropdown.classList.contains('opacity-0')) {
        dropdown.classList.add('opacity-0', 'invisible', '-translate-y-2');
        dropdown.classList.remove('opacity-100', 'visible', 'translate-y-0');
      }
    });
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// 导出实例
export default new I18n();
