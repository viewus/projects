/* =========================================
   AR Plants — ECharts Module
   charts.js
   ========================================= */

'use strict';

const statsData = {
  plantsSold:      500,
  happyClients:    200,
  gardenProjects:  75,
  seedVarieties:   120
};

const chartInit = () => {
  if (typeof echarts === 'undefined') return;

  const green      = '#1B5E20';
  const greenMid   = '#2E7D32';
  const greenLight = '#A5D6A7';
  const brown      = '#6D4C41';
  const cream      = '#E8F5E9';

  /* --- Bar Chart (Growth Over Years) --- */
  const barEl = document.getElementById('barChart');
  if (barEl) {
    const bar = echarts.init(barEl);
    const barOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1B5E20',
        borderColor: '#A5D6A7',
        textStyle: { color: '#fff', fontFamily: 'Lato' },
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Plants Sold', 'Happy Clients'],
        top: 0,
        textStyle: { color: '#455A64', fontFamily: 'Lato', fontSize: 12 }
      },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '14%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
        axisLabel: { color: '#78909C', fontFamily: 'Lato', fontSize: 12 },
        axisLine: { lineStyle: { color: '#E8F5E9' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#78909C', fontFamily: 'Lato', fontSize: 11 },
        splitLine: { lineStyle: { color: '#F1F8E9' } }
      },
      series: [
        {
          name: 'Plants Sold',
          type: 'bar',
          data: [45, 80, 110, 170, 260, 380, 500],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: greenMid },
              { offset: 1, color: greenLight }
            ]),
            borderRadius: [6, 6, 0, 0]
          },
          barMaxWidth: 40
        },
        {
          name: 'Happy Clients',
          type: 'bar',
          data: [20, 35, 50, 80, 120, 165, 200],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: brown },
              { offset: 1, color: '#A1887F' }
            ]),
            borderRadius: [6, 6, 0, 0]
          },
          barMaxWidth: 40
        }
      ]
    };
    bar.setOption(barOption);
    window.addEventListener('resize', () => bar.resize());
  }

  /* --- Pie Chart (Plant Categories) --- */
  const pieEl = document.getElementById('pieChart');
  if (pieEl) {
    const pie = echarts.init(pieEl);
    const pieOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: '#1B5E20',
        borderColor: '#A5D6A7',
        textStyle: { color: '#fff', fontFamily: 'Lato' }
      },
      legend: {
        orient: 'vertical',
        right: '4%',
        top: 'center',
        textStyle: { color: '#455A64', fontFamily: 'Lato', fontSize: 12 }
      },
      series: [
        {
          name: 'Plant Categories',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 3 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 'bold', fontFamily: 'Playfair Display' }
          },
          data: [
            { value: 210, name: 'Indoor Plants',  itemStyle: { color: green } },
            { value: 140, name: 'Outdoor Plants', itemStyle: { color: greenMid } },
            { value:  80, name: 'Rare Plants',    itemStyle: { color: brown } },
            { value: 120, name: 'Seeds',          itemStyle: { color: greenLight } }
          ]
        }
      ]
    };
    pie.setOption(pieOption);
    window.addEventListener('resize', () => pie.resize());
  }
};

document.addEventListener('DOMContentLoaded', chartInit);
