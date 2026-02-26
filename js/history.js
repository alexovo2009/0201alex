/**
 * 茶飲店客戶流失風險評估器 - 歷史記錄功能
 * 提供歷史記錄的儲存、讀取、顯示和管理功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 歷史記錄數據結構
    const HistoryManager = {
        STORAGE_KEY: 'tea_insight_history',
        MAX_RECORDS: 100,
        currentPage: 1,
        recordsPerPage: 10,
        currentFilters: {
            search: '',
            riskLevel: 'all',
            timeRange: 'all'
        },

        /**
         * 初始化歷史記錄功能
         */
        init: function() {
            this.bindEventListeners();
            this.setupPageNavigation();
            this.loadHistory();
        },

        /**
         * 綁定事件監聽器
         */
        bindEventListeners: function() {
            // 清除全部歷史記錄按鈕
            const clearAllBtn = document.getElementById('clear-all-history');
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => this.clearAllHistory());
            }

            // 匯出歷史記錄按鈕
            const exportBtn = document.getElementById('export-history');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.exportHistory());
            }

            // 搜尋輸入框
            const searchInput = document.getElementById('history-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.currentFilters.search = e.target.value;
                    this.currentPage = 1;
                    this.loadHistory();
                });
            }

            // 風險等級篩選
            const riskFilter = document.getElementById('history-risk-filter');
            if (riskFilter) {
                riskFilter.addEventListener('change', (e) => {
                    this.currentFilters.riskLevel = e.target.value;
                    this.currentPage = 1;
                    this.loadHistory();
                });
            }

            // 時間範圍篩選
            const timeFilter = document.getElementById('history-time-filter');
            if (timeFilter) {
                timeFilter.addEventListener('change', (e) => {
                    this.currentFilters.timeRange = e.target.value;
                    this.currentPage = 1;
                    this.loadHistory();
                });
            }

            // 分頁按鈕
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('page-btn')) {
                    const page = parseInt(e.target.dataset.page);
                    if (!isNaN(page)) {
                        this.currentPage = page;
                        this.loadHistory();
                    }
                }
            });
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
            // 隱藏所有頁面
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.add('hidden');
            });

            // 顯示目標頁面
            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
            }

            // 更新導航連結狀態
            document.querySelectorAll('nav a[data-page]').forEach(link => {
                if (link.dataset.page === pageId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // 如果是歷史記錄頁面，重新載入數據
            if (pageId === 'history') {
                this.loadHistory();
            }
        },

        /**
         * 保存評估記錄
         * @param {Object} assessmentData - 評估數據
         */
        saveAssessment: function(assessmentData) {
            try {
                // 獲取現有歷史記錄
                const history = this.getHistory();
                
                // 創建新記錄
                const newRecord = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    timestamp: new Date().toISOString(),
                    customerName: assessmentData.customerName || '匿名客戶',
                    riskScore: assessmentData.riskScore || 0,
                    riskLevel: assessmentData.riskLevel || 'unknown',
                    factors: assessmentData.factors || [],
                    recommendations: assessmentData.recommendations || [],
                    formData: assessmentData.formData || {}
                };

                // 添加到歷史記錄開頭（最新的在最前面）
                history.unshift(newRecord);

                // 限制記錄數量
                if (history.length > this.MAX_RECORDS) {
                    history.splice(this.MAX_RECORDS);
                }

                // 保存到localStorage
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));

                // 顯示成功通知
                this.showNotification('評估記錄已保存', 'success');
                
                return newRecord;
            } catch (error) {
                console.error('保存評估記錄時發生錯誤:', error);
                this.showNotification('保存記錄時發生錯誤', 'error');
                return null;
            }
        },

        /**
         * 獲取所有歷史記錄
         */
        getHistory: function() {
            try {
                const historyJson = localStorage.getItem(this.STORAGE_KEY);
                return historyJson ? JSON.parse(historyJson) : [];
            } catch (error) {
                console.error('讀取歷史記錄時發生錯誤:', error);
                return [];
            }
        },

        /**
         * 載入並顯示歷史記錄
         */
        loadHistory: function() {
            try {
                const allRecords = this.getHistory();
                const filteredRecords = this.filterRecords(allRecords);
                const paginatedRecords = this.paginateRecords(filteredRecords);
                
                this.renderHistoryList(paginatedRecords);
                this.renderPagination(filteredRecords.length);
                this.updateRecordCount(filteredRecords.length);
            } catch (error) {
                console.error('載入歷史記錄時發生錯誤:', error);
                this.showNotification('載入歷史記錄時發生錯誤', 'error');
            }
        },

        /**
         * 篩選記錄
         */
        filterRecords: function(records) {
            return records.filter(record => {
                // 搜尋篩選
                if (this.currentFilters.search) {
                    const searchTerm = this.currentFilters.search.toLowerCase();
                    const customerName = record.customerName.toLowerCase();
                    if (!customerName.includes(searchTerm)) {
                        return false;
                    }
                }

                // 風險等級篩選
                if (this.currentFilters.riskLevel !== 'all') {
                    if (record.riskLevel !== this.currentFilters.riskLevel) {
                        return false;
                    }
                }

                // 時間範圍篩選
                if (this.currentFilters.timeRange !== 'all') {
                    const recordDate = new Date(record.timestamp);
                    const now = new Date();
                    let cutoffDate = new Date();

                    switch (this.currentFilters.timeRange) {
                        case 'today':
                            cutoffDate.setHours(0, 0, 0, 0);
                            break;
                        case 'week':
                            cutoffDate.setDate(now.getDate() - 7);
                            break;
                        case 'month':
                            cutoffDate.setMonth(now.getMonth() - 1);
                            break;
                        case 'year':
                            cutoffDate.setFullYear(now.getFullYear() - 1);
                            break;
                    }

                    if (recordDate < cutoffDate) {
                        return false;
                    }
                }

                return true;
            });
        },

        /**
         * 分頁記錄
         */
        paginateRecords: function(records) {
            const startIndex = (this.currentPage - 1) * this.recordsPerPage;
            const endIndex = startIndex + this.recordsPerPage;
            return records.slice(startIndex, endIndex);
        },

        /**
         * 渲染歷史記錄列表
         */
        renderHistoryList: function(records) {
            const historyList = document.getElementById('history-list');
            if (!historyList) return;

            if (records.length === 0) {
                historyList.innerHTML = `
                    <div class="text-center py-12 text-text-muted-light dark:text-text-muted-dark">
                        <div class="text-5xl mb-4">📋</div>
                        <h3 class="text-lg font-medium mb-2">尚無歷史記錄</h3>
                        <p class="text-sm opacity-75">進行風險評估後，記錄將顯示在這裡</p>
                    </div>
                `;
                return;
            }

            let html = '';
            records.forEach(record => {
                const date = new Date(record.timestamp);
                const formattedDate = date.toLocaleDateString('zh-Hant', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // 根據風險等級設置樣式
                let riskBadgeClass = '';
                let riskBadgeText = '';
                switch (record.riskLevel) {
                    case 'high':
                        riskBadgeClass = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
                        riskBadgeText = '高風險';
                        break;
                    case 'medium':
                        riskBadgeClass = 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50';
                        riskBadgeText = '中風險';
                        break;
                    case 'low':
                        riskBadgeClass = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
                        riskBadgeText = '低風險';
                        break;
                    default:
                        riskBadgeClass = 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
                        riskBadgeText = '未知';
                }

                html += `
                    <div class="bg-card-light rounded-lg border border-border-light p-5 hover:shadow-md transition-all duration-300 dark:bg-card-dark dark:border-border-dark group">
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div class="flex items-center gap-3">
                                <div class="size-10 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-light dark:bg-primary-light/20">
                                    <span class="text-lg">👤</span>
                                </div>
                                <div>
                                    <h4 class="font-bold text-text-primary-light dark:text-white">${record.customerName}</h4>
                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">${formattedDate}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${riskBadgeClass}">
                                    <span class="size-2 rounded-full ${record.riskLevel === 'high' ? 'bg-red-500' : record.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'}"></span>
                                    ${riskBadgeText}
                                </span>
                                <span class="text-2xl font-bold text-text-primary-light dark:text-white">${record.riskScore}%</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <h5 class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">主要風險因素</h5>
                                <div class="flex flex-wrap gap-2">
                                    ${record.factors.slice(0, 3).map(factor => `
                                        <span class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50">
                                            ⚠️ ${factor.title}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            <div>
                                <h5 class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">建議行動</h5>
                                <div class="flex flex-wrap gap-2">
                                    ${record.recommendations.slice(0, 2).map(rec => `
                                        <span class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-primary-light/10 text-primary-light border border-primary-light/20 dark:bg-primary-light/20 dark:text-primary-light dark:border-primary-light/30">
                                            💡 ${rec.title}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
                            <button class="view-details-btn text-sm text-primary-light font-medium hover:text-primary-dark transition-colors dark:text-primary-light dark:hover:text-primary-light/80"
                                    data-record-id="${record.id}">
                                查看詳細
                            </button>
                            <button class="delete-record-btn text-sm text-red-600 font-medium hover:text-red-800 transition-colors opacity-0 group-hover:opacity-100 dark:text-red-400 dark:hover:text-red-300"
                                    data-record-id="${record.id}">
                                刪除記錄
                            </button>
                        </div>
                    </div>
                `;
            });

            historyList.innerHTML = html;

            // 綁定詳細查看按鈕
            document.querySelectorAll('.view-details-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const recordId = e.target.dataset.recordId;
                    this.viewRecordDetails(recordId);
                });
            });

            // 綁定刪除記錄按鈕
            document.querySelectorAll('.delete-record-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const recordId = e.target.dataset.recordId;
                    this.deleteRecord(recordId);
                });
            });
        },

        /**
         * 渲染分頁控制
         */
        renderPagination: function(totalRecords) {
            const paginationContainer = document.getElementById('history-pagination');
            if (!paginationContainer) return;

            const totalPages = Math.ceil(totalRecords / this.recordsPerPage);

            if (totalPages <= 1) {
                paginationContainer.classList.add('hidden');
                return;
            }

            paginationContainer.classList.remove('hidden');

            // 生成分頁按鈕
            let pageButtons = '';
            const maxVisiblePages = 5;
            let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            // 上一頁按鈕
            pageButtons += `
                <button class="page-btn px-3 py-2 rounded-lg border border-border-light text-text-secondary-light hover:bg-card-light transition-colors dark:border-border-dark dark:text-text-secondary-dark dark:hover:bg-card-dark ${this.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                        data-page="${this.currentPage - 1}" ${this.currentPage === 1 ? 'disabled' : ''}>
                    上一頁
                </button>
            `;

            // 頁碼按鈕
            for (let i = startPage; i <= endPage; i++) {
                pageButtons += `
                    <button class="page-btn px-3 py-2 rounded-lg border ${this.currentPage === i ? 'bg-primary-light text-white border-primary-light' : 'border-border-light text-text-secondary-light hover:bg-card-light dark:border-border-dark dark:text-text-secondary-dark dark:hover:bg-card-dark'}"
                            data-page="${i}">
                        ${i}
                    </button>
                `;
            }

            // 下一頁按鈕
            pageButtons += `
                <button class="page-btn px-3 py-2 rounded-lg border border-border-light text-text-secondary-light hover:bg-card-light transition-colors dark:border-border-dark dark:text-text-secondary-dark dark:hover:bg-card-dark ${this.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                        data-page="${this.currentPage + 1}" ${this.currentPage === totalPages ? 'disabled' : ''}>
                    下一頁
                </button>
            `;

            document.querySelector('#history-pagination .flex.items-center.gap-2').innerHTML = pageButtons;

            // 更新頁面資訊
            const startRecord = (this.currentPage - 1) * this.recordsPerPage + 1;
            const endRecord = Math.min(this.currentPage * this.recordsPerPage, totalRecords);
            document.querySelector('#history-pagination .text-sm').textContent = 
                `顯示 ${startRecord}-${endRecord} 筆，共 ${totalRecords} 筆記錄`;
        },

        /**
         * 更新記錄數量顯示
         */
        updateRecordCount: function(count) {
            const countElement = document.querySelector('#page-history .text-3xl');
            if (countElement) {
                countElement.textContent = count;
            }
        },

        /**
         * 查看記錄詳細資訊
         */
        viewRecordDetails: function(recordId) {
            const history = this.getHistory();
            const record = history.find(r => r.id === recordId);
            
            if (!record) {
                this.showNotification('找不到該記錄', 'error');
                return;
            }

            const date = new Date(record.timestamp);
            const formattedDate = date.toLocaleDateString('zh-Hant', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // 創建詳細資訊彈窗
            let detailsHtml = `
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div class="bg-card-light rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-card-dark">
                        <div class="sticky top-0 bg-card-light dark:bg-card-dark p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                            <h3 class="text-xl font-bold text-text-primary-light dark:text-white">評估記錄詳細資訊</h3>
                            <button class="close-details-btn text-2xl text-text-secondary-light hover:text-text-primary-light dark:text-text-secondary-dark dark:hover:text-white">&times;</button>
                        </div>
                        
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div class="bg-card-light/50 rounded-lg p-4 border border-border-light dark:bg-card-dark/50 dark:border-border-dark">
                                    <h4 class="font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">客戶資訊</h4>
                                    <p class="text-lg font-bold text-text-primary-light dark:text-white">${record.customerName}</p>
                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">${formattedDate}</p>
                                </div>
                                
                                <div class="bg-card-light/50 rounded-lg p-4 border border-border-light dark:bg-card-dark/50 dark:border-border-dark">
                                    <h4 class="font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">風險評估結果</h4>
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <p class="text-3xl font-bold text-text-primary-light dark:text-white">${record.riskScore}%</p>
                                            <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark">風險分數</p>
                                        </div>
                                        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                                            record.riskLevel === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                            record.riskLevel === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                                            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        }">
                                            <span class="size-2 rounded-full ${
                                                record.riskLevel === 'high' ? 'bg-red-500' :
                                                record.riskLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                                            }"></span>
                                            ${record.riskLevel === 'high' ? '高風險' : record.riskLevel === 'medium' ? '中風險' : '低風險'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="space-y-6">
                                <div>
                                    <h4 class="font-bold text-lg text-text-primary-light dark:text-white mb-4 flex items-center gap-2">
                                        <span>⚠️</span> 風險因素分析
                                    </h4>
                                    <div class="space-y-3">
                                        ${record.factors.map(factor => `
                                            <div class="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100 dark:bg-red-900/20 dark:border-red-800/30">
                                                <div class="size-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                                    ⚠️
                                                </div>
                                                <div class="flex-1">
                                                    <h5 class="font-medium text-text-primary-light dark:text-white">${factor.title}</h5>
                                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">${factor.description}</p>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 class="font-bold text-lg text-text-primary-light dark:text-white mb-4 flex items-center gap-2">
                                        <span>💡</span> 行動建議
                                    </h4>
                                    <div class="space-y-3">
                                        ${record.recommendations.map(rec => `
                                            <div class="flex items-start gap-3 p-3 bg-primary-light/5 rounded-lg border border-primary-light/20 dark:bg-primary-light/10 dark:border-primary-light/30">
                                                <div class="size-8 rounded-full bg-primary-light/10 flex items-center justify-center text-primary-light dark:bg-primary-light/20 dark:text-primary-light">
                                                    💡
                                                </div>
                                                <div class="flex-1">
                                                    <h5 class="font-medium text-text-primary-light dark:text-white">${rec.title}</h5>
                                                    <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">${rec.description}</p>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 class="font-bold text-lg text-text-primary-light dark:text-white mb-4 flex items-center gap-2">
                                        <span>📋</span> 表單數據
                                    </h4>
                                    <div class="bg-card-light/50 rounded-lg p-4 border border-border-light dark:bg-card-dark/50 dark:border-border-dark">
                                        <pre class="text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap">${JSON.stringify(record.formData, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="sticky bottom-0 bg-card-light dark:bg-card-dark p-6 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                            <button class="delete-record-btn px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/30"
                                    data-record-id="${record.id}">
                                刪除此記錄
                            </button>
                            <button class="close-details-btn px-4 py-2 rounded-lg bg-primary-light text-white hover:bg-primary-dark transition-colors dark:bg-primary-light dark:hover:bg-primary-light/90">
                                關閉
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 添加彈窗到頁面
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = detailsHtml;
            document.body.appendChild(modalContainer.firstElementChild);

            // 綁定關閉按鈕事件
            document.querySelectorAll('.close-details-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.body.removeChild(modalContainer.firstElementChild);
                });
            });

            // 綁定刪除按鈕事件
            const deleteBtn = document.querySelector('.delete-record-btn[data-record-id]');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    if (confirm('確定要刪除此記錄嗎？此操作無法復原。')) {
                        this.deleteRecord(record.id);
                        document.body.removeChild(modalContainer.firstElementChild);
                    }
                });
            }
        },

        /**
         * 刪除單筆記錄
         */
        deleteRecord: function(recordId) {
            try {
                const history = this.getHistory();
                const filteredHistory = history.filter(record => record.id !== recordId);
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
                this.loadHistory();
                this.showNotification('記錄已刪除', 'success');
            } catch (error) {
                console.error('刪除記錄時發生錯誤:', error);
                this.showNotification('刪除記錄時發生錯誤', 'error');
            }
        },

        /**
         * 清除全部歷史記錄
         */
        clearAllHistory: function() {
            if (confirm('確定要清除所有歷史記錄嗎？此操作無法復原。')) {
                try {
                    localStorage.removeItem(this.STORAGE_KEY);
                    this.loadHistory();
                    this.showNotification('所有歷史記錄已清除', 'success');
                } catch (error) {
                    console.error('清除歷史記錄時發生錯誤:', error);
                    this.showNotification('清除歷史記錄時發生錯誤', 'error');
                }
            }
        },

        /**
         * 匯出歷史記錄
         */
        exportHistory: function() {
            try {
                const history = this.getHistory();
                if (history.length === 0) {
                    this.showNotification('沒有歷史記錄可匯出', 'warning');
                    return;
                }

                // 創建CSV內容
                let csvContent = '客戶名稱,風險分數,風險等級,評估時間,主要風險因素,建議行動\n';
                
                history.forEach(record => {
                    const date = new Date(record.timestamp);
                    const formattedDate = date.toLocaleDateString('zh-Hant', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const mainFactors = record.factors.slice(0, 2).map(f => f.title).join('; ');
                    const mainRecommendations = record.recommendations.slice(0, 2).map(r => r.title).join('; ');
                    
                    csvContent += `"${record.customerName}",${record.riskScore},"${record.riskLevel}","${formattedDate}","${mainFactors}","${mainRecommendations}"\n`;
                });

                // 創建下載連結
                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `茶飲店客戶流失風險評估記錄_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                this.showNotification('歷史記錄已匯出為CSV文件', 'success');
            } catch (error) {
                console.error('匯出歷史記錄時發生錯誤:', error);
                this.showNotification('匯出歷史記錄時發生錯誤', 'error');
            }
        },

        /**
         * 顯示通知
         */
        showNotification: function(message, type = 'info') {
            // 創建通知元素
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full opacity-0 ${
                type === 'success' ? 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' :
                type === 'error' ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' :
                type === 'warning' ? 'bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50' :
                'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
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

            // 添加到頁面
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

    // 初始化歷史記錄功能
    HistoryManager.init();

    // 暴露給全局對象
    window.TeaInsightHistory = HistoryManager;
};