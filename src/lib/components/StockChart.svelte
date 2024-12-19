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

    function initChart() {
        if (chartDiv && stockData) {
            chart = echarts.init(chartDiv);
            updateChart();
        }
    }

    function updateChart() {
        if (!chart || !stockData) return;

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: ['K线', 'MA5', 'MA10', 'MA20', 'MA30', '成交量']
            },
            grid: [{
                left: '10%',
                right: '10%',
                height: '60%'
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
            }],
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0, 1],
                    start: 0,
                    end: 100
                },
                {
                    show: true,
                    xAxisIndex: [0, 1],
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
        min-height: 700px;
    }

    @media (max-width: 768px) {
     div {
        min-height: 500px;
        }
    }
</style>
