// src/lib/stores/stockStore.ts
import { writable } from 'svelte/store';

interface StockData {
    chart: string | null;
    financials?: any[];
}

const initialState = {
    chart: null,
    financials: []
};

export const stocks = writable(initialState);
export const loading = writable(false);
export const error = writable<string | null>(null);

//const API_URL = "http://192.168.191.206:8000";

export const fetchStocks = async (
    ticker: string,
    timeframe: '1w',
    startDate?: string,
    endDate?: string
) => {
    loading.set(true);
    error.set(null);

    try {
       // Health check to see if API is alive
        const healthCheck = await fetch(`${API_URL}/health`);
        if (!healthCheck.ok) {
            throw new Error('API server is not responding');
        }

        const response = await fetch(`${API_URL}/api/stock/${ticker}?timeframe=1w`, {
            method: 'GET',
            headers: {
               'Accept': 'application/json',
                'Origin': 'http://192.168.191.56:5173'  // Set your origin here
            },
        });

       if (!response.ok) {
            const errorData = await response.json().catch(() => null);
           throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received data from API:", data); // Debug log

        if (data.error) {
           error.set(data.error);
        } else {
          stocks.set({
            chart: data.chart_image,
            financials: data.financials || []
          });
        }

    } catch (e) {
       console.error("Fetch error:", e);
       error.set(e instanceof Error ? e.message : 'Failed to fetch stock data');
    } finally {
       loading.set(false);
    }
};
