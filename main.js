import JSZip from "jszip";
import i18n from "./i18n.js";

// 获取API配置
function getApiConfig() {
  const config = localStorage.getItem('apiConfig');
  if (config) {
    return JSON.parse(config);
  }
  throw new Error(i18n.t('apiConfigNotFound'));
}

// 保存API配置
function saveApiConfig(host, owner, repo) {
  const config = { host, owner, repo };
  localStorage.setItem('apiConfig', JSON.stringify(config));
  return config;
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
  return document.getElementById( 'use-proxy' ).checked;
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
  // 获取动态API配置
  const apiConfig = getApiConfig();
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


  const apiConfig = getApiConfig();
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

  const searchInput = document.getElementById( 'search' );
  const resultsEl = document.getElementById( 'results' );
  const startBtn = document.getElementById( 'start' );
  
  // API配置相关元素
  const apiHostInput = document.getElementById( 'api-host' );
  const repoOwnerInput = document.getElementById( 'repo-owner' );
  const repoNameInput = document.getElementById( 'repo-name' );
  const saveConfigBtn = document.getElementById( 'save-config' );

  // 加载保存的API配置
  const savedConfig = getApiConfig();
  apiHostInput.value = savedConfig.host;
  repoOwnerInput.value = savedConfig.owner;
  repoNameInput.value = savedConfig.repo;

  let selectedKey = null;

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

  // 保存API配置事件
  saveConfigBtn.addEventListener( 'click', () =>
  {
    const host = apiHostInput.value.trim();
    const owner = repoOwnerInput.value.trim();
    const repo = repoNameInput.value.trim();
    
    if ( !host || !owner || !repo )
    {
      updateStatus( i18n.t( 'configRequired' ) + ' (´･ω･`)' );
      return;
    }
    
    saveApiConfig( host, owner, repo );
    updateStatus( i18n.t( 'configSaved' ) + ' (＾▽＾)' );
    
    // 清空搜索结果，因为API配置已改变
    selectedKey = null;
    searchInput.value = '';
    renderResults( [] );
    startBtn.disabled = true;
  } );

  // 监听语言切换事件，重新渲染搜索结果
  window.addEventListener( 'languageChanged', () =>
  {
    // 重新渲染当前搜索结果
    const matchedKeys = filterKeys( searchInput.value );
    renderResults( matchedKeys );
    // 重置状态消息
    resetStatus();
    
    // 更新API配置表单的占位符文本
    const currentConfig = getApiConfig();
    apiHostInput.placeholder = i18n.t( 'apiHostPlaceholder' );
    repoOwnerInput.placeholder = i18n.t( 'repoOwnerPlaceholder' );
    repoNameInput.placeholder = i18n.t( 'repoNamePlaceholder' );
  } );
} )();