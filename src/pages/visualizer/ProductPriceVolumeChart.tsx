import Highcharts from 'highcharts';
import { ReactNode } from 'react';
import { ProsperitySymbol } from '../../models.ts';
import { useStore } from '../../store.ts';
import { getAskColor, getBidColor } from '../../utils/colors.ts';
import { Chart } from './Chart.tsx';

export interface ProductPriceVolumeChartProps {
  symbol: ProsperitySymbol;
}

export function ProductPriceVolumeChart({ symbol }: ProductPriceVolumeChartProps): ReactNode {
  const algorithm = useStore(state => state.algorithm)!;

  const priceSeries: Highcharts.SeriesOptionsType[] = [
    { type: 'line', name: 'Bid 3', color: getBidColor(0.5), marker: { symbol: 'square' }, yAxis: 0, data: [] },
    { type: 'line', name: 'Bid 2', color: getBidColor(0.75), marker: { symbol: 'circle' }, yAxis: 0, data: [] },
    { type: 'line', name: 'Bid 1', color: getBidColor(1.0), marker: { symbol: 'triangle' }, yAxis: 0, data: [] },
    {
      type: 'line',
      name: 'Mid price',
      color: 'gray',
      dashStyle: 'Dash',
      marker: { symbol: 'diamond' },
      yAxis: 0,
      data: [],
    },
    { type: 'line', name: 'Ask 1', color: getAskColor(1.0), marker: { symbol: 'triangle-down' }, yAxis: 0, data: [] },
    { type: 'line', name: 'Ask 2', color: getAskColor(0.75), marker: { symbol: 'circle' }, yAxis: 0, data: [] },
    { type: 'line', name: 'Ask 3', color: getAskColor(0.5), marker: { symbol: 'square' }, yAxis: 0, data: [] },
  ];

  const volumeSeries: Highcharts.SeriesOptionsType[] = [
    { type: 'column', name: 'Bid Vol 3', color: getBidColor(0.5), yAxis: 1, data: [], showInLegend: false },
    { type: 'column', name: 'Bid Vol 2', color: getBidColor(0.75), yAxis: 1, data: [], showInLegend: false },
    { type: 'column', name: 'Bid Vol 1', color: getBidColor(1.0), yAxis: 1, data: [], showInLegend: false },
    { type: 'column', name: 'Ask Vol 1', color: getAskColor(1.0), yAxis: 1, data: [], showInLegend: false },
    { type: 'column', name: 'Ask Vol 2', color: getAskColor(0.75), yAxis: 1, data: [], showInLegend: false },
    { type: 'column', name: 'Ask Vol 3', color: getAskColor(0.5), yAxis: 1, data: [], showInLegend: false },
  ];

  for (const row of algorithm.activityLogs) {
    if (row.product !== symbol) {
      continue;
    }

    for (let i = 0; i < row.bidPrices.length; i++) {
      (priceSeries[2 - i] as any).data.push([row.timestamp, row.bidPrices[i]]);
    }
    (priceSeries[3] as any).data.push([row.timestamp, row.midPrice]);
    for (let i = 0; i < row.askPrices.length; i++) {
      (priceSeries[i + 4] as any).data.push([row.timestamp, row.askPrices[i]]);
    }

    for (let i = 0; i < row.bidVolumes.length; i++) {
      (volumeSeries[2 - i] as any).data.push([row.timestamp, row.bidVolumes[i]]);
    }
    for (let i = 0; i < row.askVolumes.length; i++) {
      (volumeSeries[i + 3] as any).data.push([row.timestamp, -row.askVolumes[i]]);
    }
  }

  const options: Highcharts.Options = {
    yAxis: [
      {
        opposite: false,
        allowDecimals: false,
        height: '65%',
        title: { text: 'Price' },
      },
      {
        opposite: false,
        allowDecimals: false,
        top: '65%',
        height: '35%',
        offset: 0,
        title: { text: '↑ Bid Vol  |  Ask Vol ↓' },
        plotLines: [{ value: 0, width: 1, color: 'gray', zIndex: 5 }],
      },
    ],
  };

  return (
    <Chart
      title={`${symbol} - Price & Volume`}
      series={[...priceSeries, ...volumeSeries]}
      options={options}
      height={520}
    />
  );
}
