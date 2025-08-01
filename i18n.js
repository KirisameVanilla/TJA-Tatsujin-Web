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
    useProxy: '使用私人提供的加速代理（因为CORS, 请务必使用）',
    
    // API 配置
    apiConfigTitle: 'API 配置',
    apiConfigNotFound: '未找到API配置，请先设置',
    apiHostLabel: 'API 主机地址',
    apiHostPlaceholder: '例如: xxx.xxx.xx',
    repoOwnerLabel: '仓库所有者',
    repoOwnerPlaceholder: '例如: xxx',
    repoNameLabel: '仓库名称',
    repoNamePlaceholder: '例如: xxx',
    saveConfig: '保存配置',
    configSaved: '配置已保存！',
    configRequired: '请填写完整的API配置信息',
    
    // 状态信息
    greeting: '你好~ (*・ω・)ﾉ',
    loadingAlias: '加载 alias.json 失败啦 (；´д｀)ゞ',
    loadingStructure: '加载 structure.json 失败啦 (；´д｀)ゞ',
    searching: '搜索中...',
    downloading: '下载中...',
    downloadComplete: '下载完成！',
    downloadError: '下载失败！',
    noResults: '没有找到相关结果，请重试',
    selectSong: '请选择要下载的歌曲',
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
    
    // 语言切换
    languageSwitch: '切换语言'
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
    useProxy: 'Use provided acceleration proxy (CORS issue, please use)',
    
    // API 配置
    apiConfigTitle: 'API Configuration',
    apiConfigNotFound: 'API configuration not found, please set it first',
    apiHostLabel: 'API Host',
    apiHostPlaceholder: 'e.g.: xxx.xxx.xx',
    repoOwnerLabel: 'Repository Owner',
    repoOwnerPlaceholder: 'e.g.: xxx',
    repoNameLabel: 'Repository Name',
    repoNamePlaceholder: 'e.g.: xxx',
    saveConfig: 'Save Configuration',
    configSaved: 'Configuration saved!',
    configRequired: 'Please fill in complete API configuration',
    
    // 状态信息
    greeting: 'Hello~ (*・ω・)ﾉ',
    loadingAlias: 'Failed to load alias.json (；´д｀)ゞ',
    loadingStructure: 'Failed to load structure.json (；´д｀)ゞ',
    searching: 'Searching...',
    downloading: 'Downloading...',
    downloadComplete: 'Download completed!',
    downloadError: 'Download failed!',
    noResults: 'No results found, please try again',
    selectSong: 'Please select a song to download',
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
    
    // 语言切换
    languageSwitch: 'Switch Language'
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
      <button class="language-btn" title="${this.t('languageSwitch')}">
        <i class="fas fa-globe"></i>
        <span class="language-text">${this.currentLanguage === 'zh-CN' ? '中' : 'EN'}</span>
      </button>
      <div class="language-dropdown">
        <div class="language-option ${this.currentLanguage === 'zh-CN' ? 'active' : ''}" data-lang="zh-CN">
          中文
        </div>
        <div class="language-option ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
          English
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
    const btn = languageSwitch.querySelector('.language-btn');
    const dropdown = languageSwitch.querySelector('.language-dropdown');
    const options = languageSwitch.querySelectorAll('.language-option');
    
    // 点击按钮显示/隐藏下拉菜单
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });
    
    // 点击选项切换语言
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = option.getAttribute('data-lang');
        this.setLanguage(lang);
        
        // 更新按钮文本
        const languageText = btn.querySelector('.language-text');
        languageText.textContent = lang === 'zh-CN' ? '中' : 'EN';
        
        // 更新选中状态
        options.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // 隐藏下拉菜单
        dropdown.classList.remove('show');
      });
    });
    
    // 点击其他地方隐藏下拉菜单
    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
    });
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// 导出实例
export default new I18n();
