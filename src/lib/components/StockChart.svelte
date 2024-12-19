<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import * as echarts from 'echarts';

    interface StockData {
        date: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
        amount: number;
    }

    export let stockData: StockData[];
    export let timeframe: '1d' | '1w' = '1d';

    let chartDiv: HTMLElement;
    let chart: echarts.ECharts;

    // 计算移动平均线
    function calculateMA(dayCount: number, data: StockData[]) {
        const result = [];
        for (let i = 0; i < data.length; i++) {
            if (i < dayCount - 1) {
                result.push('-');
                continue;
            }
            let sum = 0;
            for (let j = 0; j < dayCount; j++) {
                sum += data[i - j].close;
            }
            result.push(+(sum / dayCount).toFixed(2));
        }
        return result;
    }

    // 计算MACD
    function calculateMACD(data: StockData[]) {
        const closePrice = data.map(item => item.close);
        const shortPeriod = 12;
        const longPeriod = 26;
        const signalPeriod = 9;
        
        // 计算EMA
        function calculateEMA(period: number, prices: number[]) {
            const k = 2 / (period + 1);
            const emaData = [];
            let ema = prices[0];
            
            for (let i = 0; i < prices.length; i++) {
                if (i === 0) {
                    emaData.push(ema);
                } else {
                    ema = (prices[i] * k) + (ema * (1 - k));
                    emaData.push(ema);
                }
            }
            return emaData;
        }

        const shortEMA = calculateEMA(shortPeriod, closePrice);
        const longEMA = calculateEMA(longPeriod, closePrice);

        // 计算DIF
        const dif = shortEMA.map((value, index) => value - longEMA[index]);

        // 计算DEA (MACD Signal Line)
        const dea = calculateEMA(signalPeriod, dif);

        // 计算MACD柱状图
        const macd = dif.map((value, index) => 2 * (value - dea[index]));

        return {
            dif: dif.map(item => +item.toFixed(3)),
            dea: dea.map(item => +item.toFixed(3)),
            macd: macd.map(item => +item.toFixed(3))
        };
    }

    function initChart() {
        if (chartDiv && stockData) {
            chart = echarts.init(chartDiv);
            updateChart();
        }
    }

    function updateChart() {
        if (!chart || !stockData) return;

        const macdData = calculateMACD(stockData);

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: ['K线', 'MA5', 'MA10', 'MA20', 'MA30', '成交量', 'MACD', 'DIF', 'DEA']
            },
            grid: [{
                left: '10%',
                right: '10%',
                height: '45%'
            }, {
                left: '10%',
                right: '10%',
                top: '55%',
                height: '15%'
            }, {
                left: '10%',
                right: '10%',
                top: '75%',
                height: '15%'
            }],
            xAxis: [{
                type: 'category',
                data: stockData.map(item => item.date),
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            }, {
                type: 'category',
                gridIndex: 1,
                data: stockData.map(item => item.date),
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            }, {
                type: 'category',
                gridIndex: 2,
                data: stockData.map(item => item.date),
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                min: 'dataMin',
                max: 'dataMax'
            }],
            yAxis: [{
                scale: true,
                splitArea: {
                    show: true
                }
            }, {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            }, {
                scale: true,
                gridIndex: 2,
                splitNumber: 2,
                axisLabel: { show: true },
                axisLine: { show: true },
                axisTick: { show: true },
                splitLine: { show: false }
            }],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1, 2],
                    start: 0,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1, 2],
                    type: 'slider',
                    bottom: '0%',
                    start: 0,
                    end: 100
                }
            ],
            series: [
                {
                    name: 'K线',
                    type: 'candlestick',
                    data: stockData.map(item => [
                        item.open,
                        item.close,
                        item.low,
                        item.high
                    ]),
                    itemStyle: {
                        color: '#ef5350',
                        color0: '#26a69a',
                        borderColor: '#ef5350',
                        borderColor0: '#26a69a'
                    }
                },
                {
                    name: 'MA5',
                    type: 'line',
                    data: calculateMA(5, stockData),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'MA10',
                    type: 'line',
                    data: calculateMA(10, stockData),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'MA20',
                    type: 'line',
                    data: calculateMA(20, stockData),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'MA30',
                    type: 'line',
                    data: calculateMA(30, stockData),
                    smooth: true,
                    showSymbol: false,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: '成交量',
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: stockData.map(item => item.volume)
                },
                {
                    name: 'MACD',
                    type: 'bar',
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    data: macdData.macd,
                    itemStyle: {
                        color: function(params: any) {
                            return params.data >= 0 ? '#ef5350' : '#26a69a';
                        }
                    }
                },
                {
                    name: 'DIF',
                    type: 'line',
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    data: macdData.dif,
                    showSymbol: false,  // 添加这行，不显示线上的圆点
                    smooth: true,
                    lineStyle: {
                        width: 1
                    }
                },
                {
                    name: 'DEA',
                    type: 'line',
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    data: macdData.dea,
                    showSymbol: false,  // 添加这行，不显示线上的圆点
                    smooth: true,
                    lineStyle: {
                        width: 1
                    }
                }
            ]
        };

        chart.setOption(option);
    }

    function handleResize() {
        chart?.resize();
    }

    onMount(() => {
        initChart();
        window.addEventListener('resize', handleResize);
    });

    onDestroy(() => {
        chart?.dispose();
        window.removeEventListener('resize', handleResize);
    });

    $: if (chart && stockData) {
        updateChart();
    }
</script>

<div bind:this={chartDiv} class="w-full h-full"></div>

<style>
    div {
        min-height: 680px;
    }

    @media (max-width: 768px) {
     div {
        min-height: 450px;
        }
    }
</style>

