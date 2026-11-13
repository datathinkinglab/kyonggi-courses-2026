(() => {
  const canvases = [...document.querySelectorAll('canvas[data-chart]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const navy = '#173761';
  const blue = '#285eca';
  const red = '#b04434';
  const ink = '#142640';
  const percent = (n) => `${Number(n).toLocaleString('ko-KR', {maximumFractionDigits: 1})}%`;

  function drawLabels(chart) {
    const {ctx} = chart;
    const kind = chart.canvas.dataset.chart;
    ctx.save();
    ctx.font = '700 12px Paperlogy, sans-serif';
    ctx.textBaseline = 'middle';
    chart.data.datasets.forEach((dataset, series) => {
      chart.getDatasetMeta(series).data.forEach((bar, i) => {
        const value = dataset.data[i];
        if (kind === 'waterfall') {
          const labels = ['10.0%', '−1.5%p', '−0.5%p', '8.0%'];
          ctx.textAlign = 'center';
          ctx.fillStyle = i === 1 || i === 2 ? red : ink;
          ctx.fillText(labels[i], bar.x, Math.min(bar.y, bar.base) - 10);
          if (i < 3) {
            const next = chart.getDatasetMeta(series).data[i + 1];
            const level = i === 0 ? bar.y : Math.max(bar.base, bar.y);
            ctx.strokeStyle = '#7589a5';
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(bar.x + bar.width / 2, level);
            ctx.lineTo(next.x - next.width / 2, level);
            ctx.stroke();
          }
        } else if (kind === 'mix') {
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fff';
          ctx.fillText(percent(value), (bar.x + bar.base) / 2, bar.y);
        } else {
          ctx.fillStyle = ink;
          ctx.textAlign = value < 0 ? 'right' : 'left';
          ctx.fillText((kind === 'change' && value > 0 ? '+' : '') + percent(value),
            bar.x + (value < 0 ? -6 : 6), bar.y);
        }
      });
    });
    ctx.restore();
  }

  function configuration(kind) {
    const waterfall = kind === 'waterfall';
    const mix = kind === 'mix';
    const change = kind === 'change';
    const labels = {
      waterfall: ['전기', ['매출', '원가율'], ['판매', '관리비율'], '당기'],
      mix: ['전기', '당기'],
      change: ['매출액', '영업이익'],
      trend: ['전기', '당기'],
      peers: ['가온생활', '나래생활']
    }[kind];
    const values = {
      waterfall: [[0, 10], [8.5, 10], [8, 8.5], [0, 8]],
      change: [20, -4],
      trend: [10, 8],
      peers: [8, 9]
    };
    const datasets = mix
      ? [{label: '제품 A', data: [50, 42.5], backgroundColor: blue},
        {label: '제품 B', data: [50, 57.5], backgroundColor: navy}]
      : [{data: values[kind], backgroundColor: waterfall ? [blue, red, red, navy]
        : change ? [blue, red] : [blue, navy]}];
    const numberAxis = {
      min: change ? -10 : 0,
      max: mix ? 100 : change ? 25 : waterfall ? 12 : 10,
      stacked: mix,
      ticks: {stepSize: mix ? 25 : change ? 5 : 2, callback: percent}
    };
    const categoryAxis = {stacked: mix, grid: {display: false}, ticks: {autoSkip: false}};
    return {
      type: 'bar',
      data: {labels, datasets: datasets.map(dataset => ({
        ...dataset, borderRadius: 4, maxBarThickness: waterfall ? 66 : 32,
        hoverBackgroundColor: mix ? (dataset.label === '제품 A' ? '#204dad' : '#0b2147') : undefined
      }))},
      options: {
        indexAxis: waterfall ? 'x' : 'y',
        maintainAspectRatio: false,
        animation: motion.matches ? false : {duration: 550},
        layout: {padding: {top: 6, left: 6, right: mix ? 8 : 34}},
        scales: waterfall ? {x: categoryAxis, y: numberAxis} : {x: numberAxis, y: categoryAxis},
        plugins: {
          legend: {display: mix, labels: {boxWidth: 12}},
          tooltip: {callbacks: {label: ({dataset, raw, dataIndex}) => waterfall
            ? ['전기 10.0%', '매출원가율 기여 −1.5%p', '판매관리비율 기여 −0.5%p', '당기 8.0%'][dataIndex]
            : `${dataset.label ? dataset.label + ' ' : ''}${percent(raw)}`}}
        }
      },
      plugins: [{id: 'lecture-value-labels', afterDatasetsDraw: drawLabels}]
    };
  }

  function renderVisible() {
    if (!window.Chart) return;
    Chart.defaults.font.family = 'Paperlogy, Malgun Gothic, sans-serif';
    Chart.defaults.color = ink;
    canvases.forEach((canvas) => {
      if (!canvas.getClientRects().length) return;
      const chart = Chart.getChart(canvas);
      if (chart) chart.resize();
      else new Chart(canvas, configuration(canvas.dataset.chart));
    });
  }

  const observer = new MutationObserver(renderVisible);
  document.querySelectorAll('.slide').forEach((slide) => {
    observer.observe(slide, {attributes: true, attributeFilter: ['hidden']});
  });
  addEventListener('beforeprint', () => {
    renderVisible();
    canvases.forEach((canvas) => {
      const chart = Chart.getChart(canvas);
      if (chart) {
        chart.stop();
        chart.update('none');
      }
    });
  });
  addEventListener('afterprint', renderVisible);
  motion.addEventListener('change', () => {
    canvases.forEach((canvas) => {
      const chart = Chart.getChart(canvas);
      if (chart) {
        chart.options.animation = motion.matches ? false : {duration: 550};
        chart.update('none');
      }
    });
  });
  document.fonts.ready.then(renderVisible);
})();
