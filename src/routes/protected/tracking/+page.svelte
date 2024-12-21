<script lang="ts">
    import { auth } from '$lib/stores/authStore';
    import StockSearch from './stocksearch.svelte';
    import { stockDataStore, stockDataLoading, stockDataError, fetchStockData } from '$lib/stores/marketStore';
    import StockChart from '$lib/components/StockChart.svelte';
    
    let showChartModal = false;
    let selectedTicker = "";
    let selectedTickerName = "";
    let timeframe: '1d' | '1w' = '1w'; // 默认使用 1w

    async function handleStockFound(event: CustomEvent) {
        console.log("Stock found event received:", event.detail);
        const { ticker, name } = event.detail;
        selectedTicker = ticker;
        selectedTickerName = name;
        showChartModal = true;
        
        // 获取数据时使用当前的 timeframe
        await loadStockData(ticker);
    }

    async function loadStockData(ticker: string) {
        try {
            let endDate = new Date();
            let startDate = new Date();
            // 如果是周数据，获取更长时间范围
            if (timeframe === '1w') {
                startDate.setFullYear(startDate.getFullYear() - 3); // 获取5年数据
            } else {
                startDate.setFullYear(startDate.getFullYear() - 2); // 日数据获取2年
            }

            await fetchStockData(
                ticker,
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0],
                timeframe
            );
        } catch (error) {
            console.error("Error loading stock data:", error);
        }
    }

    async function toggleTimeframe() {
        timeframe = timeframe === '1d' ? '1w' : '1d';
        console.log("Timeframe changed to:", timeframe);
        
        // 切换时间周期时重新加载数据
        if (selectedTicker) {
            await loadStockData(selectedTicker);
        }
    }

    function closeModal() {
        showChartModal = false;
        selectedTicker = "";
        selectedTickerName = "";
    }

    // 添加反应式声明来调试状态变化
    $: console.log('Modal state changed:', showChartModal);
    $: if (showChartModal) {
        console.log('Selected ticker:', selectedTicker);
        console.log('Selected name:', selectedTickerName);
        console.log('Current timeframe:', timeframe);
    }
</script>

{#if $auth}
    <div class="container mx-auto p-4">
        <div class="max-w-6xl mx-auto">
            <!-- 搜索组件 -->
            <StockSearch on:stockFound={handleStockFound} />
            
            <!-- 图表模态框 -->
            {#if showChartModal}
                <div class="modal-container">
                    <!-- 遮罩层 -->
                    <div class="modal-overlay" on:click={closeModal}></div>
                    
                    <!-- 图表容器 -->
                    <div class="modal-content">
                      <div class="modal-header">
    <button 
        class="close-button-small"
        on:click={closeModal}
    >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
    <h3 class="modal-title">
        {selectedTickerName} ({selectedTicker}) - {timeframe === '1d' ? 'Daily' : 'Weekly'} View
    </h3>
    <div style="width: 16px;"></div>
</div>
    

                        <div class="modal-body">
                            {#if $stockDataLoading}
                                <div class="loading-state">
                                    <span>Loading chart data...</span>
                                </div>
                            {:else if $stockDataError}
                                <div class="error-state">
                                    Error loading chart data: {$stockDataError}
                                </div>
                            {:else if $stockDataStore && $stockDataStore.length > 0}
                                <div class="chart-container">
                                    <StockChart 
                                        stockData={$stockDataStore} 
                                        {timeframe}
                                    />
                                </div>
                            {/if}
                        </div>

                        <div class="modal-footer">
                            <button 
                                class="timeframe-button"
                                on:click={toggleTimeframe}
                                disabled={$stockDataLoading}
                            >
                                Switch to {timeframe === '1d' ? 'Weekly' : 'Daily'} View
                            </button>
                            <button 
                                class="close-button"
                                on:click={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}



<style>
    :global(body) {
        position: relative;
    }
    
    .modal-container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 9999 !important;
    }

    .modal-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.5) !important;
        z-index: 9998 !important;
    }

    .modal-content {
        position: relative !important;
        background: white !important;
        border-radius: 8px !important;
        width: 90% !important;
        max-width: 1200px !important;
        max-height: 90vh !important;
        z-index: 10000 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
    }

    .modal-header {
        padding: 0.5rem 0.75rem; /* 减小上下内边距 */
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
        min-height: 40px; /* 设置最小高度 */
    }

    .modal-title {
        font-size: 1rem; /* 减小字体大小 */
        font-weight: 500;
        color: #1a1a1a;
        text-align: center;
        flex: 1;
        margin: 0; /* 移除默认边距 */
        line-height: 1.2; /* 减小行高 */
    }

    .close-button-small {
        padding: 0.25rem;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
    }

    .close-button-small:hover {
        background: #e5e7eb;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .modal-header {
            padding: 0.375rem 0.5rem; /* 在移动端更紧凑 */
        }

        .modal-title {
            font-size: 0.875rem; /* 移动端更小的字体 */
        }

        .close-button-small {
            width: 20px;
            height: 20px;
        }
    }

    .modal-body {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        min-height: 400px;
        background: white;
    }

    .chart-container {
        height: 100%;
        min-height: 400px;
    }

    .modal-footer {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        background: #f8f9fa;
    }

    .close-button,
    .timeframe-button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: 1px solid #e5e7eb;
        background: white;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.875rem;
    }

    .close-button:hover,
    .timeframe-button:hover {
        background: #f3f4f6;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400px;
        color: #6b7280;
    }

    .error-state {
        color: #dc2626;
        padding: 1rem;
        text-align: center;
        background: #fee2e2;
        border-radius: 4px;
        margin: 1rem;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
        .modal-content {
            width: 95% !important;
            height: 80vh !important;
        }

        .modal-body {
            min-height: 300px;
        }

        .chart-container {
            min-height: 300px;
        }

        .modal-header {
            padding: 0.75rem;
        }

        .modal-title {
            font-size: 1rem;
        }

        .modal-footer {
            padding: 0.75rem;
        }

        .close-button,
        .timeframe-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
        }
    }

     .timeframe-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400px;
        color: #6b7280;
    }

    .error-state {
        color: #dc2626;
        padding: 1rem;
        text-align: center;
        background: #fee2e2;
        border-radius: 4px;
        margin: 1rem;
    }
</style>