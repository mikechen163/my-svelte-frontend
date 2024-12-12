import { writable } from 'svelte/store';  

// Types  
interface MarketData {  
    id: number;  
    code: string;  
    name: string;  
    today_roe: number;  
    swap_ratio: number;  
    amount: number;  
    total_cap: number;  
    free_cap: number;  
    ytd_roe: number;  
    d10_roe: number;  
    d30_roe: number;  
    d90_roe: number;  
    d1year_roe: number;  
    date: string;  
    market: string;  
}  

interface PaginationData {  
    total_items: number;  
    total_pages: number;  
    current_page: number;  
    per_page: number;  
}  

interface MarketResponse {  
    data: MarketData[];  
    pagination: PaginationData;  
}  

interface FilterParams {  
    filter_object?: string;  
    return?: number;  
    max_return?: number;  
    min_market_cap?: number;  
    market?: string;  
    date?: string;  
}  

// Store  
export const marketStore = writable<MarketResponse>({  
    data: [],  
    pagination: {  
        total_items: 0,  
        total_pages: 0,  
        current_page: 1,  
        per_page: 100  
    }  
});  
export const loading = writable(false);  
export const error = writable<string | null>(null);  

// API function  
export const fetchMarketData = async (  
    filterParams: FilterParams,  
    sort?: string,  
    sortDirection?: 'Asc' | 'Desc',  
    page: number = 1  
) => {  
    loading.set(true);  
    error.set(null);  

    try {  
        // Build query parameters  
        const queryParams = new URLSearchParams();  

        // Add filter parameters  
        Object.entries(filterParams).forEach(([key, value]) => {  
            if (value !== undefined) {  
                queryParams.append(`filter[${key}]`, value.toString());  
            }  
        });  

        // Add sort parameters  
        if (sort) {  
            queryParams.append('sort', sort);  
        }  
        if (sortDirection) {  
            queryParams.append('sort_direction', sortDirection);  
        }  

        // Add page parameter  
        queryParams.append('page', page.toString());  

       const response = await fetch(  
    `/api/markets/query?${queryParams.toString()}`,  // 使用代理路径  
    {  
        headers: {  
            'Accept': 'application/json',  
            'Content-Type': 'application/x-www-form-urlencoded'  
        }  
    }  
); 

   /*

        const response = await fetch(  
            `http://192.168.191.56:4000/markets/query?${queryParams.toString()}`,  
            {  
                method: 'GET',  
               mode: 'no-cors',  // 添加这行                  
               headers: {  
                    'Accept': 'application/json',  
                    'Content-Type': 'application/x-www-form-urlencoded'  
                }  
            }  
        );  

  */

        if (!response.ok) {  
            throw new Error(`HTTP error! status: ${response.status}`);  
        }  

        const data: MarketResponse = await response.json();  
        marketStore.set(data);  
    } catch (e) {  
        error.set(e instanceof Error ? e.message : 'An unknown error occurred');  
    } finally {  
        loading.set(false);  
    }  
};  

// Helper function to reset store  
export const resetMarketStore = () => {  
    marketStore.set({  
        data: [],  
        pagination: {  
            total_items: 0,  
            total_pages: 0,  
            current_page: 1,  
            per_page: 100  
        }  
    });  
};  

// Example usage in a Svelte component:  
/*  
<script lang="ts">  
    import { marketStore, loading, error, fetchMarketData } from '$lib/stores/marketStore';  

    const loadMarketData = async () => {  
        await fetchMarketData({  
            filter_object: 'Return Rate',  
            return: 0,  
            max_return: 100,  
            min_market_cap: 10,  
            market: 'SH',  
            date: '2024-01-01'  
        }, 'Return Rate', 'Desc', 1);  
    };  
</script>  
*/
