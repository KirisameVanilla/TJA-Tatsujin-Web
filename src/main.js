import JSZip from 'jszip';
import i18n from './i18n.js';
import * as wanakana from 'wanakana';
import { pinyin } from 'pinyin';
import { showConfirm, showChoice } from './confirm-dialog.js';

// 添加到全局作用域，保持兼容性
window.showConfirm = showConfirm;


/**
 * 更新状态显示文本
 * @param {string} text 要显示的状态文本
 */
function updateStatus(text) {
  document.getElementById('status').textContent = text;
}

/**
 * 重置状态为默认问候语
 */
function resetStatus() {
  updateStatus(i18n.t('greeting'));
}

/**
 * 加载本地alias.json文件
 * @returns {Promise<Object>} alias配置对象
 * @throws {Error} 当文件加载失败时抛出错误
 */
async function loadAlias() {
  const res = await fetch('./alias.json');
  if (!res.ok) throw new Error(i18n.t('loadingAlias'));
  return await res.json();
}

/**
 * 递归获取指定路径下的所有文件
 * @param {string} basePath 基础路径
 * @returns {Promise<Array>} 文件列表数组
 * @throws {Error} 当API未配置或请求失败时抛出错误
 */
async function getFilesFromPath(basePath) {
  const baseURL = 'https://ghproxy.vanillaaaa.org/https://ese.tjadataba.se/api/v1/repos/ese/ese/contents';
  const files = [];

  async function fetchDirectoryContents(path) {
    const url = `${baseURL}/${encodeURIComponent(path)}`;

    try {
      const res = await fetch(url, {
        headers: { 'accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);

      const contents = await res.json();

      for (const item of contents) {
        if (item.type === 'file') {
          const relativePath = path === basePath ? item.name : `${path.substring(basePath.length + 1)}/${item.name}`;
          files.push({
            name: item.name,
            path: relativePath,
            fullPath: `${path}/${item.name}`
          });
        } else if (item.type === 'dir') {
          const subPath = `${path}/${item.name}`;
          await fetchDirectoryContents(subPath);
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch directory ${path}:`, e);
      throw e;
    }
  }

  await fetchDirectoryContents(basePath);
  return files;
}

/**
 * 通过alias动态获取文件并下载打包
 * @param {string} selectedKey 选中的键名
 * @param {Object} alias alias配置对象
 * @param {JSZip} zip JSZip实例
 * @throws {Error} 当文件获取或下载失败时抛出错误
 */
async function downloadFilesFromStructure(selectedKey, alias, zip) {
  const ref = 'master';
  const basePath = alias[selectedKey].path;

  let files;
  try {
    updateStatus(i18n.t('fetchingFileList'));
    files = await getFilesFromPath(basePath);
  } catch (e) {
    throw new Error(`${i18n.t('fetchFileListFailed')} ${e.message}`);
  }

  if (!files || files.length === 0) {
    updateStatus(i18n.t('noResults') + ' (⊙_⊙)？');
    return;
  } else {
    updateStatus(i18n.t('fetchFilesSuccess'));
  }

  const baseURL = 'https://ghproxy.vanillaaaa.org/https://ese.tjadataba.se/ese/ese/raw/branch';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileUrl = `${baseURL}/${ref}/${file.fullPath}`;
    try {
      updateStatus(`${i18n.t('downloading')} (${i + 1}/${files.length}): ${file.path} (◕‿◕)`);
      const res = await fetch(fileUrl);
      if (!res.ok) throw new Error(`${i18n.t('downloadError')}: ${res.status}`);
      const blob = await res.blob();
      zip.file(file.path, blob, { binary: true });
    } catch (e) {
      updateStatus(`${i18n.t('downloadError')} ${file.path}, ${i18n.t('errorLabel')} ${e.message} (；一_一)`);
      return;
    }
  }

  updateStatus(i18n.t('generatingZip'));
  const content = await zip.generateAsync({ type: 'blob' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(content);
  a.download = `${selectedKey}.zip`;
  a.click();

  updateStatus(`${i18n.t('downloadComplete')} ${i18n.formatFilesPackaged(files.length)} (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧`);
}

(async () => {
  let zip;
  try {
    updateStatus(i18n.t('loadingJSZip'));
    zip = new JSZip();
  } catch (e) {
    updateStatus(i18n.t('jsZipInitFailed'));
    return;
  }

  let alias;
  try {
    updateStatus(i18n.t('loadingDataFiles'));
    alias = await loadAlias();
  } catch (e) {
    updateStatus(`${i18n.t('loadDataFilesFailed')} ` + e.message + ' (；へ：)');
    return;
  }

  updateStatus(i18n.t('loadingCompleted'));

  const searchInput = document.getElementById('search');
  const resultsEl = document.getElementById('results');
  const startBtn = document.getElementById('start');

  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeModal = settingsModal.querySelector('.close');

  const discordBtn = document.getElementById('discord-btn');
  const discordModal = document.getElementById('discord-modal');
  const discordCloseModal = discordModal.querySelector('.close');

  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeStatus = document.getElementById('theme-status');
  const themeAuto = document.getElementById('theme-auto');

  const previewBtn = document.getElementById('preview');

  let selectedKey = null;
  let searchTimeout = null;

  /**
   * 初始化主题设置，根据保存的配置和时间智能选择主题
   */
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const lastThemeChangeTime = localStorage.getItem('lastThemeChangeTime');
    const lastThemeChangeSession = localStorage.getItem('lastThemeChangeSession');

    if (savedTheme) {
      if (shouldAutoSwitchTheme(lastThemeChangeTime, lastThemeChangeSession)) {
        const autoTheme = getAutoThemeByTime();
        setTheme(autoTheme, true);
        updateThemeChangeSession();
      } else {
        setTheme(savedTheme, false);
      }
    } else {
      const autoTheme = getAutoThemeByTime();
      setTheme(autoTheme, true);
      updateThemeChangeSession();
    }
  }

  /**
   * 判断是否应该自动切换主题
   * @param {string|null} lastChangeTime 上次更改时间的时间戳字符串
   * @param {string|null} lastChangeSession 上次更改时的时间会话
   * @returns {boolean} 是否应该自动切换主题
   */
  function shouldAutoSwitchTheme(lastChangeTime, lastChangeSession) {
    if (!lastChangeTime || !lastChangeSession) {
      return true;
    }

    const now = new Date();
    const currentSession = getCurrentTimeSession();

    if (currentSession !== lastChangeSession) {
      const lastChange = new Date(parseInt(lastChangeTime));
      const timeDiff = now - lastChange;

      if (timeDiff > 60 * 60 * 1000) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取当前时间会话类型
   * @returns {string} 'day'或'night'
   */
  function getCurrentTimeSession() {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  }

  /**
   * 更新主题更改的时间和会话信息到localStorage
   */
  function updateThemeChangeSession() {
    const now = Date.now();
    const session = getCurrentTimeSession();
    localStorage.setItem('lastThemeChangeTime', now.toString());
    localStorage.setItem('lastThemeChangeSession', session);
  }

  /**
   * 根据当前时间自动判断应该使用的主题
   * @returns {string} 'light'或'dark'
   */
  function getAutoThemeByTime() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 6 && hour < 18) {
      return 'light';
    } else {
      return 'dark';
    }
  }

  /**
   * 设置主题并更新UI显示
   * @param {string} theme 主题名称，'light'或'dark'
   * @param {boolean} isAuto 是否为自动选择的主题，默认为false
   */
  function setTheme(theme, isAuto = false) {
    document.documentElement.setAttribute('data-theme', theme);

    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
      if (isAuto) {
        themeStatus.textContent = i18n.t('autoThemeNight');
      } else {
        themeStatus.textContent = i18n.t('darkTheme');
      }
    } else {
      themeIcon.className = 'fas fa-moon';
      if (isAuto) {
        themeStatus.textContent = i18n.t('autoThemeDay');
      } else {
        themeStatus.textContent = i18n.t('lightTheme');
      }
    }

    themeIcon.classList.add('theme-transition');
    setTimeout(() => {
      themeIcon.classList.remove('theme-transition');
    }, 300);
  }

  /**
   * 手动切换主题（浅色/深色互换）
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme, false);
    updateThemeChangeSession();
  }

  /**
   * 重置为自动主题模式
   */
  function setAutoTheme() {
    localStorage.removeItem('theme');
    localStorage.removeItem('lastThemeChangeTime');
    localStorage.removeItem('lastThemeChangeSession');
    const autoTheme = getAutoThemeByTime();
    setTheme(autoTheme, true);
    updateThemeChangeSession();
  }


  const searchCache = {
    pinyin: new Map(),
    romaji: new Map(),
    normalized: new Map()
  };

  /**
   * 标准化文本：去除空格、符号，转换为小写，并使用缓存
   * @param {string} text 要标准化的文本
   * @returns {string} 标准化后的文本
   */
  function normalizeText(text) {
    if (searchCache.normalized.has(text)) {
      return searchCache.normalized.get(text);
    }

    const result = text
      .toLowerCase()
      .replace(/[\s\-_./\\()[\]{}'"!@#$%^&*+=;:,<>?|~`]/g, '')
      .replace(/[ー]/g, '')
      .trim();

    searchCache.normalized.set(text, result);
    return result;
  }

  /**
   * 将中文转换为拼音，使用缓存提高性能
   * @param {string} text 中文文本
   * @returns {string} 拼音文本（小写，无音调）
   */
  function toPinyin(text) {
    if (searchCache.pinyin.has(text)) {
      return searchCache.pinyin.get(text);
    }

    try {
      const result = pinyin(text, {
        style: 'NORMAL',
        segment: true
      }).flat().join('').toLowerCase();

      searchCache.pinyin.set(text, result);
      return result;
    } catch (e) {
      searchCache.pinyin.set(text, '');
      return '';
    }
  }

  /**
   * 将日文转换为罗马音，使用缓存提高性能
   * @param {string} text 日文文本
   * @returns {string} 罗马音文本（标准化后）
   */
  function toRomaji(text) {
    if (searchCache.romaji.has(text)) {
      return searchCache.romaji.get(text);
    }

    try {
      const result = wanakana.toRomaji(text);
      const normalized = normalizeText(result);
      searchCache.romaji.set(text, normalized);
      return normalized;
    } catch (e) {
      searchCache.romaji.set(text, '');
      return '';
    }
  }

  /**
   * 将日文平假名转换为片假名，或片假名转换为平假名
   * @param {string} text 日文文本
   * @returns {Object} 包含toKatakana和toHiragana属性的对象
   */
  function convertKana(text) {
    const toKatakana = text.replace(/[\u3041-\u3096]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
    const toHiragana = text.replace(/[\u30a1-\u30f6]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
    return { toKatakana, toHiragana };
  }

  /**
   * 生成文本的所有可能搜索词（标准化、拼音、罗马音、假名转换）
   * @param {string} text 源文本
   * @returns {Array<string>} 所有可能的搜索词数组
   */
  function generateSearchTerms(text) {
    const terms = new Set();

    const normalized = normalizeText(text);
    if (normalized) terms.add(normalized);

    const pinyinText = toPinyin(text);
    if (pinyinText) terms.add(pinyinText);

    // 使用 wanakana 进行罗马音转换
    const romajiText = toRomaji(text);
    if (romajiText) terms.add(romajiText);

    const kanaConversions = convertKana(text);
    const normalizedKatakana = normalizeText(kanaConversions.toKatakana);
    const normalizedHiragana = normalizeText(kanaConversions.toHiragana);
    if (normalizedKatakana) terms.add(normalizedKatakana);
    if (normalizedHiragana) terms.add(normalizedHiragana);

    // 对假名转换结果也进行罗马音转换
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      const katakanaRomaji = toRomaji(kanaConversions.toKatakana);
      const hiraganaRomaji = toRomaji(kanaConversions.toHiragana);
      if (katakanaRomaji) terms.add(katakanaRomaji);
      if (hiraganaRomaji) terms.add(hiraganaRomaji);
    }

    return Array.from(terms).filter(term => term.length > 0);
  }

  /**
   * 智能匹配函数，支持多语言搜索
   * @param {string} query 搜索查询字符串
   * @param {string} target 目标字符串
   * @param {Array<string>} alias 别名数组
   * @returns {boolean} 是否匹配
   */
  function smartMatch(query, target, alias) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return false;

    const queryTerms = generateSearchTerms(query);

    const allTargets = [target, ...alias];
    const allTargetTerms = allTargets.map(t => generateSearchTerms(t)).flat();

    for (const queryTerm of queryTerms) {
      for (const targetTerm of allTargetTerms) {
        if (targetTerm.includes(queryTerm)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 根据查询字符串过滤匹配的键名
   * @param {string} query 搜索查询字符串
   * @returns {Array<string>} 匹配的键名数组
   */
  function filterKeys(query) {
    const q = query.trim();
    if (!q) return [];

    const entries = Object.entries(alias);

    const matchedKeys = [];
    for (const [key, val] of entries) {
      const isMatch = smartMatch(q, key, val.alias);
      if (isMatch) {
        matchedKeys.push(key);
      }
    }

    return matchedKeys;
  }

  /**
   * 渲染搜索结果到UI列表
   * @param {Array<string>} keys 要显示的键名数组
   */
  function renderResults(keys) {
    resultsEl.innerHTML = '';
    keys.forEach(key => {
      const li = document.createElement('li');
      li.className = 'result-item px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors duration-100 hover:bg-red-50';
      li.textContent = key;
      if (key === selectedKey) {
        li.classList.add('selected', 'bg-red-100', 'text-red-500', 'font-bold', 'border-l-4', 'border-red-500');
      }
      li.onclick = () => {
        selectedKey = key;
        renderResults(keys);
        startBtn.disabled = false;
        previewBtn.disabled = false;
        resetStatus();
      };
      resultsEl.appendChild(li);
    });
    if (keys.length === 0) {
      resultsEl.textContent = i18n.t('noResults') + ' (´･ω･`)?';
      startBtn.disabled = true;
      previewBtn.disabled = true;
    }
  }

  searchInput.addEventListener('input', () => {
    selectedKey = null;
    startBtn.disabled = true;
    previewBtn.disabled = true;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      const matchedKeys = filterKeys(searchInput.value);
      renderResults(matchedKeys);
      resetStatus();
    }, 300);
  });

  startBtn.addEventListener('click', async () => {
    if (!selectedKey) return;
    startBtn.disabled = true;
    previewBtn.disabled = true;
    updateStatus(i18n.t('downloading') + '... (ﾟ▽ﾟ)/');
    try {
      await downloadFilesFromStructure(selectedKey, alias, zip);
    } catch (e) {
      updateStatus(i18n.t('downloadError') + ': ' + e.message + ' (；一_一)');
    }
    startBtn.disabled = false;
    previewBtn.disabled = false;
  });

  // 预览按钮事件
  previewBtn.addEventListener('click', async () => {
    if (!selectedKey) return;
    previewBtn.disabled = true;
    startBtn.disabled = true;

    try {
      // 显示选择弹窗
      const choice = await showChoice({
        title: i18n.t('selectPreviewToolTitle'),
        message: i18n.t('selectPreviewToolMessage'),
        choices: [
          { text: 'TJA-Viewer', value: 'viewer' },
          { text: 'TJA-Tools', value: 'tools' }
        ],
        type: 'info'
      });

      if (!choice) {
        // 用户取消了选择
        previewBtn.disabled = false;
        startBtn.disabled = false;
        return;
      }

      updateStatus(i18n.t('startGeneratingPreviewZip'));

      // 复用下载逻辑，但不触发下载，而是postMessage
      const ref = 'master';
      const basePath = alias[selectedKey].path;
      const files = await getFilesFromPath(basePath);
      if (!files || files.length === 0) {
        updateStatus(i18n.t('noResults') + ' (⊙_⊙)？');
        return;
      }
      const baseURL = 'https://ghproxy.vanillaaaa.org/https://ese.tjadataba.se/ese/ese/raw/branch';
      const zip = new JSZip();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileUrl = `${baseURL}/${ref}/${file.fullPath}`;
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`${i18n.t('downloadError')}: ${res.status}`);
        const blob = await res.blob();
        zip.file(file.path, blob, { binary: true });
      }
      updateStatus('正在打包并发送...');
      const content = await zip.generateAsync({ type: 'blob' });

      // 根据选择打开不同的网站
      let targetUrl;
      if (choice === 'viewer') {
        targetUrl = 'https://viewer.taiko.vanillaaaa.org';
      } else if (choice === 'tools') {
        targetUrl = 'https://tools.taiko.vanillaaaa.org/';
      }

      const win = window.open(targetUrl, '_blank');
      // 等待新窗口加载后发送
      const sendZip = () => {
        win.postMessage({ type: 'zip', blob: content }, '*');
      };
      // 尝试多次发送，兼容新窗口未加载完
      let tryCount = 0;
      const trySend = () => {
        if (win && win.postMessage) {
          sendZip();
        } else if (tryCount < 10) {
          tryCount++;
          setTimeout(trySend, 500);
        }
      };
      setTimeout(trySend, 1000);
      updateStatus('预览包已发送，切换到新标签页查看。');
    } catch (e) {
      updateStatus('预览失败: ' + e.message);
    }
    previewBtn.disabled = false;
    startBtn.disabled = false;
  });

  themeToggle.addEventListener('click', toggleTheme);
  themeAuto.addEventListener('click', setAutoTheme);

  initTheme();

  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');
  });

  closeModal.addEventListener('click', () => {
    settingsModal.classList.remove('show');
  });

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('show');
    }
  });

  // Discord 弹窗事件监听器
  discordBtn.addEventListener('click', () => {
    discordModal.classList.add('show');
  });

  discordCloseModal.addEventListener('click', () => {
    discordModal.classList.remove('show');
  });

  discordModal.addEventListener('click', (e) => {
    if (e.target === discordModal) {
      discordModal.classList.remove('show');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsModal.classList.contains('show')) {
      settingsModal.classList.remove('show');
    }
    if (e.key === 'Escape' && discordModal.classList.contains('show')) {
      discordModal.classList.remove('show');
    }
  });

  window.addEventListener('languageChanged', () => {
    const matchedKeys = filterKeys(searchInput.value);
    renderResults(matchedKeys);
    resetStatus();

    const currentTheme = document.documentElement.getAttribute('data-theme');
    const savedTheme = localStorage.getItem('theme');
    const isAutoTheme = !savedTheme;

    if (currentTheme === 'dark') {
      themeStatus.textContent = isAutoTheme ? i18n.t('autoThemeNight') : i18n.t('darkTheme');
    } else {
      themeStatus.textContent = isAutoTheme ? i18n.t('autoThemeDay') : i18n.t('lightTheme');
    }
  });
})();
