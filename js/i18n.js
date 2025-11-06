// 语言配置
const I18N_CONFIG = {
    defaultLang: 'zh-CN',
    supportedLangs: ['zh-CN', 'en-US'],
    storageKey: 'portal_language'
};

// 语言数据存储
let translations = {};

// 初始化语言系统
async function initI18n() {
    const savedLang = localStorage.getItem(I18N_CONFIG.storageKey);
    const currentLang = savedLang || I18N_CONFIG.defaultLang;
    
    await loadLanguage(currentLang);
    applyTranslations(currentLang);
    setupLanguageSwitcher();
    
    console.log('i18n initialized with language:', currentLang);
}

// 加载语言文件
async function loadLanguage(lang) {
    try {
        const basePath = window.location.pathname.includes('/pages/') ? '../' : './';
        const response = await fetch(`${basePath}locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations[lang] = await response.json();
        return true;
    } catch (error) {
        console.error(`Failed to load language: ${lang}`, error);
        if (lang !== I18N_CONFIG.defaultLang) {
            return loadLanguage(I18N_CONFIG.defaultLang);
        }
        return false;
    }
}

// 应用翻译到页面
function applyTranslations(lang) {
    if (!translations[lang]) {
        console.warn(`No translations found for language: ${lang}`);
        return;
    }
    
    // 更新html lang属性
    document.documentElement.lang = lang;
    
    // 翻译文本内容
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(translations[lang], key);
        
        if (translation && typeof translation === 'string') {
            element.textContent = translation;
        }
    });
    
    // 翻译placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = getTranslation(translations[lang], key);
        
        if (translation && typeof translation === 'string') {
            element.placeholder = translation;
        }
    });
    
    // 更新页面标题
    const titleElement = document.querySelector('title');
    if (titleElement) {
        const titleKey = titleElement.getAttribute('data-i18n');
        if (titleKey) {
            const titleTranslation = getTranslation(translations[lang], titleKey);
            if (titleTranslation && typeof titleTranslation === 'string') {
                document.title = titleTranslation;
            }
        }
    }
    
    // 保存当前语言
    localStorage.setItem(I18N_CONFIG.storageKey, lang);
    console.log(`Language switched to: ${lang}`);
}

// 获取嵌套的翻译值
function getTranslation(obj, key) {
    if (!obj || !key) return null;
    return key.split('.').reduce((o, i) => o?.[i], obj) || null;
}

// 切换语言
async function changeLanguage(lang) {
    if (!I18N_CONFIG.supportedLangs.includes(lang)) {
        console.warn(`Unsupported language: ${lang}`);
        return;
    }
    
    if (!translations[lang]) {
        await loadLanguage(lang);
    }
    
    applyTranslations(lang);
}

// 设置语言切换器事件
function setupLanguageSwitcher() {
    document.addEventListener('click', function(e) {
        if (e.target.hasAttribute('data-lang-switch')) {
            const lang = e.target.getAttribute('data-lang-switch');
            changeLanguage(lang);
        }
    });
}

// 获取当前语言
function getCurrentLanguage() {
    return localStorage.getItem(I18N_CONFIG.storageKey) || I18N_CONFIG.defaultLang;
}

// 导出到全局作用域
window.changeLanguage = changeLanguage;
window.getCurrentLanguage = getCurrentLanguage;
window.initI18n = initI18n;