// 茶言觀色 - 主題切換功能
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;
    
    // 檢查 localStorage 中的主題設定
    const savedTheme = localStorage.getItem('tea-insight-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 設定初始主題
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlElement.classList.remove('light');
        htmlElement.classList.add('dark');
        themeIcon.textContent = 'light_mode';
    } else {
        htmlElement.classList.remove('dark');
        htmlElement.classList.add('light');
        themeIcon.textContent = 'dark_mode';
    }
    
    // 主題切換功能
    themeToggle.addEventListener('click', function() {
        if (htmlElement.classList.contains('dark')) {
            // 切換到淺色模式
            htmlElement.classList.remove('dark');
            htmlElement.classList.add('light');
            themeIcon.textContent = 'dark_mode';
            localStorage.setItem('tea-insight-theme', 'light');
            
            // 添加切換動畫
            themeToggle.classList.add('theme-transition');
            setTimeout(() => {
                themeToggle.classList.remove('theme-transition');
            }, 300);
        } else {
            // 切換到深色模式
            htmlElement.classList.remove('light');
            htmlElement.classList.add('dark');
            themeIcon.textContent = 'light_mode';
            localStorage.setItem('tea-insight-theme', 'dark');
            
            // 添加切換動畫
            themeToggle.classList.add('theme-transition');
            setTimeout(() => {
                themeToggle.classList.remove('theme-transition');
            }, 300);
        }
        
        // 觸發自定義事件供其他組件使用
        const themeChangeEvent = new CustomEvent('themeChanged', {
            detail: { theme: htmlElement.classList.contains('dark') ? 'dark' : 'light' }
        });
        document.dispatchEvent(themeChangeEvent);
    });
    
    // 監聽系統主題變化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('tea-insight-theme')) {
            if (e.matches) {
                htmlElement.classList.remove('light');
                htmlElement.classList.add('dark');
                themeIcon.textContent = 'light_mode';
            } else {
                htmlElement.classList.remove('dark');
                htmlElement.classList.add('light');
                themeIcon.textContent = 'dark_mode';
            }
        }
    });
    
    // 主題相關工具函數
    window.TeaInsightTheme = {
        getCurrentTheme: function() {
            return htmlElement.classList.contains('dark') ? 'dark' : 'light';
        },
        
        setTheme: function(theme) {
            if (theme === 'dark') {
                htmlElement.classList.remove('light');
                htmlElement.classList.add('dark');
                themeIcon.textContent = 'light_mode';
                localStorage.setItem('tea-insight-theme', 'dark');
            } else {
                htmlElement.classList.remove('dark');
                htmlElement.classList.add('light');
                themeIcon.textContent = 'dark_mode';
                localStorage.setItem('tea-insight-theme', 'light');
            }
            
            // 觸發主題變化事件
            const themeChangeEvent = new CustomEvent('themeChanged', {
                detail: { theme: theme }
            });
            document.dispatchEvent(themeChangeEvent);
        },
        
        toggleTheme: function() {
            themeToggle.click();
        },
        
        isDarkMode: function() {
            return htmlElement.classList.contains('dark');
        }
    };
    
    console.log('茶言觀色主題系統已載入，當前主題:', window.TeaInsightTheme.getCurrentTheme());
});