// src/lib/stores/stockStore.ts  
import { writable } from 'svelte/store';  

interface StockData {  
    chart: string | null;  // base64 encoded chart image  
    financials?: any[];    // optional financial data  
}  

// 创建初始状态  
const initialState = {  
    chart: null,  
    financials: []  
};  

export const stocks = writable(initialState);  
export const loading = writable(false);  
export const error = writable<string | null>(null);  

export const fetchStocks = async (  
    ticker: string,  
    timeframe: '1d' | '1w' = '1d',  
    startDate?: string,  
    endDate?: string  
) => {  
    loading.set(true);  
    error.set(null);  

    try {  
        const queryParams = new URLSearchParams({  
            ticker,  
            timeframe,  
            ...(startDate && { start_date: startDate }),  
            ...(endDate && { end_date: endDate })  
        });  

        const response = await fetch(  
            `${API_BASE_URL}/api/stocks?${queryParams.toString()}`,  
            {  
                method: 'GET',  
                headers: {  
                    'Content-Type': 'application/json',  
                    'Accept': 'application/json'  
                }  
            }  
        );  

        if (!response.ok) {  
            throw new Error(`HTTP error! status: ${response.status}`);  
        }  

        const data = await response.json();  
        stocks.set({  
            chart: data.chart_image,  
            financials: data.financials || []  
        });  
    } catch (e) {  
        error.set(e instanceof Error ? e.message : 'Failed to fetch stock data');  
    } finally {  
        loading.set(false);  
    }  
};  
