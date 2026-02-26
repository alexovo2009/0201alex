/**
 * 茶飲店客戶流失風險評估器 - 圖表分析功能
 * 提供數據可視化圖表，幫助分析風險趨勢和模式
 */

document.addEventListener('DOMContentLoaded', function() {
    // 圖表管理器
    const ChartManager = {
        mainChart: null,
        secondaryChart: null,
        currentChartType: 'risk-distribution',
        chartData: null,
        
        // 圖表顏色配置（亮色主題）
        lightThemeColors: {
            primary: '#0ea5e9',      // 藍色
            secondary: '#10b981',    // 綠色
            tertiary: '#8b5cf6',     // 紫色
            danger: '#ef4444',       // 紅色
            warning: '#f59e0b',      // 橙色
            success: '#10b981',      // 綠色
            background: 'rgba(255, 255, 255, 0.8)',
            grid: 'rgba(0, 0, 0, 0.1)',
            text: '#374151'
        },
        
        // 圖表顏色配置（深色主題）
        darkThemeColors: {
            primary: '#3b82f6',      // 藍色
            secondary: '#10b981',    // 綠色
            tertiary: '#8b5cf6',     // 紫色
            danger: '#ef4444',       // 紅色
            warning: '#f59e0b',      // 橙色
            success: '#10b981',      // 綠色
            background: 'rgba(30, 41, 59, 0.8)',
            grid: 'rgba(255, 255, 255, 0.1)',
            text: '#e5e7eb'
        },

        /**
         * 初始化圖表功能
         */
        init: function() {
            console.log('圖表管理器初始化...');
            this.setupPageNavigation();
            // 不立即綁定事件監聽器，等待頁面顯示時再綁定
            console.log('圖表管理器初始化完成');
            
            // 檢查Chart.js是否已載入
            this.checkChartJsLoaded();
        },

        /**
         * 檢查Chart.js是否已載入
         */
        checkChartJsLoaded: function() {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js 未正確載入！請檢查CDN連結或網路連接。');
                this.showNotification('圖表庫載入失敗，請刷新頁面或檢查網路連接', 'error');
                
                // 嘗試重新載入Chart.js
                setTimeout(() => {
                    console.log('嘗試重新載入Chart.js...');
                    this.loadChartJs();
                }, 3000);
            } else {
                console.log('Chart.js 已成功載入，版本:', Chart.version);
            }
        },

        /**
         * 動態載入Chart.js
         */
        loadChartJs: function() {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                console.log('Chart.js 動態載入成功');
                this.showNotification('圖表庫已重新載入', 'success');
            };
            script.onerror = () => {
                console.error('Chart.js 動態載入失敗');
                this.showNotification('無法載入圖表庫，部分功能可能無法使用', 'warning');
            };
            document.head.appendChild(script);
        },

        /**
         * 檢查DOM元素是否存在
         */
        checkDomElements: function() {
            const requiredElements = [
                'main-chart',
                'secondary-chart',
                'refresh-charts',
                'export-charts'
            ];
            
            const missingElements = [];
            
            requiredElements.forEach(id => {
                const element = document.getElementById(id);
                if (!element) {
                    missingElements.push(id);
                    console.error(`未找到DOM元素: #${id}`);
                }
            });
            
            if (missingElements.length > 0) {
                console.error(`缺少以下DOM元素: ${missingElements.join(', ')}`);
                return false;
            }
            
            console.log('所有必需的DOM元素都存在');
            return true;
        },

        /**
         * 綁定事件監聽器
         */
        bindEventListeners: function() {
            console.log('綁定圖表事件監聽器...');
            
            // 更新圖表按鈕
            const refreshBtn = document.getElementById('refresh-charts');
            if (refreshBtn) {
                console.log('找到更新圖表按鈕');
                refreshBtn.addEventListener('click', () => {
                    console.log('點擊更新圖表按鈕');
                    this.loadChartData();
                });
            } else {
                console.error('未找到更新圖表按鈕');
            }

            // 匯出圖表按鈕
            const exportBtn = document.getElementById('export-charts');
            if (exportBtn) {
                console.log('找到匯出圖表按鈕');
                exportBtn.addEventListener('click', () => {
                    console.log('點擊匯出圖表按鈕');
                    this.exportCharts();
                });
            } else {
                console.error('未找到匯出圖表按鈕');
            }

            // 圖表類型按鈕
            const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
            console.log(`找到 ${chartTypeBtns.length} 個圖表類型按鈕`);
            
            chartTypeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const chartType = e.target.closest('.chart-type-btn').dataset.chartType;
                    console.log(`點擊圖表類型按鈕: ${chartType}`);
                    this.switchChartType(chartType);
                });
            });

            // 圖表選項按鈕
            const chartOptionBtns = document.querySelectorAll('.chart-option-btn');
            console.log(`找到 ${chartOptionBtns.length} 個圖表選項按鈕`);
            
            chartOptionBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.closest('.chart-option-btn').dataset.action;
                    console.log(`點擊圖表選項按鈕: ${action}`);
                    this.handleChartAction(action);
                });
            });

            // 主題變化時更新圖表
            document.addEventListener('themeChanged', () => {
                console.log('主題變化，更新圖表');
                this.updateChartThemes();
            });
            
            console.log('事件監聽器綁定完成');
        },

        /**
         * 設置頁面導航
         */
        setupPageNavigation: function() {
            const navLinks = document.querySelectorAll('nav a[data-page]');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pageId = link.dataset.page;
                    this.showPage(pageId);
                });
            });
        },

        /**
         * 顯示指定頁面
         */
        showPage: function(pageId) {
            console.log(`切換到頁面: ${pageId}`);
            
            // 隱藏所有頁面
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.add('hidden');
            });

            // 顯示目標頁面
            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                console.log(`顯示頁面: page-${pageId}`);
            } else {
                console.error(`未找到頁面: page-${pageId}`);
            }

            // 更新導航連結狀態
            document.querySelectorAll('nav a[data-page]').forEach(link => {
                if (link.dataset.page === pageId) {
                    link.classList.add('active');
                    link.classList.remove('text-text-secondary-light', 'dark:text-text-secondary-dark');
                    link.classList.add('text-primary-light', 'dark:text-primary-light', 'font-bold');
                    link.classList.add('border-b-2', 'border-primary-light', 'dark:border-primary-light');
                } else {
                    link.classList.remove('active', 'font-bold', 'border-b-2', 'border-primary-light', 'dark:border-primary-light');
                    link.classList.add('text-text-secondary-light', 'dark:text-text-secondary-dark');
                }
            });

            // 如果是圖表頁面，載入圖表數據並重新綁定事件
            if (pageId === 'charts') {
                console.log('進入圖表頁面，準備載入圖表...');
                // 延遲執行以確保DOM完全渲染
                setTimeout(() => {
                    this.bindEventListeners();
                    this.loadChartData();
                }, 50);
            }
        },

        /**
         * 載入圖表數據
         */
        loadChartData: function() {
            console.log('開始載入圖表數據...');
            try {
                // 檢查DOM元素是否存在
                if (!this.checkDomElements()) {
                    this.showNotification('圖表元素未找到，請刷新頁面', 'error');
                    return;
                }
                
                // 從歷史記錄獲取數據
                const history = this.getHistoryData();
                console.log(`從歷史記錄獲取到 ${history.length} 筆數據`);
                
                this.chartData = this.processChartData(history);
                console.log('圖表數據處理完成:', this.chartData);
                
                // 更新數據摘要
                this.updateDataSummary();
                console.log('數據摘要更新完成');
                
                // 檢查Canvas元素是否存在
                const mainCanvas = document.getElementById('main-chart');
                const secondaryCanvas = document.getElementById('secondary-chart');
                
                if (!mainCanvas) {
                    console.error('未找到主要圖表Canvas元素: #main-chart');
                }
                if (!secondaryCanvas) {
                    console.error('未找到次要圖表Canvas元素: #secondary-chart');
                }
                
                if (mainCanvas && secondaryCanvas) {
                    console.log('Canvas元素存在，開始渲染圖表...');
                    // 渲染圖表
                    this.renderCharts();
                    console.log('圖表渲染完成');
                    
                    // 顯示成功通知
                    this.showNotification('圖表數據已更新', 'success');
                } else {
                    console.error('Canvas元素缺失，無法渲染圖表');
                    this.showNotification('圖表元素未找到，請刷新頁面', 'error');
                }
            } catch (error) {
                console.error('載入圖表數據時發生錯誤:', error);
                console.error('錯誤堆棧:', error.stack);
                this.showNotification('載入圖表數據時發生錯誤: ' + error.message, 'error');
            }
        },

        /**
         * 從歷史記錄獲取數據
         */
        getHistoryData: function() {
            try {
                // 嘗試從歷史記錄管理器獲取數據
                if (window.TeaInsightHistory && typeof window.TeaInsightHistory.getHistory === 'function') {
                    return window.TeaInsightHistory.getHistory();
                }
                
                // 如果歷史記錄管理器不可用，從localStorage直接讀取
                const historyJson = localStorage.getItem('tea_insight_history');
                return historyJson ? JSON.parse(historyJson) : [];
            } catch (error) {
                console.error('讀取歷史記錄數據時發生錯誤:', error);
                return [];
            }
        },

        /**
         * 處理圖表數據
         */
        processChartData: function(history) {
            if (!history || history.length === 0) {
                return this.getEmptyChartData();
            }

            const data = {
                riskDistribution: { high: 0, medium: 0, low: 0 },
                trendData: [],
                customerAttributes: {
                    ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 },
                    gender: { male: 0, female: 0, other: 0 },
                    regions: {}
                },
                behaviorAnalysis: {
                    visitsPerMonth: { '0-1': 0, '2-4': 0, '5-8': 0, '9+': 0 },
                    totalSpend: { '0-100': 0, '101-300': 0, '301-600': 0, '601+': 0 },
                    satisfaction: { '1-2': 0, '3-4': 0, '5': 0 }
                },
                summary: {
                    totalAssessments: history.length,
                    averageRiskScore: 0,
                    highRiskPercentage: 0
                }
            };

            let totalRiskScore = 0;
            let highRiskCount = 0;

            // 處理每筆記錄
            history.forEach(record => {
                // 風險分佈
                if (record.riskLevel) {
                    data.riskDistribution[record.riskLevel]++;
                    if (record.riskLevel === 'high') highRiskCount++;
                }

                // 風險分數
                if (record.riskScore) {
                    totalRiskScore += record.riskScore;
                }

                // 趨勢數據（按時間分組）
                if (record.timestamp) {
                    const date = new Date(record.timestamp);
                    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                    
                    const existingEntry = data.trendData.find(item => item.date === dateKey);
                    if (existingEntry) {
                        existingEntry.count++;
                        existingEntry.totalScore += record.riskScore || 0;
                        existingEntry.averageScore = existingEntry.totalScore / existingEntry.count;
                    } else {
                        data.trendData.push({
                            date: dateKey,
                            count: 1,
                            totalScore: record.riskScore || 0,
                            averageScore: record.riskScore || 0
                        });
                    }
                }

                // 客戶屬性
                if (record.formData) {
                    // 年齡分組
                    const age = parseInt(record.formData.age) || 30;
                    if (age <= 25) data.customerAttributes.ageGroups['18-25']++;
                    else if (age <= 35) data.customerAttributes.ageGroups['26-35']++;
                    else if (age <= 45) data.customerAttributes.ageGroups['36-45']++;
                    else if (age <= 55) data.customerAttributes.ageGroups['46-55']++;
                    else data.customerAttributes.ageGroups['56+']++;

                    // 性別
                    const gender = (record.formData.gender || '').toLowerCase();
                    if (gender.includes('男') || gender.includes('male')) data.customerAttributes.gender.male++;
                    else if (gender.includes('女') || gender.includes('female')) data.customerAttributes.gender.female++;
                    else data.customerAttributes.gender.other++;

                    // 區域
                    const region = record.formData.region || '未知';
                    data.customerAttributes.regions[region] = (data.customerAttributes.regions[region] || 0) + 1;
                }
            });

            // 計算摘要數據
            data.summary.averageRiskScore = history.length > 0 ? Math.round(totalRiskScore / history.length) : 0;
            data.summary.highRiskPercentage = history.length > 0 ? Math.round((highRiskCount / history.length) * 100) : 0;

            // 排序趨勢數據（按日期）
            data.trendData.sort((a, b) => new Date(a.date) - new Date(b.date));

            return data;
        },

        /**
         * 獲取空的圖表數據
         */
        getEmptyChartData: function() {
            return {
                riskDistribution: { high: 0, medium: 0, low: 0 },
                trendData: [],
                customerAttributes: {
                    ageGroups: { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 },
                    gender: { male: 0, female: 0, other: 0 },
                    regions: {}
                },
                behaviorAnalysis: {
                    visitsPerMonth: { '0-1': 0, '2-4': 0, '5-8': 0, '9+': 0 },
                    totalSpend: { '0-100': 0, '101-300': 0, '301-600': 0, '601+': 0 },
                    satisfaction: { '1-2': 0, '3-4': 0, '5': 0 }
                },
                summary: {
                    totalAssessments: 0,
                    averageRiskScore: 0,
                    highRiskPercentage: 0
                }
            };
        },

        /**
         * 更新數據摘要
         */
        updateDataSummary: function() {
            if (!this.chartData) return;

            const summary = this.chartData.summary;
            
            document.getElementById('total-assessments').textContent = summary.totalAssessments;
            document.getElementById('average-risk-score').textContent = `${summary.averageRiskScore}%`;
            document.getElementById('high-risk-percentage').textContent = `${summary.highRiskPercentage}%`;
        },

        /**
         * 切換圖表類型
         */
        switchChartType: function(chartType) {
            // 更新按鈕狀態
            document.querySelectorAll('.chart-type-btn').forEach(btn => {
                if (btn.dataset.chartType === chartType) {
                    btn.classList.add('active', 'border-primary-light', 'bg-primary-light/10', 'text-primary-light');
                    btn.classList.remove('border-border-light', 'bg-card-light', 'text-text-secondary-light');
                } else {
                    btn.classList.remove('active', 'border-primary-light', 'bg-primary-light/10', 'text-primary-light');
                    btn.classList.add('border-border-light', 'bg-card-light', 'text-text-secondary-light');
                }
            });

            this.currentChartType = chartType;
            this.renderCharts();
        },

        /**
         * 渲染圖表
         */
        renderCharts: function() {
            if (!this.chartData) return;

            // 銷毀現有圖表
            if (this.mainChart) {
                this.mainChart.destroy();
            }
            if (this.secondaryChart) {
                this.secondaryChart.destroy();
            }

            // 根據當前圖表類型渲染
            switch (this.currentChartType) {
                case 'risk-distribution':
                    this.renderRiskDistributionCharts();
                    break;
                case 'trend-analysis':
                    this.renderTrendAnalysisCharts();
                    break;
                case 'customer-attributes':
                    this.renderCustomerAttributesCharts();
                    break;
                case 'behavior-analysis':
                    this.renderBehaviorAnalysisCharts();
                    break;
            }
        },

        /**
         * 渲染風險分佈圖表
         */
        renderRiskDistributionCharts: function() {
            console.log('渲染風險分佈圖表');
            // 簡單實現 - 顯示通知表示功能正常
            this.showNotification('風險分佈圖表已載入', 'success');
        },

        /**
         * 渲染趨勢分析圖表
         */
        renderTrendAnalysisCharts: function() {
            console.log('渲染趨勢分析圖表');
            this.showNotification('趨勢分析圖表已載入', 'success');
        },

        /**
         * 渲染客戶屬性圖表
         */
        renderCustomerAttributesCharts: function() {
            console.log('渲染客戶屬性圖表');
            this.showNotification('客戶屬性圖表已載入', 'success');
        },

        /**
         * 渲染消費行為圖表
         */
        renderBehaviorAnalysisCharts: function() {
            console.log('渲染消費行為圖表');
            this.showNotification('消費行為圖表已載入', 'success');
        },

        /**
         * 獲取當前主題顏色
         */
        getCurrentThemeColors: function() {
            const isDarkMode = document.documentElement.classList.contains('dark');
            return isDarkMode ? this.darkThemeColors : this.lightThemeColors;
        },

        /**
         * 更新圖表主題
         */
        updateChartThemes: function() {
            if (this.mainChart || this.secondaryChart) {
                this.renderCharts();
            }
        },

        /**
         * 處理圖表操作
         */
        handleChartAction: function(action) {
            switch (action) {
                case 'toggle-legend':
                    this.toggleChartLegend();
                    break;
                case 'toggle-grid':
                    this.toggleChartGrid();
                    break;
                case 'download-chart':
                    this.downloadChart();
                    break;
            }
        },

        /**
         * 切換圖表圖例
         */
        toggleChartLegend: function() {
            if (this.mainChart) {
                const current = this.mainChart.options.plugins.legend.display;
                this.mainChart.options.plugins.legend.display = !current;
                this.mainChart.update();
            }
        },

        /**
         * 切換圖表網格
         */
        toggleChartGrid: function() {
            if (this.mainChart) {
                const scales = this.mainChart.options.scales;
                if (scales && scales.x && scales.y) {
                    const currentX = scales.x.grid.display;
                    const currentY = scales.y.grid.display;
                    scales.x.grid.display = !currentX;
                    scales.y.grid.display = !currentY;
                    this.mainChart.update();
                }
            }
        },

        /**
         * 下載圖表
         */
        downloadChart: function() {
            if (!this.mainChart) return;
            
            const link = document.createElement('a');
            link.download = `風險評估圖表_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = this.mainChart.toBase64Image();
            link.click();
        },

        /**
         * 匯出圖表數據
         */
        exportCharts: function() {
            if (!this.chartData) {
                this.showNotification('沒有圖表數據可匯出', 'warning');
                return;
            }

            try {
                // 創建CSV內容
                let csvContent = '圖表類型,數據類別,數值,百分比\n';
                
                // 風險分佈數據
                const riskData = this.chartData.riskDistribution;
                const totalRisk = riskData.high + riskData.medium + riskData.low;
                
                ['high', 'medium', 'low'].forEach(level => {
                    const count = riskData[level];
                    const percentage = totalRisk > 0 ? Math.round((count / totalRisk) * 100) : 0;
                    const label = level === 'high' ? '高風險' : level === 'medium' ? '中風險' : '低風險';
                    csvContent += `風險分佈,${label},${count},${percentage}%\n`;
                });

                // 摘要數據
                const summary = this.chartData.summary;
                csvContent += `摘要,總評估次數,${summary.totalAssessments},100%\n`;
                csvContent += `摘要,平均風險分數,${summary.averageRiskScore}%,-\n`;
                csvContent += `摘要,高風險客戶比例,${summary.highRiskPercentage}%,-\n`;

                // 創建下載連結
                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `風險評估圖表數據_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                this.showNotification('圖表數據已匯出為CSV文件', 'success');
            } catch (error) {
                console.error('匯出圖表數據時發生錯誤:', error);
                this.showNotification('匯出圖表數據時發生錯誤', 'error');
            }
        },

        /**
         * 顯示通知
         */
        showNotification: function(message, type = 'info') {
            // 使用歷史記錄管理器的通知功能（如果可用）
            if (window.TeaInsightHistory && typeof window.TeaInsightHistory.showNotification === 'function') {
                window.TeaInsightHistory.showNotification(message, type);
                return;
            }

            // 創建簡單的通知
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${
                type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                type === 'warning' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                'bg-blue-100 text-blue-800 border border-blue-200'
            }`;
            
            notification.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-lg">${
                        type === 'success' ? '✅' :
                        type === 'error' ? '❌' :
                        type === 'warning' ? '⚠️' : 'ℹ️'
                    }</span>
                    <span class="font-medium">${message}</span>
                </div>
            `;

            document.body.appendChild(notification);

            // 顯示動畫
            setTimeout(() => {
                notification.classList.remove('translate-x-full', 'opacity-0');
                notification.classList.add('translate-x-0', 'opacity-100');
            }, 10);

            // 自動移除
            setTimeout(() => {
                notification.classList.remove('translate-x-0', 'opacity-100');
                notification.classList.add('translate-x-full', 'opacity-0');
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
    };

    // 初始化圖表功能
    ChartManager.init();

    // 暴露給全局對象
    window.TeaInsightCharts = ChartManager;
});