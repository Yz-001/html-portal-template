// 组件加载器
class ComponentLoader {
    constructor() {
        this.components = {};
        this.basePath = this.getBasePath();
    }

    // 获取基础路径
    getBasePath() {
        return window.location.pathname.includes('/pages/') ? '../' : './';
    }

    // 加载组件
    async loadComponent(name,path) {
        if (this.components[name]) {
            return this.components[name];
        }

        try {
            const response = await fetch(`${path}/${name}.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            this.components[name] = html;
            return html;
        } catch (error) {
            console.error(`Failed to load component: ${name}`, error);
            return `<div class="error">加载组件 ${name} 失败</div>`;
        }
    }

    // 渲染contgent页面内容到容器
    async renderContent(componentName, containerId) {
        const html = await this.loadComponent(componentName, `${this.basePath}/pages/contents`);
        const container = document.getElementById(containerId);
        if (container && html) {
            container.innerHTML = html;
            
            // 执行组件内的脚本
            this.executeScripts(container);
            
            // 初始化组件
            await this.initializeComponent(componentName, container);
        }
    }

    // 渲染components下公共组件到容器
    async renderComponent(componentName, containerId) {
        const html = await this.loadComponent(componentName, `${this.basePath}/components`);
        const container = document.getElementById(containerId);
        if (container && html) {
            container.innerHTML = html;
            
            // 执行组件内的脚本
            this.executeScripts(container);
            
            // 初始化组件
            await this.initializeComponent(componentName, container);
        }
    }

    // 执行组件内的脚本
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            document.body.appendChild(newScript);
        });
    }

    // 初始化组件特定逻辑
    async initializeComponent(name, container) {
        switch (name) {
            case 'navbar':
                await this.setActiveNavLink();
                break;
            case 'contact-content':
                // 联系表单的初始化在组件内部处理
                break;
        }
    }

    // 设置导航激活状态
    async setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'home.html';
        
        // 等待DOM更新
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            const isActive = 
                linkHref === currentPage || 
                (currentPage === 'home.html' && linkHref === '../home.html') ||
                (currentPage !== 'home.html' && linkHref.includes(currentPage));
            
            if (isActive) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 加载所有布局组件
    async loadAllGlobalComponents() {
        try {
            await Promise.all([
                this.renderComponent('navbar', 'navbar-container'),
                this.renderComponent('footer', 'footer-container')
            ]);
        } catch (error) {
            console.error('Failed to load layout components:', error);
        }
    }
}

// 创建全局实例
window.componentLoader = new ComponentLoader();