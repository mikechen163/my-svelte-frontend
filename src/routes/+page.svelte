<script lang="ts">  
    import { Button } from "$lib/components/ui/button";  
    import { Card } from "$lib/components/ui/card";  
    import { Input } from "$lib/components/ui/input";  
    import { marketStore, loading, error, fetchMarketData } from '$lib/stores/marketStore';  
    import { stocks, fetchStocks } from '$lib/stores/stockStore';  

    // State variables for UI control  
    let showInputInterface = true;  
    let currentPage = 1;  

    // Market Query Parameters  
    let filterParams = {  
        filter_object: "Return Rate",  
        return: -100,  
        max_return: 1000,  
        min_market_cap: 10,  
        market: "US",  
        date: new Date().toISOString().split('T')[0],  
        sort: "Total Market Cap",  
        sort_direction: 'Desc' as 'Asc' | 'Desc'  
    };  

    // Chart Parameters  
    let selectedTicker = "";  
    let timeframe: '1d' | '1w' = '1d';  
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
    }  

    function showHome() {  
        showInputInterface = true;  
        selectedTicker = "";  
    }  

    async function handlePageChange(direction: 'next' | 'prev') {  
        if (direction === 'next' && currentPage < $marketStore.pagination.total_pages) {  
            currentPage++;  
        } else if (direction === 'prev' && currentPage > 1) {  
            currentPage--;  
        }  
        await fetchMarketData(filterParams, filterParams.sort, filterParams.sort_direction, currentPage);  
    }  

    async function handleTickerClick(ticker: string) {  
        selectedTicker = ticker;  
        await fetchStocks(ticker, timeframe, chartDateString, new Date().toISOString().split('T')[0]);  
    }  

    function toggleTimeframe() {  
        timeframe = timeframe === '1d' ? '1w' : '1d';  
        if (selectedTicker) {  
            handleTickerClick(selectedTicker);  
        }  
    }  
</script>  

<div class="container mx-auto p-4">  
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

     {#if $marketStore.data.length > 0}
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
                    <table class="min-w-full table-auto">
                        <thead class="sticky top-0 bg-white shadow-sm">
                            <tr>
                                <th class="px-6 py-4 text-center border-b">Date</th>
                                <th class="px-6 py-4 text-center border-b">Code</th>
                                <th class="px-6 py-4 text-center border-b">Name</th>
                                <th class="px-6 py-4 text-center border-b">Today ROE</th>
                                <th class="px-6 py-4 text-center border-b">10D ROE</th>
                                <th class="px-6 py-4 text-center border-b">30D ROE</th>
                                <th class="px-6 py-4 text-center border-b">90D ROE</th>
                                <th class="px-6 py-4 text-center border-b">1Y ROE</th>
                                <th class="px-6 py-4 text-center border-b">YTD ROE</th>
                                <th class="px-6 py-4 text-center border-b">Market Cap</th>
                                <th class="px-6 py-4 text-center border-b">Amount</th>
                                <th class="px-6 py-4 text-center border-b">Swap Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each $marketStore.data as item, i}
                                <tr class="cursor-pointer hover:bg-gray-100 {i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}"
                                    on:click={() => handleTickerClick(item.code)}>
                                    <td class="px-6 py-4 text-center border-b">{item.date}</td>
                                    <td class="px-6 py-4 text-center border-b">{item.code}</td>
                                    <td class="px-6 py-4 text-center border-b">{item.name}</td>
                                    <td class="px-6 py-4 text-center border-b {item.today_roe >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        {item.today_roe.toFixed(2)}%
                                    </td>
                                    <td class="px-6 py-4 text-center border-b {item.d10_roe >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        {item.d10_roe.toFixed(2)}%
                                    </td>
                                    <td class="px-6 py-4 text-center border-b {item.d30_roe >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        {item.d30_roe.toFixed(2)}%
                                    </td>
                                    <td class="px-6 py-4 text-center border-b {item.d90_roe >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        {item.d90_roe.toFixed(2)}%
                                    </td>
                                    <td class="px-6 py-4 text-center border-b {item.d1year_roe >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        {item.d1year_roe.toFixed(2)}%
                                    </td>
                                    <td class="px-6 py-4 text-center border-b {item.ytd_roe >= 0 ? 'text-green-600' : 'text-red-600'}">
                                        {item.ytd_roe.toFixed(2)}%
                                    </td>
                                    <td class="px-6 py-4 text-center border-b">{(item.total_cap).toFixed(2)}</td>
                                    <td class="px-6 py-4 text-center border-b">{(item.amount).toFixed(2)}</td>
                                    <td class="px-6 py-4 text-center border-b">{item.swap_ratio.toFixed(2)}</td>
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

    {#if $stocks && $stocks.chart}  
        <Card class="w-full max-w-6xl mx-auto">  
            <div class="p-6">  
                <div class="flex justify-between items-center mb-4">  
                    <h2 class="text-xl font-bold">  
                        Stock Chart: {selectedTicker}  
                    </h2>  
                    <Button on:click={toggleTimeframe}>  
                        {timeframe === '1d' ? 'Daily' : 'Weekly'} View  
                    </Button>  
                </div>  
                <img  
                    src="data:image/png;base64,{$stocks.chart}"  
                    alt="Stock Chart"  
                    class="w-full"  
                />  
            </div>  
        </Card>  
    {/if}  
</div>  

<style>  
   

     :global(body) {
        background-color: #f0f0f0;
    }

    .table-auto {
        border-collapse: separate;
        border-spacing: 0;
    }

    thead {
        position: sticky;
        top: 0;
        z-index: 10;
    }
</style>  