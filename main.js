import JSZip from "jszip";
import i18n from "./i18n.js";

// 获取API配置列表
function getApiConfigs() {
  const configs = localStorage.getItem('apiConfigs');
  if (configs) {
    return JSON.parse(configs);
  }
  return [];
}

// 保存API配置列表
function saveApiConfigs(configs) {
  localStorage.setItem('apiConfigs', JSON.stringify(configs));
}

// 获取随机API配置
function getRandomApiConfig() {
  const configs = getApiConfigs();
  if (configs.length === 0) {
    updateStatus(i18n.t('noApiConfigured'));
    return null;
  }
  const randomIndex = Math.floor(Math.random() * configs.length);
  return configs[randomIndex];
}

// 获取通用设置（代理等）
function getGeneralConfig() {
  const config = localStorage.getItem('generalConfig');
  if (config) {
    return JSON.parse(config);
  }
  return {
    useProxy: true // 默认启用代理
  };
}

// 保存通用设置
function saveGeneralConfig(useProxy) {
  const config = { useProxy };
  localStorage.setItem('generalConfig', JSON.stringify(config));
  return config;
}

// 兼容旧版本配置的迁移函数
function migrateOldConfig() {
  const oldConfig = localStorage.getItem('apiConfig');
  if (oldConfig && getApiConfigs().length === 0) {
    const parsed = JSON.parse(oldConfig);
    if (parsed.host && parsed.owner && parsed.repo) {
      const newConfigs = [{
        id: Date.now(),
        type: 'gitea',
        name: '迁移的配置',
        host: parsed.host,
        owner: parsed.owner,
        repo: parsed.repo
      }];
      saveApiConfigs(newConfigs);
      
      // 保存代理设置
      if (parsed.useProxy !== undefined) {
        saveGeneralConfig(parsed.useProxy);
      }
      
      // 删除旧配置
      localStorage.removeItem('apiConfig');
    }
  }
}

function updateStatus ( text )
{
  document.getElementById( 'status' ).textContent = text;
}

function resetStatus ()
{
  updateStatus( i18n.t( 'greeting' ) );
}

function isProxyEnabled ()
{
  const config = getGeneralConfig();
  return config.useProxy !== undefined ? config.useProxy : true; // 默认启用代理
}

// 加载 alias.json（本地）
async function loadAlias ()
{
  const res = await fetch( './alias.json' );
  if ( !res.ok ) throw new Error( i18n.t( 'loadingAlias' ) );
  return await res.json();
}

// 递归获取指定路径下的所有文件
async function getFilesFromPath ( basePath )
{
  // 获取随机API配置
  const apiConfig = getRandomApiConfig();
  if (!apiConfig) {
    throw new Error(i18n.t('noApiConfigured'));
  }
  
  // 为API调用使用代理（如果启用）
  const baseURL = isProxyEnabled() ? 
    `https://ghproxy.vanillaaaa.org/https://${apiConfig.host}/api/v1/repos/${apiConfig.owner}/${apiConfig.repo}/contents` :
    `https://${apiConfig.host}/api/v1/repos/${apiConfig.owner}/${apiConfig.repo}/contents`;
  const files = [];

  async function fetchDirectoryContents ( path )
  {
    const url = `${ baseURL }/${ encodeURIComponent( path ) }`;

    try
    {
      const res = await fetch( url, {
        headers: { 'accept': 'application/json' }
      } );
      if ( !res.ok ) throw new Error( `Failed to fetch ${ path }: ${ res.status }` );

      const contents = await res.json();

      for ( const item of contents )
      {
        if ( item.type === 'file' )
        {
          const relativePath = path === basePath ? item.name : `${ path.substring( basePath.length + 1 ) }/${ item.name }`;
          files.push( {
            name: item.name,
            path: relativePath,
            fullPath: `${ path }/${ item.name }`
          } );
        } else if ( item.type === 'dir' )
        {
          const subPath = `${ path }/${ item.name }`;
          await fetchDirectoryContents( subPath );
        }
      }
    } catch ( e )
    {
      console.warn( `Failed to fetch directory ${ path }:`, e );
      throw e;
    }
  }

  await fetchDirectoryContents( basePath );
  return files;
}

// 通过 alias 动态获取文件并下载
async function downloadFilesFromStructure ( selectedKey, alias, zip )
{
  const ref = 'master';
  const basePath = alias[selectedKey].path;  // 目录路径


  let files;
  try
  {
    updateStatus( i18n.t( 'fetchingFileList' ) );
    files = await getFilesFromPath( basePath );
  } catch ( e )
  {
    throw new Error( `${ i18n.t( 'fetchFileListFailed' ) } ${ e.message }` );
  }

  if ( !files || files.length === 0 )
  {
    updateStatus( i18n.t( 'noResults' ) + ' (⊙_⊙)？' );
    return;
  } else {
    updateStatus( i18n.t( 'fetchFilesSuccess' ));
  }


  const apiConfig = getRandomApiConfig();
  if (!apiConfig) {
    throw new Error(i18n.t('noApiConfigured'));
  }
  
  const baseURL = isProxyEnabled() ? 
    `https://ghproxy.vanillaaaa.org/https://${apiConfig.host}/${apiConfig.owner}/${apiConfig.repo}/raw/branch` : 
    `https://${apiConfig.host}/${apiConfig.owner}/${apiConfig.repo}/raw/branch`;

  for ( let i = 0; i < files.length; i++ )
  {
    const file = files[i];
    const fileUrl = `${ baseURL }/${ ref }/${ file.fullPath }`;
    try
    {
      updateStatus( `${ i18n.t( 'downloading' ) } (${ i + 1 }/${ files.length }): ${ file.path } (◕‿◕)` );
      const res = await fetch( fileUrl );
      if ( !res.ok ) throw new Error( `${ i18n.t( 'downloadError' ) }: ${ res.status }` );
      const blob = await res.blob();
      zip.file( file.path, blob, { binary: true } );
    } catch ( e )
    {
      updateStatus( `${ i18n.t( 'downloadError' ) } ${ file.path }, ${ i18n.t( 'errorLabel' ) } ${ e.message } (；一_一)` );
      return;
    }
  }

  updateStatus( i18n.t( 'generatingZip' ) );
  const content = await zip.generateAsync( { type: 'blob' } );
  const a = document.createElement( 'a' );
  a.href = URL.createObjectURL( content );
  a.download = `${ selectedKey }.zip`;
  a.click();

  updateStatus( `${ i18n.t( 'downloadComplete' ) } ${ i18n.formatFilesPackaged( files.length ) } (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧` );
}

// 主入口
( async () =>
{
  let zip;
  try
  {
    updateStatus( i18n.t( 'loadingJSZip' ) );
    zip = new JSZip();
  } catch ( e )
  {
    updateStatus( i18n.t( 'jsZipInitFailed' ) );
    return;
  }

  // 只加载 alias，不再预加载 structure
  let alias;
  try
  {
    updateStatus( i18n.t( 'loadingDataFiles' ) );
    alias = await loadAlias();
  } catch ( e )
  {
    updateStatus( `${ i18n.t( 'loadDataFilesFailed' ) } ` + e.message + ' (；へ：)' );
    return;
  }

  updateStatus( i18n.t( 'loadingCompleted' ) );

  // 迁移旧配置
  migrateOldConfig();

  const searchInput = document.getElementById( 'search' );
  const resultsEl = document.getElementById( 'results' );
  const startBtn = document.getElementById( 'start' );
  
  // API配置相关元素
  const addApiBtn = document.getElementById( 'add-api' );
  const apiList = document.getElementById( 'api-list' );
  const apiForm = document.getElementById( 'api-form' );
  const apiFormTitle = document.getElementById( 'api-form-title' );
  const apiTypeInput = document.getElementById( 'api-type' );
  const apiNameInput = document.getElementById( 'api-name' );
  const apiHostInput = document.getElementById( 'api-host' );
  const repoOwnerInput = document.getElementById( 'repo-owner' );
  const repoNameInput = document.getElementById( 'repo-name' );
  const saveApiBtn = document.getElementById( 'save-api' );
  const cancelApiBtn = document.getElementById( 'cancel-api' );
  const useProxyInput = document.getElementById( 'use-proxy' );

  // 设置弹窗相关元素
  const settingsBtn = document.getElementById( 'settings-btn' );
  const settingsModal = document.getElementById( 'settings-modal' );
  const closeModal = settingsModal.querySelector( '.close' );

  // 加载保存的通用配置
  const generalConfig = getGeneralConfig();
  useProxyInput.checked = generalConfig.useProxy !== undefined ? generalConfig.useProxy : true;

  let selectedKey = null;
  let editingApiId = null; // 用于跟踪正在编辑的API

  // 渲染API列表
  function renderApiList() {
    const configs = getApiConfigs();
    apiList.innerHTML = '';
    
    if (configs.length === 0) {
      apiList.innerHTML = `<div style="padding: 2rem; text-align: center; color: #666;">${i18n.t('noApiConfigured')}</div>`;
      return;
    }
    
    configs.forEach(config => {
      const apiItem = document.createElement('div');
      apiItem.className = 'api-item';
      apiItem.innerHTML = `
        <div class="api-info">
          <div class="api-name">
            <span class="api-type-badge">${config.type.toUpperCase()}</span>
            ${config.name}
          </div>
          <div class="api-details">${config.host}/${config.owner}/${config.repo}</div>
        </div>
        <div class="api-actions">
          <button class="api-action-btn edit" title="${i18n.t('editApi')}" data-id="${config.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="api-action-btn delete" title="${i18n.t('deleteApi')}" data-id="${config.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      
      // 绑定编辑和删除事件
      const editBtn = apiItem.querySelector('.edit');
      const deleteBtn = apiItem.querySelector('.delete');
      
      editBtn.addEventListener('click', () => editApi(config.id));
      deleteBtn.addEventListener('click', () => deleteApi(config.id));
      
      apiList.appendChild(apiItem);
    });
  }

  // 显示添加/编辑API表单
  function showApiForm(config = null) {
    editingApiId = config ? config.id : null;
    apiFormTitle.textContent = config ? i18n.t('editApiTitle') : i18n.t('addApiTitle');
    
    if (config) {
      apiTypeInput.value = config.type;
      apiNameInput.value = config.name;
      apiHostInput.value = config.host;
      repoOwnerInput.value = config.owner;
      repoNameInput.value = config.repo;
    } else {
      apiTypeInput.value = 'gitea';
      apiNameInput.value = '';
      apiHostInput.value = '';
      repoOwnerInput.value = '';
      repoNameInput.value = '';
    }
    
    apiForm.style.display = 'block';
  }

  // 隐藏API表单
  function hideApiForm() {
    apiForm.style.display = 'none';
    editingApiId = null;
  }

  // 保存API配置
  function saveApi() {
    const type = apiTypeInput.value;
    const name = apiNameInput.value.trim();
    const host = apiHostInput.value.trim();
    const owner = repoOwnerInput.value.trim();
    const repo = repoNameInput.value.trim();
    
    if (!name || !host || !owner || !repo) {
      updateStatus(i18n.t('configRequired') + ' (´･ω･`)');
      return;
    }
    
    const configs = getApiConfigs();
    
    if (editingApiId) {
      // 编辑现有配置
      const index = configs.findIndex(c => c.id === editingApiId);
      if (index !== -1) {
        configs[index] = { ...configs[index], type, name, host, owner, repo };
      }
    } else {
      // 添加新配置
      const newConfig = {
        id: Date.now(),
        type,
        name,
        host,
        owner,
        repo
      };
      configs.push(newConfig);
    }
    
    saveApiConfigs(configs);
    renderApiList();
    hideApiForm();
    updateStatus(i18n.t('apiSaved') + ' (＾▽＾)');
  }

  // 编辑API配置
  function editApi(id) {
    const configs = getApiConfigs();
    const config = configs.find(c => c.id === id);
    if (config) {
      showApiForm(config);
    }
  }

  // 删除API配置
  function deleteApi(id) {
    if (confirm('确定要删除这个API配置吗？')) {
      const configs = getApiConfigs();
      const filtered = configs.filter(c => c.id !== id);
      saveApiConfigs(filtered);
      renderApiList();
      updateStatus(i18n.t('apiDeleted') + ' (＾▽＾)');
    }
  }

  // 初始化API列表
  renderApiList();

  function filterKeys ( query )
  {
    const q = query.trim().toLowerCase();
    if ( !q ) return [];
    return Object.entries( alias ).filter( ( [key, val] ) =>
    {
      if ( key.toLowerCase().includes( q ) ) return true;
      return val.alias.some( a => a.toLowerCase().includes( q ) );

    } ).map( ( [key] ) => key );
  }

  function renderResults ( keys )
  {
    resultsEl.innerHTML = '';
    keys.forEach( key =>
    {
      const li = document.createElement( 'li' );
      li.textContent = key;
      if ( key === selectedKey ) li.classList.add( 'selected' );
      li.onclick = () =>
      {
        selectedKey = key;
        renderResults( keys );
        startBtn.disabled = false;
        resetStatus();
      };
      resultsEl.appendChild( li );
    } );
    if ( keys.length === 0 )
    {
      resultsEl.textContent = i18n.t( 'noResults' ) + ' (´･ω･`)?';
      startBtn.disabled = true;
    }
  }

  searchInput.addEventListener( 'input', () =>
  {
    selectedKey = null;
    const matchedKeys = filterKeys( searchInput.value );
    renderResults( matchedKeys );
    startBtn.disabled = true;
    resetStatus();
  } );

  startBtn.addEventListener( 'click', async () =>
  {
    if ( !selectedKey ) return;
    startBtn.disabled = true;
    updateStatus( i18n.t( 'downloading' ) + '... (ﾟ▽ﾟ)/' );
    try
    {
      await downloadFilesFromStructure( selectedKey, alias, zip );
    } catch ( e )
    {
      updateStatus( i18n.t( 'downloadError' ) + ': ' + e.message + ' (；一_一)' );
    }
    startBtn.disabled = false;
  } );

  // API管理事件监听
  addApiBtn.addEventListener('click', () => showApiForm());
  saveApiBtn.addEventListener('click', saveApi);
  cancelApiBtn.addEventListener('click', hideApiForm);

  // 保存通用配置事件
  useProxyInput.addEventListener('change', () => {
    saveGeneralConfig(useProxyInput.checked);
    updateStatus(i18n.t('configSaved') + ' (＾▽＾)');
  });

  // 设置按钮点击事件 - 打开弹窗
  settingsBtn.addEventListener( 'click', () =>
  {
    settingsModal.classList.add( 'show' );
  } );

  // 关闭按钮点击事件
  closeModal.addEventListener( 'click', () =>
  {
    settingsModal.classList.remove( 'show' );
  } );

  // 点击弹窗背景关闭弹窗
  settingsModal.addEventListener( 'click', ( e ) =>
  {
    if ( e.target === settingsModal )
    {
      settingsModal.classList.remove( 'show' );
    }
  } );

  // ESC键关闭弹窗
  document.addEventListener( 'keydown', ( e ) =>
  {
    if ( e.key === 'Escape' && settingsModal.classList.contains( 'show' ) )
    {
      settingsModal.classList.remove( 'show' );
    }
  } );

  // 监听语言切换事件，重新渲染搜索结果
  window.addEventListener( 'languageChanged', () =>
  {
    // 重新渲染当前搜索结果
    const matchedKeys = filterKeys( searchInput.value );
    renderResults( matchedKeys );
    // 重置状态消息
    resetStatus();
    
    // 重新渲染API列表以更新翻译
    renderApiList();
    
    // 更新API配置表单的占位符文本
    const currentConfig = getGeneralConfig();
    apiNameInput.placeholder = i18n.t( 'apiNamePlaceholder' );
    apiHostInput.placeholder = i18n.t( 'apiHostPlaceholder' );
    repoOwnerInput.placeholder = i18n.t( 'repoOwnerPlaceholder' );
    repoNameInput.placeholder = i18n.t( 'repoNamePlaceholder' );
    // 确保代理设置保持当前配置
    useProxyInput.checked = currentConfig.useProxy !== undefined ? currentConfig.useProxy : true;
  } );
} )();