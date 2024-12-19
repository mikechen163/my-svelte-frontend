<script lang="ts">
    import { auth } from '$lib/stores/authStore';
    import { Button } from "$lib/components/ui/button";
    import { Card } from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    //import { marketStore, loading, error, fetchMarketData } from '$lib/stores/marketStore';
    //import { stocks, fetchStocks } from '$lib/stores/stockStore';
	//  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";

    // Add these imports at the top with other imports
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "$lib/components/ui/dialog";
    import { marketStore, loading, error, fetchMarketData, stockDataStore, stockDataLoading, stockDataError, fetchStockData } from '$lib/stores/marketStore';
    import StockChart from '$lib/components/StockChart.svelte';

    // Add state variables for chart
    let chartInitialized = false;
    let showChartModal = false;


    // State variables for UI control
    let showInputInterface = true;
    let currentPage = 1;
    let showTable = false;

    // Modal control
  
    let chartImageToShow: string | null = null;
    let selectedTickerName:string | null = null;

    // Market Query Parameters
    let filterParams = {
        filter_object: "Return Rate",
        return: -100,
        max_return: 1000,
        min_market_cap: 10,
        min_turnover_rate: 0,
        max_turnover_rate: 100,
        market: "SH,SZ",
        date: new Date().toISOString().split('T')[0],
        sort: "Total Market Cap",
        sort_direction: 'Desc' as 'Asc' | 'Desc',
        force_refresh: "0"
    };

    // Chart Parameters
    let selectedTicker = "";
    let timeframe: '1d' | '1w' = '1w'; // Default timeframe to 1w
    let chartStartDate = new Date();
    chartStartDate.setFullYear(chartStartDate.getFullYear() - 2);
    let chartDateString = chartStartDate.toISOString().split('T')[0];

    // Filter Options
    const filterObjects = [
        "Return Rate",
        "10-Day Return Rate",
        "YTD Return Rate",
        "30-Day Return Rate",
        "90-Day Return Rate",
        "1-Year Return Rate"
    ];

    const markets = ["SH", "SZ", "HK", "US"];

    const sortOptions = [
        "Return Rate",
        "Turnover Rate",
        "Amount",
        "Total Market Cap",
        "Free Market Cap",
        "YTD Return Rate",
        "10-Day Return Rate",
        "30-Day Return Rate",
        "90-Day Return Rate",
        "1-Year Return Rate"
    ];

    async function handleQuery() {
        await fetchMarketData(filterParams, filterParams.sort, filterParams.sort_direction, currentPage);
        showInputInterface = false;
        showTable = true;
    }

    function showHome() {
        showInputInterface = true;
        selectedTicker = "";
        showTable = false;
    }

    type Ticker = string;

// 定义转换函数
function modifyTicker(ticker: Ticker): Ticker {
    let modifiedTicker: Ticker = ticker;

    if (ticker.length === 7 && ticker.startsWith('hk')) {
        modifiedTicker = ticker.slice(3) + '.HK'; // 截取后4位并添加 .HK
    } else if (ticker.length === 6 && /^\d+$/.test(ticker)) { // 6位数字
        if (ticker.startsWith('6')) {
            modifiedTicker = ticker + '.SS'; // 上海证券
        } else {
            modifiedTicker = ticker + '.SZ'; // 深圳证券
        }
    }

    return modifiedTicker;
}



async function handleTickerClick(ticker: string, name: string) {
        let modifiedTicker = modifyTicker(ticker);
        selectedTicker = modifiedTicker;
        selectedTickerName = name;
        showChartModal = true;

        let endDate = new Date();
        let startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 2);
        
        await fetchStockData(
            modifiedTicker, 
            startDate.toISOString().split('T')[0], 
            endDate.toISOString().split('T')[0],
            timeframe  // Pass the timeframe parameter
        );
    }

    // Add watch for timeframe changes
    $: if (showChartModal && selectedTicker) {
        let endDate = new Date();
        let startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 2);
        
        fetchStockData(
            selectedTicker,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            timeframe
        );
    }

    async function handlePageChange(direction: 'next' | 'prev') {
        if (direction === 'next' && currentPage < $marketStore.pagination.total_pages) {
            currentPage++;
        } else if (direction === 'prev' && currentPage > 1) {
            currentPage--;
        }
        await fetchMarketData(filterParams, filterParams.sort, filterParams.sort_direction, currentPage);
    }


  

     function closeModal() {
        showChartModal = false;
        chartImageToShow = null;
        selectedTickerName = null;
    }


    function toggleTimeframe() {
        timeframe = timeframe === '1d' ? '1w' : '1d';
        if (selectedTicker) {
            handleTickerClick(selectedTicker, selectedTickerName || '');
        }
    }

  
</script>

{#if $auth}
<div class="container mx-auto p-4">


 <!-- 在模态框内容部分 -->

   {#if showChartModal}
    <div class="modal-container">
        <!-- 遮罩层 -->
        <div class="modal-overlay" on:click={() => showChartModal = false}></div>
        
        <!-- 固定的图表容器 -->
        <div class="modal-content">
            <!-- 标题栏 -->
            <div class="modal-header">
                <h3 class="modal-title">
                    {selectedTickerName} ({selectedTicker})
                </h3>
                <button 
                    class="close-button"
                    on:click={() => showChartModal = false}
                >
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- 图表内容 -->
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
                            timeframe={timeframe}
                        />
                    </div>
                {/if}
            </div>

            <!-- 底部按钮 -->
            <div class="modal-footer">
                <button 
                    class="timeframe-button"
                    on:click={() => timeframe = timeframe === '1d' ? '1w' : '1d'}
                >
                    Toggle {timeframe === '1d' ? 'Weekly' : 'Daily'} View
                </button>
                <button 
                    class="close-button"
                    on:click={() => showChartModal = false}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

    {#if showInputInterface}
        <Card class="w-full max-w-6xl mx-auto mb-6">
            <div class="p-6">
                <h1 class="text-2xl font-bold mb-6">Market Query</h1>

                <form class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" on:submit|preventDefault={handleQuery}>
                    <div class="space-y-2">
                        <label for="filter-object">Filter Object</label>
                        <select
                            id="filter-object"
                            class="w-full px-3 py-2 border rounded-md"
                            bind:value={filterParams.filter_object}
                        >
                            {#each filterObjects as option}
                                <option value={option}>{option}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label for="market">Market</label>
                        <select
                            id="market"
                            class="w-full px-3 py-2 border rounded-md"
                            bind:value={filterParams.market}
                        >
                            {#each markets as market}
                                <option value={market}>{market}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label for="date">Date</label>
                        <Input id="date" type="date" bind:value={filterParams.date} />
                    </div>

                    <div class="space-y-2">
                        <label for="min-return">Min Return (%)</label>
                        <Input id="min-return" type="number" bind:value={filterParams.return} />
                    </div>

                    <div class="space-y-2">
                        <label for="max-return">Max Return (%)</label>
                        <Input id="max-return" type="number" bind:value={filterParams.max_return} />
                    </div>

                    <div class="space-y-2">
                        <label for="min-cap">Min Market Cap (亿)</label>
                        <Input id="min-cap" type="number" bind:value={filterParams.min_market_cap} />
                    </div>

                      <!-- Turnover Rate -->
                        <div class="form-group">
                            <label class="block text-sm font-medium mb-2" for="min-turnover">
                                Min Turnover Rate (%)
                            </label>
                            <Input 
                                id="min-turnover" 
                                type="number" 
                               
                                bind:value={filterParams.min_turnover_rate} 
                                
                            />
                        </div>

                        <div class="form-group">
                            <label class="block text-sm font-medium mb-2" for="max-turnover">
                                Max Turnover Rate (%)
                            </label>
                            <Input 
                                id="max-turnover" 
                                type="number" 
                              
                                bind:value={filterParams.max_turnover_rate} 
                               
                            />
                        </div>

                    <div class="space-y-2">
                        <label for="sort">Sort By</label>
                        <select
                            id="sort"
                            class="w-full px-3 py-2 border rounded-md"
                            bind:value={filterParams.sort}
                        >
                            {#each sortOptions as option}
                                <option value={option}>{option}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-2">
                        <label for="sort-direction">Sort Direction</label>
                        <select
                            id="sort-direction"
                            class="w-full px-3 py-2 border rounded-md"
                            bind:value={filterParams.sort_direction}
                        >
                            <option value="Desc">Descending</option>
                            <option value="Asc">Ascending</option>
                        </select>
                    </div>

                      <div class="space-y-2">
                        <label for="force_refresh">Force Refresh</label>
                        <select
                            id="force_refresh"
                            class="w-full px-3 py-2 border rounded-md"
                            bind:value={filterParams.force_refresh}
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                        </select>
                    </div>

                    <div class="col-span-full">
                        <Button type="submit" disabled={$loading}>
                            {$loading ? 'Loading...' : 'Query Market'}
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    {/if}
  

    {#if $error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong class="font-bold">Error: </strong>
            <span class="block sm:inline">{$error}</span>
        </div>
    {/if}

    {#if showTable && $marketStore.data.length > 0}
        <Card class="w-full max-w-6xl mx-auto mb-6">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <div class="space-x-2">
                        <Button on:click={showHome} variant="outline">
                            Home
                        </Button>
                        <Button
                            on:click={() => handlePageChange('prev')}
                            disabled={currentPage === 1}
                            variant="outline"
                        >
                            Previous
                        </Button>
                    </div>
                    <Button
                        on:click={() => handlePageChange('next')}
                        disabled={currentPage === $marketStore.pagination.total_pages}
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>

                <div class="overflow-x-auto">
                    <table class="market-table">
                        <thead >
                            <tr>
                                <th class="px-6 py-4 text-center border-b">Date</th>
                                <th class="px-6 py-4 text-center border-b">Code</th>
                                <th class="px-6 py-4 text-center border-b">Name</th>
                                <th class="px-6 py-4 text-center border-b">Price</th>
                                <th class="px-6 py-4 text-center border-b">Today ROE</th>
                                <th class="px-6 py-4 text-center border-b">10D ROE</th>
                                <th class="px-6 py-4 text-center border-b">30D ROE</th>
                                <th class="px-6 py-4 text-center border-b">90D ROE</th>
                                <th class="px-6 py-4 text-center border-b">1Y ROE</th>
                                <th class="px-6 py-4 text-center border-b">YTD ROE</th>
                                <th class="px-6 py-4 text-center border-b">Market Cap</th>
                                <th class="px-6 py-4 text-center border-b">Free Cap</th>
                                <th class="px-6 py-4 text-center border-b">Amount</th>
                                <th class="px-6 py-4 text-center border-b">Turnover rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each $marketStore.data as item, i}
                                <tr class="cursor-pointer hover:bg-gray-100 {i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}"
                                    on:click={() => handleTickerClick(item.code, item.name)}>
                                    <td class="px-6 py-4 text-center border-b">{item.date}</td>
                                     <td class="px-6 py-4 text-center border-b">
                    <a href="https://finance.yahoo.com/quote/{modifyTicker(item.code)}" target="_blank" class="text-blue-500 hover:underline">
                        {item.code}
                    </a>
                </td>
                                    <td class="px-6 py-4 text-center border-b">{item.name}</td>
                                     <td class="px-6 py-4 text-center border-b">{item.close}</td>
                    <td class="px-6 py-4 text-center border-b {item.today_roe != null && item.today_roe >= 0 ? 'text-green-600' : (item.today_roe != null ? 'text-red-600' : '')}">
               {#if item.today_roe != null}
                {item.today_roe.toFixed(2)}%
               {:else}
                 -
               {/if}
            </td>
            <td class="px-6 py-4 text-center border-b {item.d10_roe != null && item.d10_roe >= 0 ? 'text-green-600' : (item.d10_roe != null ? 'text-red-600' : '')}">
                {#if item.d10_roe != null}
                    {item.d10_roe.toFixed(2)}%
                {:else}
                    -
                {/if}
            </td>
             <td class="px-6 py-4 text-center border-b {item.d30_roe != null && item.d30_roe >= 0 ? 'text-green-600' : (item.d30_roe != null ? 'text-red-600' : '')}">
                {#if item.d30_roe != null}
                    {item.d30_roe.toFixed(2)}%
                {:else}
                   -
                {/if}
            </td>
            <td class="px-6 py-4 text-center border-b {item.d90_roe != null && item.d90_roe >= 0 ? 'text-green-600' : (item.d90_roe != null ? 'text-red-600' : '')}">
                {#if item.d90_roe != null}
                  {item.d90_roe.toFixed(2)}%
                 {:else}
                    -
                {/if}
            </td>
            <td class="px-6 py-4 text-center border-b {item.d1year_roe != null && item.d1year_roe >= 0 ? 'text-green-600' : (item.d1year_roe != null ? 'text-red-600' : '')}">
                 {#if item.d1year_roe != null}
                   {item.d1year_roe.toFixed(2)}%
                  {:else}
                    -
                 {/if}
            </td>
            <td class="px-6 py-4 text-center border-b {item.ytd_roe != null && item.ytd_roe >= 0 ? 'text-green-600' : (item.ytd_roe != null ? 'text-red-600' : '')}">
                {#if item.ytd_roe != null}
                    {item.ytd_roe.toFixed(2)}%
                 {:else}
                   -
                 {/if}
            </td>
                                    <td class="px-6 py-4 text-center border-b">{(item.total_cap).toFixed(2)}</td>
                                    <td class="px-6 py-4 text-center border-b">{(item.free_cap).toFixed(2)}</td>                                
                                    <td class="px-6 py-4 text-center border-b">{(item.amount).toFixed(2)}</td>
                                    <td class="px-6 py-4 text-center border-b">{item.swap_ratio.toFixed(2)}%</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>

                    <div class="mt-4 text-center">
                        <span class="text-sm text-gray-600">
                            Page {currentPage} of {$marketStore.pagination.total_pages} | Total: {$marketStore.pagination.total_items} items
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    {/if}



  
  
    
</div>
{/if}

<style>
    /* 全局样式 */
:global(body) {
    background-color: #f0f0f0;
    overflow-y: auto !important;
    padding-right: 0 !important; /* 防止滚动条导致页面抖动 */
    position: relative;
}

/* 表格样式 */
.market-table {
    border-collapse: collapse;
    width: 100%;
    font-family: sans-serif;
    font-size: 14px;
    color: #333;
}

.market-table th, 
.market-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.market-table th {
    background-color: #f2f2f2;
    font-weight: bold;
}

.market-table tr:nth-child(even) {
    background-color: #f9f9f9;
}

.market-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f2f2f2;
}

/* 模态框样式 */
:global(.dialog-overlay) {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 50;
}

:global(.dialog-content) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    max-height: 90vh;
    overflow-y: auto;
    width: 90%;
    max-width: 1024px;
    z-index: 51;
    animation: dialogSlideIn 0.2s ease-out;
}

/* 动画效果 */
@keyframes dialogSlideIn {
    from {
        opacity: 0;
        transform: translate(-50%, -48%);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}


/* 模态框容器 */
    .modal-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    /* 遮罩层 */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1001;
    }

    /* 模态框内容 */
    .modal-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 1200px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        z-index: 1002;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* 标题栏 */
    .modal-header {
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
        border-radius: 8px 8px 0 0;
    }

    .modal-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: #1a1a1a;
    }

    /* 内容区域 */
    .modal-body {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        min-height: 400px;
        max-height: calc(90vh - 130px); /* 减去头部和底部的高度 */
    }

    .chart-container {
        height: 100%;
        min-height: 400px;
    }

    /* 底部按钮区 */
    .modal-footer {
        padding: 1rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        background: #f8f9fa;
        border-radius: 0 0 8px 8px;
    }

    /* 按钮样式 */
    .close-button,
    .timeframe-button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: 1px solid #e5e7eb;
        background: white;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
    }

    .close-button:hover,
    .timeframe-button:hover {
        background: #f3f4f6;
    }

    /* 加载状态 */
    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 400px;
    }

    /* 错误状态 */
    .error-state {
        color: #dc2626;
        padding: 1rem;
        text-align: center;
    }
</style>
