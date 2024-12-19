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

interface StockData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    amount: number;
}

// Store for stock data
export const stockDataStore = writable<StockData[]>([]);
export const stockDataLoading = writable(false);
export const stockDataError = writable<string | null>(null);

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
        const queryParams = new URLSearchParams();

        Object.entries(filterParams).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(`filter[${key}]`, value.toString());
            }
        });

        if (sort) {
            queryParams.append('sort', sort);
        }
        if (sortDirection) {
            queryParams.append('sort_direction', sortDirection);
        }

        queryParams.append('page', page.toString());

        const response = await fetch(
            `/api/markets/query?${queryParams.toString()}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

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

// Modified API function to fetch stock data with timeframe support
export const fetchStockData = async (
    code: string, 
    startDate: string, 
    endDate: string,
    timeframe?: '1d' | '1w'  // Optional timeframe parameter
) => {
    stockDataLoading.set(true);
    stockDataError.set(null);

    try {
        const queryParams = new URLSearchParams({
            code,
            start_date: startDate,
            end_date: endDate
        });

        // Add timeframe parameter if provided
        if (timeframe) {
            queryParams.append('timeframe', timeframe);
        }

        const response = await fetch(`/api/markets/querystock?${queryParams.toString()}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StockData[] = await response.json();
        stockDataStore.set(data);
    } catch (e) {
        stockDataError.set(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
        stockDataLoading.set(false);
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

export const resetStockDataStore = () => {
    stockDataStore.set([]);
};
