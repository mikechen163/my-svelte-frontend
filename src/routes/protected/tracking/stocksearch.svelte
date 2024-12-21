<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Button } from "$lib/components/ui/button";
    import { createEventDispatcher } from 'svelte';
    import { fetchStockData } from '$lib/stores/marketStore';
    
    const dispatch = createEventDispatcher();
    
    let searchTicker = "";
    let searching = false;
    let error = "";

    function modifyTicker(ticker: string): string {
        let modifiedTicker = ticker;

        if (ticker.length === 7 && ticker.startsWith('hk')) {
            modifiedTicker = ticker.slice(3) + '.HK';
        } else if (ticker.length === 6 && /^\d+$/.test(ticker)) {
            if (ticker.startsWith('6')) {
                modifiedTicker = ticker + '.SS';
            } else {
                modifiedTicker = ticker + '.SZ';
            }
        }

        return modifiedTicker;
    }

    async function handleSearch() {
        if (!searchTicker) {
            error = "Please enter a stock code";
            return;
        }

        searching = true;
        error = "";

        try {
            let modifiedTicker = modifyTicker(searchTicker);
            let endDate = new Date();
            let startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 2);
            
            // 获取股票数据
            await fetchStockData(
                modifiedTicker,
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0],
                '1d'
            );

            console.log("Dispatching stockFound event:", { 
                ticker: modifiedTicker, 
                name: searchTicker 
            });

            // 派发事件
            dispatch('stockFound', {
                ticker: modifiedTicker,
                name: searchTicker
            });
            
        } catch (err) {
            console.error("Search error:", err);
            error = "Stock not found or invalid code";
        } finally {
            searching = false;
        }
    }

    // 处理回车键搜索
    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }
</script>

<div class="stock-search-container">
    <div class="search-box">
        <Input
            type="text"
            placeholder="Enter stock code (e.g., 600000 for SH, 000001 for SZ, hk0700 for HK)"
            bind:value={searchTicker}
            on:keypress={handleKeyPress}
            disabled={searching}
            class="stock-input"
        />
        <Button 
            on:click={handleSearch}
            disabled={searching}
            class="search-button"
        >
            {searching ? 'Searching...' : 'Search'}
        </Button>
    </div>
    
    {#if error}
        <div class="error-message">
            {error}
        </div>
    {/if}

    <div class="help-text">
        <p>Stock code format examples:</p>
        <ul>
            <li>Shanghai: 600000</li>
            <li>Shenzhen: 000001</li>
            <li>Hong Kong: hk0700</li>
        </ul>
    </div>
</div>

<style>
    .stock-search-container {
        width: 100%;
        max-width: 600px;
        margin: 2rem auto;
        padding: 1.5rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .search-box {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .stock-input {
        flex: 1;
    }

    .search-button {
        min-width: 100px;
    }

    .error-message {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background-color: #fee2e2;
        border-radius: 4px;
    }

    .help-text {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
        font-size: 0.875rem;
        color: #6b7280;
    }

    .help-text p {
        margin-bottom: 0.5rem;
    }

    .help-text ul {
        list-style-type: none;
        padding-left: 1rem;
    }

    .help-text li {
        margin-bottom: 0.25rem;
    }

    /* 响应式设计 */
    @media (max-width: 640px) {
        .stock-search-container {
            margin: 1rem auto;
            padding: 1rem;
        }

        .search-box {
            flex-direction: column;
        }

        .search-button {
            width: 100%;
        }
    }
</style>