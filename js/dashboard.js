// 茶言觀色 - 客戶流失風險評估器 儀表板功能
document.addEventListener('DOMContentLoaded', function() {
    // 表單元素
    const customerForm = document.getElementById('customer-form');
    const resetFormBtn = document.getElementById('reset-form');
    const evaluateRiskBtn = document.getElementById('evaluate-risk');
    
    // 風險評估元素
    const riskScoreElement = document.getElementById('risk-score');
    const riskLevelElement = document.getElementById('risk-level');
    const riskMeterElement = document.getElementById('risk-meter');
    const riskFactorsContainer = document.getElementById('risk-factors');
    
    // 表單輸入欄位
    const formInputs = {
        age: document.getElementById('age'),
        gender: document.getElementById('gender'),
        region: document.getElementById('region'),
        membershipMonths: document.getElementById('membership-months'),
        visitsPerMonth: document.getElementById('visits-per-month'),
        avgSpend: document.getElementById('avg-spend'),
        favoriteDrink: document.getElementById('favorite-drink'),
        appUsage: document.getElementById('app-usage'),
        totalSpend: document.getElementById('total-spend'),
        daysSinceLastVisit: document.getElementById('days-since-last-visit'),
        satisfaction: document.getElementById('satisfaction'),
        referrals: document.getElementById('referrals'),
        discountUsage: document.getElementById('discount-usage')
    };
    
    // 預設風險因子數據
    const defaultRiskFactors = [
        {
            icon: 'calendar_clock',
            title: '靜止帳戶',
            description: '距離上次到訪已超過 45 天 (平均: 7 天)',
            severity: 'high',
            color: 'red'
        },
        {
            icon: 'sentiment_dissatisfied',
            title: '滿意度下降',
            description: '最新回饋分數: 4/10',
            severity: 'medium',
            color: 'orange'
        },
        {
            icon: 'trending_down',
            title: '消費下滑',
            description: '月消費金額下降 30%',
            severity: 'low',
            color: 'yellow'
        }
    ];
    
    // 行動建議數據 - 根據風險等級動態生成
    const actionRecommendationsByRisk = {
        high: [
            {
                category: '緊急召回',
                title: '立即電話關懷',
                description: '店長親自致電了解客戶近況，表達關心並詢問是否有不滿意之處。',
                icon: 'phone_in_talk',
                priority: 1
            },
            {
                category: '專屬優惠',
                title: 'VIP 專屬禮遇',
                description: '提供買一送一優惠券，並附上店長親筆感謝卡。',
                icon: 'confirmation_number',
                priority: 2
            },
            {
                category: '深度分析',
                title: '消費模式分析',
                description: '分析客戶歷史訂單，找出偏好商品並量身打造推薦清單。',
                icon: 'analytics',
                priority: 3
            },
            {
                category: '升級服務',
                title: '免費升級體驗',
                description: '邀請客戶體驗新產品，並提供免費加料或升級服務。',
                icon: 'star',
                priority: 4
            }
        ],
        medium: [
            {
                category: '主動關懷',
                title: '簡訊問候關懷',
                description: '發送個性化簡訊，詢問最近消費體驗並提供小額優惠。',
                icon: 'sms',
                priority: 1
            },
            {
                category: '會員權益',
                title: '積分加倍活動',
                description: '告知客戶本月消費可獲得雙倍積分，加速升級會員等級。',
                icon: 'loyalty',
                priority: 2
            },
            {
                category: '新品推薦',
                title: '季節限定推薦',
                description: '推薦當季新品，並提供新品嘗鮮價 85 折優惠。',
                icon: 'new_releases',
                priority: 3
            },
            {
                category: '社群互動',
                title: '邀請參加活動',
                description: '邀請客戶參加店內舉辦的茶藝體驗活動或新品試飲會。',
                icon: 'groups',
                priority: 4
            }
        ],
        low: [
            {
                category: '忠誠獎勵',
                title: '感謝禮贈送',
                description: '贈送小點心或飲品兌換券，感謝客戶長期支持。',
                icon: 'card_giftcard',
                priority: 1
            },
            {
                category: '專屬預覽',
                title: '新品優先體驗',
                description: '提供新產品上市前的優先體驗機會，收集寶貴意見。',
                icon: 'visibility',
                priority: 2
            },
            {
                category: '推薦計畫',
                title: '推薦好友獎勵',
                description: '鼓勵推薦親友，成功推薦可獲得免費飲品券。',
                icon: 'group_add',
                priority: 3
            },
            {
                category: '滿意度調查',
                title: '意見回饋邀請',
                description: '邀請填寫簡短問卷，提供改進建議可獲小禮物。',
                icon: 'rate_review',
                priority: 4
            }
        ]
    };
    
    // 初始化函數
    function initDashboard() {
        // 載入預設數據
        renderRiskFactors(defaultRiskFactors);
        
        // 設定預設表單值（演示用）
        setDemoFormData();
        
        // 初始化行動建議（根據預設風險分數 78 = 高風險）
        renderActionRecommendations('high');
        
        // 綁定事件監聽器
        bindEventListeners();
        
        console.log('茶言觀色儀表板已初始化');
    }
    
    // 設定演示用表單數據
    function setDemoFormData() {
        formInputs.age.value = 28;
        formInputs.gender.value = 'female';
        formInputs.region.value = 'downtown';
        formInputs.membershipMonths.value = 12;
        formInputs.visitsPerMonth.value = 4;
        formInputs.avgSpend.value = 8.50;
        formInputs.favoriteDrink.value = 'matcha';
        formInputs.appUsage.value = 'weekly';
        formInputs.totalSpend.value = 204.00;
        formInputs.daysSinceLastVisit.value = 45;
        formInputs.satisfaction.value = 4;
        formInputs.referrals.value = 1;
        formInputs.discountUsage.value = 30;
    }
    
    // 綁定事件監聽器
    function bindEventListeners() {
        // 重置表單
        resetFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('確定要重置所有表單資料嗎？')) {
                customerForm.reset();
                setDemoFormData();
                showNotification('表單已重置為預設值', 'success');
            }
        });
        
        // 評估風險
        evaluateRiskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            evaluateRisk();
        });
        
        // 表單輸入即時驗證
        Object.values(formInputs).forEach(input => {
            if (input) {
                input.addEventListener('input', function() {
                    validateInput(this);
                });
                
                input.addEventListener('blur', function() {
                    validateInput(this);
                });
            }
        });
        
        // 主題變化時更新風險儀表板顏色
        document.addEventListener('themeChanged', function(e) {
            updateRiskMeterColor();
        });
    }
    
    // 驗證輸入欄位
    function validateInput(input) {
        const value = input.value.trim();
        const min = input.min ? parseInt(input.min) : null;
        const max = input.max ? parseInt(input.max) : null;
        
        // 清除之前的錯誤狀態
        input.classList.remove('border-red-500', 'border-green-500');
        
        if (input.required && !value) {
            input.classList.add('border-red-500');
            return false;
        }
        
        if (min !== null && value < min) {
            input.classList.add('border-red-500');
            return false;
        }
        
        if (max !== null && value > max) {
            input.classList.add('border-red-500');
            return false;
        }
        
        // 驗證通過
        if (value) {
            input.classList.add('border-green-500');
        }
        
        return true;
    }
    
    // 評估風險函數
    function evaluateRisk() {
        // 驗證所有表單欄位
        let isValid = true;
        Object.values(formInputs).forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showNotification('請檢查表單中的錯誤欄位', 'error');
            return;
        }
        
        // 顯示載入狀態
        evaluateRiskBtn.disabled = true;
        evaluateRiskBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> 計算中...';
        
        // 模擬 API 呼叫延遲
        setTimeout(() => {
            // 計算風險分數（基於表單數據）
            const riskScore = calculateRiskScore();
            
            // 更新風險顯示
            updateRiskDisplay(riskScore);
            
            // 生成風險因子
            const riskFactors = generateRiskFactors();
            renderRiskFactors(riskFactors);
            
            // 恢復按鈕狀態
            evaluateRiskBtn.disabled = false;
            evaluateRiskBtn.innerHTML = '<span class="material-symbols-outlined">analytics</span> 評估風險';
            
            // 顯示成功通知
            showNotification('風險評估完成！已更新風險分析', 'success');
            
            // 滾動到風險評估區域
            document.querySelector('.bg-card-light.rounded-xl').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 1500);
    }
    
    // 計算風險分數
    function calculateRiskScore() {
        let score = 50; // 基礎分數
        
        // 基於表單數據調整分數
        const age = parseInt(formInputs.age.value) || 30;
        const daysSinceLastVisit = parseInt(formInputs.daysSinceLastVisit.value) || 0;
        const satisfaction = parseInt(formInputs.satisfaction.value) || 5;
        const visitsPerMonth = parseInt(formInputs.visitsPerMonth.value) || 0;
        const totalSpend = parseFloat(formInputs.totalSpend.value) || 0;
        
        // 風險因子計算
        if (daysSinceLastVisit > 30) score += 20;
        if (daysSinceLastVisit > 60) score += 15;
        
        if (satisfaction < 5) score += 15;
        if (satisfaction < 3) score += 10;
        
        if (visitsPerMonth < 2) score += 10;
        if (totalSpend < 100) score += 5;
        
        if (age > 50) score -= 5;
        if (age < 25) score += 5;
        
        // 確保分數在 0-100 範圍內
        return Math.min(Math.max(score, 0), 100);
    }
    
    // 更新風險顯示
    function updateRiskDisplay(score) {
        // 更新分數顯示（帶動畫）
        riskScoreElement.classList.add('score-update');
        setTimeout(() => {
            riskScoreElement.textContent = Math.round(score);
            riskScoreElement.classList.remove('score-update');
        }, 250);
        
        // 更新風險等級
        let riskLevel, riskColor, riskTextColor, riskKey;
        if (score >= 70) {
            riskLevel = '高風險';
            riskColor = 'red';
            riskKey = 'high';
            riskTextColor = 'text-red-700 dark:text-red-400';
        } else if (score >= 40) {
            riskLevel = '中風險';
            riskColor = 'orange';
            riskKey = 'medium';
            riskTextColor = 'text-orange-700 dark:text-orange-400';
        } else {
            riskLevel = '低風險';
            riskColor = 'green';
            riskKey = 'low';
            riskTextColor = 'text-green-700 dark:text-green-400';
        }
        
        // 更新風險等級顯示
        riskLevelElement.innerHTML = `
            <span class="w-2 h-2 bg-${riskColor}-600 rounded-full animate-pulse dark:bg-${riskColor}-500 dark:shadow-[0_0_8px_rgba(var(--${riskColor}-500),0.6)]"></span>
            ${riskLevel}
        `;
        riskLevelElement.className = `inline-flex items-center gap-2 px-5 py-2 rounded-full bg-${riskColor}-50 border border-${riskColor}-100 ${riskTextColor} font-bold text-sm mb-8 shadow-sm dark:bg-${riskColor}-900/30 dark:border-${riskColor}-900/50`;
        
        // 更新風險儀表板
        updateRiskMeter(score, riskColor);
        
        // 更新行動建議
        renderActionRecommendations(riskKey);
    }
    
    // 更新風險儀表板
    function updateRiskMeter(score, color) {
        // 計算儀表板進度 (0-100 轉換為 0-283 的 stroke-dashoffset)
        const circumference = 283; // 2 * π * r (r=45)
        const progress = (score / 100) * circumference;
        const offset = circumference - progress;
        
        // 更新 SVG 屬性
        riskMeterElement.style.strokeDashoffset = offset;
        riskMeterElement.style.stroke = getComputedStyle(document.documentElement)
            .getPropertyValue(`--color-${color}-500`) || '#ef4444';
        
        // 添加動畫
        riskMeterElement.classList.add('progress-animate');
        setTimeout(() => {
            riskMeterElement.classList.remove('progress-animate');
        }, 1500);
    }
    
    // 更新風險儀表板顏色（基於主題）
    function updateRiskMeterColor() {
        const currentScore = parseInt(riskScoreElement.textContent) || 78;
        let riskColor = 'red';
        
        if (currentScore >= 70) riskColor = 'red';
        else if (currentScore >= 40) riskColor = 'orange';
        else riskColor = 'green';
        
        riskMeterElement.style.stroke = getComputedStyle(document.documentElement)
            .getPropertyValue(`--color-${riskColor}-500`) || '#ef4444';
    }
    
    // 生成風險因子
    function generateRiskFactors() {
        const factors = [];
        const score = parseInt(riskScoreElement.textContent) || 78;
        
        // 基於分數生成風險因子
        if (score >= 70) {
            factors.push({
                icon: 'calendar_clock',
                title: '靜止帳戶',
                description: `距離上次到訪已超過 ${formInputs.daysSinceLastVisit.value || 45} 天 (平均: 7 天)`,
                severity: 'high',
                color: 'red'
            });
            
            factors.push({
                icon: 'sentiment_dissatisfied',
                title: '滿意度下降',
                description: `最新回饋分數: ${formInputs.satisfaction.value || 4}/10`,
                severity: 'medium',
                color: 'orange'
            });
            
            factors.push({
                icon: 'trending_down',
                title: '消費下滑',
                description: '月消費金額下降 30%',
                severity: 'low',
                color: 'yellow'
            });
        } else if (score >= 40) {
            factors.push({
                icon: 'calendar_clock',
                title: '到訪頻率降低',
                description: `每月到訪次數: ${formInputs.visitsPerMonth.value || 2} 次 (平均: 4 次)`,
                severity: 'medium',
                color: 'orange'
            });
            
            factors.push({
                icon: 'local_offer',
                title: '優惠使用率低',
                description: `優惠使用率: ${formInputs.discountUsage.value || 30}%`,
                severity: 'low',
                color: 'yellow'
            });
        } else {
            factors.push({
                icon: 'thumb_up',
                title: '忠誠客戶',
                description: '客戶表現良好，維持現有策略即可',
                severity: 'low',
                color: 'green'
            });
        }
        
        return factors;
    }
    
    // 渲染風險因子
    function renderRiskFactors(factors) {
        riskFactorsContainer.innerHTML = '';
        
        factors.forEach(factor => {
            const factorElement = document.createElement('div');
            factorElement.className = `flex items-start gap-4 p-4 bg-${factor.color}-50/50 rounded-lg border border-${factor.color}-100 group hover:bg-${factor.color}-50 transition-colors risk-factor-card dark:bg-${factor.color}-900/20 dark:border-${factor.color}-800/30`;
            
            factorElement.innerHTML = `
                <div class="bg-white p-2 rounded-lg shadow-sm text-${factor.color}-500 dark:bg-transparent dark:text-${factor.color}-400">
                    <span class="material-symbols-outlined text-[20px]">${factor.icon}</span>
                </div>
                <div>
                    <p class="text-sm font-bold text-slate-900 dark:text-${factor.color}-200">${factor.title}</p>
                    <p class="text-xs text-slate-600 mt-1 dark:text-${factor.color}-300/70">${factor.description}</p>
                </div>
            `;
            
            riskFactorsContainer.appendChild(factorElement);
        });
    }
    
    // 渲染行動建議
    function renderActionRecommendations(riskKey) {
        const recommendations = actionRecommendationsByRisk[riskKey] || actionRecommendationsByRisk.high;
        const actionsContainer = document.querySelector('.space-y-4.flex-1');
        
        if (!actionsContainer) {
            console.error('找不到行動建議容器');
            return;
        }
        
        // 清空現有內容
        actionsContainer.innerHTML = '';
        
        // 只顯示前3個建議（按優先級排序）
        const sortedRecommendations = recommendations
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 3);
        
        sortedRecommendations.forEach((rec, index) => {
            const actionElement = document.createElement('div');
            actionElement.className = 'bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer group shadow-sm dark:bg-black/20 dark:backdrop-blur-sm dark:border-white/10 dark:hover:bg-black/30 action-card';
            actionElement.style.animationDelay = `${index * 100}ms`;
            actionElement.classList.add('fade-in');
            
            actionElement.innerHTML = `
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-bold uppercase tracking-widest bg-white text-primary-light px-2 py-1 rounded shadow-sm dark:text-xs dark:bg-white/20 dark:text-white">${rec.category}</span>
                    <span class="material-symbols-outlined text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all text-sm dark:group-hover:translate-x-0">${rec.icon || 'arrow_forward'}</span>
                </div>
                <h4 class="font-bold text-base leading-tight mb-2 text-white dark:text-lg">${rec.title}</h4>
                <p class="text-xs text-white/80 leading-relaxed dark:text-sm">${rec.description}</p>
            `;
            
            // 添加點擊事件
            actionElement.addEventListener('click', function() {
                showNotification(`已選擇「${rec.title}」行動建議`, 'success');
                
                // 添加視覺反饋
                this.classList.add('bg-white/30');
                setTimeout(() => {
                    this.classList.remove('bg-white/30');
                }, 300);
            });
            
            actionsContainer.appendChild(actionElement);
        });
        
        // 更新「應用所有操作」按鈕文字
        const applyButton = document.querySelector('button.bg-white.text-primary-light');
        if (applyButton) {
            applyButton.textContent = riskKey === 'high' ? '立即執行建議方案' :
                                     riskKey === 'medium' ? '應用建議方案' :
                                     '參考建議方案';
        }
    }
    
    // 顯示通知
    function showNotification(message, type = 'info') {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 顯示通知
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
            notification.classList.add('translate-x-0');
        }, 10);
        
        // 自動隱藏通知
        setTimeout(() => {
            notification.classList.remove('translate-x-0');
            notification.classList.add('translate-x-full');
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // 匯出功能供外部使用
    window.TeaInsightDashboard = {
        evaluateRisk: evaluateRisk,
        resetForm: function() {
            customerForm.reset();
            setDemoFormData();
            showNotification('表單已重置', 'success');
        },
        getFormData: function() {
            const data = {};
            Object.keys(formInputs).forEach(key => {
                data[key] = formInputs[key].value;
            });
            return data;
        },
        setFormData: function(data) {
            Object.keys(data).forEach(key => {
                if (formInputs[key]) {
                    formInputs[key].value = data[key];
                }
            });
        }
    };
    
    // 初始化儀表板
    initDashboard();
});