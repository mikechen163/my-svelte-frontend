<script lang="ts">  
    import { Button } from "$lib/components/ui/button";  
    import { Card } from "$lib/components/ui/card";  
    import { Input } from "$lib/components/ui/input";  

    let ticker = "";  
    let loading = false;  
    let error = "";  
    let chartImage: string | null = null;  
    let financials: any[] | null = null;  
    let timeframe: '1d' | '1w' = '1d';  

    // Add date state  
    let startDate = new Date();  
    startDate.setFullYear(startDate.getFullYear() - 2); // Default to 2 years ago  
    let dateString = startDate.toISOString().split('T')[0]; // Format for input date  

    const API_URL = "http://192.168.191.206:8000";  

    async function fetchStockData() {  
        if (!ticker) {  
            error = "Please enter a ticker symbol";  
            return;  
        }  

        loading = true;  
        error = "";  
        chartImage = null;  
        financials = null;  

        try {  
            const healthCheck = await fetch(`${API_URL}/health`);  
            if (!healthCheck.ok) {  
                throw new Error('API server is not responding');  
            }  

            const response = await fetch(  
                `${API_URL}/api/stock/${ticker}?timeframe=${timeframe}&start_date=${dateString}`,   
                {  
                    method: 'GET',  
                    headers: {  
                        'Accept': 'application/json',  
                        'Origin': 'http://192.168.191.56:5173'  
                    },  
                }  
            );  

            if (!response.ok) {  
                const errorData = await response.json().catch(() => null);  
                throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);  
            }  

            const data = await response.json();  
            console.log("Received data:", data);  

            if (data.error) {  
                error = data.error;  
            } else {  
                chartImage = data.chart_image;  
                financials = data.financials;  
            }  
        } catch (e) {  
            console.error("Fetch error:", e);  
            error = e.message || "Failed to fetch stock data";  
        } finally {  
            loading = false;  
        }  
    }  

    function toggleTimeframe() {  
        timeframe = timeframe === '1d' ? '1w' : '1d';  
        if (ticker) {  
            fetchStockData();  
        }  
    }  

    // Handle date selection  
    $: if (dateString) {  
        if (ticker) {  
            fetchStockData();  
        }  
    }  
</script>  

<div class="container mx-auto p-4">  
    <Card class="w-full max-w-6xl mx-auto">  
        <div class="p-6">  
            <h1 class="text-3xl font-bold mb-6">Stock Analysis</h1>  

            <div class="flex flex-wrap gap-4 mb-6">  
                <Input  
                    type="text"  
                    placeholder="Enter stock ticker..."  
                    bind:value={ticker}  
                    class="max-w-xs"  
                />  

                <!-- Simple Date Input -->  
                <Input  
                    type="date"  
                    bind:value={dateString}  
                    max={new Date().toISOString().split('T')[0]}  
                    class="max-w-xs"  
                />  

                <Button on:click={fetchStockData} disabled={loading}>  
                    {loading ? 'Loading...' : 'Fetch Data'}  
                </Button>  

                <Button   
                    on:click={toggleTimeframe}   
                    disabled={loading}  
                    variant={timeframe === '1d' ? "default" : "outline"}  
                >  
                    {timeframe === '1d' ? 'Daily' : 'Weekly'} View  
                </Button>  
            </div>  

            {#if error}  
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">  
                    <strong class="font-bold">Error: </strong>  
                    <span class="block sm:inline">{error}</span>  
                </div>  
            {/if}  

            {#if loading}  
                <div class="flex justify-center items-center py-4">  
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>  
                </div>  
            {/if}  

            {#if chartImage}  
                <div class="mb-6">  
                    <h2 class="text-xl font-bold mb-2">  
                        Stock Chart ({timeframe === '1d' ? 'Daily' : 'Weekly'})  
                        from {new Date(dateString).toLocaleDateString()}  
                    </h2>  
                    <img  
                        src="data:image/png;base64,{chartImage}"  
                        alt="Stock Chart"  
                        class="w-full"  
                    />  
                </div>  
            {/if}  

            {#if financials}  
                <div>  
                    <h2 class="text-xl font-bold mb-2">Financial Data</h2>  
                    <div class="overflow-x-auto">  
                        <table class="min-w-full table-auto">  
                            <thead>  
                                <tr>  
                                    {#each Object.keys(financials[0] || {}) as header}  
                                        <th class="px-4 py-2 text-left">{header}</th>  
                                    {/each}  
                                </tr>  
                            </thead>  
                            <tbody>  
                                {#each financials as row}  
                                    <tr>  
                                        {#each Object.values(row) as value}  
                                            <td class="px-4 py-2">  
                                                {typeof value === 'number'  
                                                    ? value.toLocaleString()  
                                                    : value}  
                                            </td>  
                                        {/each}  
                                    </tr>  
                                {/each}  
                            </tbody>  
                        </table>  
                    </div>  
                </div>  
            {/if}  
        </div>  
    </Card>  
</div>  

<style>  
    :global(body) {  
        background-color: #f0f0f0;  
    }  
</style>  
