/**
 * 自定义确认弹窗模块
 *
 * 提供现代化的确认弹窗功能，使用 Tailwind CSS 样式
 * 支持多种类型、自定义文本、深色模式和流畅动画
 *
 * @author KirisameVanilla
 * @version 1.0.0
 */

/**
 * 自定义确认弹窗类
 */
export class CustomConfirm {
  constructor() {
    this.overlay = null;
    this.modal = null;
  }

  /**
   * 显示确认弹窗
   * @param {Object} options - 配置选项
   * @param {string} options.title - 弹窗标题
   * @param {string} options.message - 弹窗消息内容
   * @param {string} options.confirmText - 确认按钮文本，默认为"确认"
   * @param {string} options.cancelText - 取消按钮文本，默认为"取消"
   * @param {string} options.type - 弹窗类型：'warning', 'error', 'info', 'success'，默认为'info'
   * @returns {Promise<boolean>} 用户选择结果，true为确认，false为取消
   */
  show(options = {}) {
    const {
      title = '确认',
      message = '您确定要执行此操作吗？',
      confirmText = '确认',
      cancelText = '取消',
      type = 'info'
    } = options;

    return new Promise((resolve) => {
      // 移除已存在的弹窗
      this.remove();

      // 创建遮罩层
      this.overlay = document.createElement('div');
      this.overlay.className = `
        fixed inset-0 z-50 flex items-center justify-center 
        bg-transparent bg-opacity-50 backdrop-blur-sm 
        animate-fade-in
      `.replace(/\s+/g, ' ').trim();

      // 创建弹窗容器
      this.modal = document.createElement('div');
      this.modal.className = `
        bg-white dark:bg-gray-800 rounded-xl shadow-2xl 
        w-11/12 max-w-md mx-4 
        transform transition-all duration-300 
        animate-scale-in
      `.replace(/\s+/g, ' ').trim();

      // 获取图标和颜色样式
      const typeConfig = this.getTypeConfig(type);

      // 弹窗内容
      this.modal.innerHTML = `
        <div class="p-6">
          <!-- 图标和标题 -->
          <div class="flex items-center mb-4">
            <div class="${typeConfig.iconBg} rounded-full p-3 mr-4">
              <i class="${typeConfig.icon} ${typeConfig.iconColor} text-xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              ${this.escapeHtml(title)}
            </h3>
          </div>
          
          <!-- 消息内容 -->
          <div class="mb-6">
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              ${this.escapeHtml(message)}
            </p>
          </div>
          
          <!-- 按钮组 -->
          <div class="flex gap-3 justify-end">
            <button 
              class="cancel-btn px-4 py-2 text-gray-600 dark:text-gray-300 
                     bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                     rounded-lg transition-colors duration-200 font-medium"
              type="button"
            >
              ${this.escapeHtml(cancelText)}
            </button>
            <button 
              class="confirm-btn px-4 py-2 text-white
                     ${typeConfig.buttonBg} ${typeConfig.buttonHover}
                     rounded-lg transition-colors duration-200 font-medium"
              type="button"
            >
              ${this.escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      `;

      // 绑定事件
      const cancelBtn = this.modal.querySelector('.cancel-btn');
      const confirmBtn = this.modal.querySelector('.confirm-btn');

      const handleCancel = () => {
        this.remove();
        resolve(false);
      };

      const handleConfirm = () => {
        this.remove();
        resolve(true);
      };

      const handleOverlayClick = (e) => {
        if (e.target === this.overlay) {
          handleCancel();
        }
      };

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      };

      cancelBtn.addEventListener('click', handleCancel);
      confirmBtn.addEventListener('click', handleConfirm);
      this.overlay.addEventListener('click', handleOverlayClick);
      document.addEventListener('keydown', handleEscape);

      // 添加到页面
      this.overlay.appendChild(this.modal);
      document.body.appendChild(this.overlay);

      // 聚焦到确认按钮
      setTimeout(() => confirmBtn.focus(), 100);
    });
  }

  /**
   * 获取不同类型弹窗的配置
   * @param {string} type - 弹窗类型
   * @returns {Object} 类型配置对象
   */
  getTypeConfig(type) {
    const configs = {
      info: {
        icon: 'fas fa-info-circle',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100 dark:bg-blue-900',
        buttonBg: 'bg-blue-500',
        buttonHover: 'hover:bg-blue-600'
      },
      success: {
        icon: 'fas fa-check-circle',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100 dark:bg-green-900',
        buttonBg: 'bg-green-500',
        buttonHover: 'hover:bg-green-600'
      },
      warning: {
        icon: 'fas fa-exclamation-triangle',
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900',
        buttonBg: 'bg-yellow-500',
        buttonHover: 'hover:bg-yellow-600'
      },
      error: {
        icon: 'fas fa-times-circle',
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100 dark:bg-red-900',
        buttonBg: 'bg-red-500',
        buttonHover: 'hover:bg-red-600'
      }
    };
    return configs[type] || configs.info;
  }

  /**
   * 转义HTML字符
   * @param {string} text - 要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 移除弹窗
   */
  remove() {
    if (this.overlay && this.overlay.parentNode) {
      // 添加退出动画
      this.overlay.style.animation = 'fade-out 0.3s ease-out forwards';
      this.modal.style.animation = 'scale-out 0.3s ease-out forwards';

      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
        this.modal = null;
      }, 300);
    }
  }
}

// 创建单例实例
const confirmInstance = new CustomConfirm();

/**
 * 全局确认弹窗函数
 * @param {Object|string} options - 配置选项或直接传入消息文本
 * @returns {Promise<boolean>} 用户选择结果
 */
export function showConfirm(options) {
  if (typeof options === 'string') {
    options = { message: options };
  }
  return confirmInstance.show(options);
}

/**
 * 创建新的确认弹窗实例
 * @returns {CustomConfirm} 新的确认弹窗实例
 */
export function createConfirm() {
  return new CustomConfirm();
}

// 默认导出
export default {
  CustomConfirm,
  showConfirm,
  createConfirm
};
