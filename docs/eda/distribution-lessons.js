(() => {
  const deck = document.querySelector('.distribution-deck');
  const slideList = [...deck.querySelectorAll('.slide')];
  const printRange = new URLSearchParams(location.search);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const data = JSON.parse(document.querySelector('#lesson-data').textContent);
  const charts = new Map();
  const navy = '#074c8c';
  const coral = '#dc6254';
  const light = '#b6d2ea';
  const number = (x, digits = 2) => Number(x.toFixed(digits)).toLocaleString('ko-KR');

  Chart.defaults.font.family = 'Paperlogy, Malgun Gothic, sans-serif';
  Chart.defaults.color = '#3c5570';

  // Print and reading mode share the same figures as presentation mode.
  function draw(canvas, animate) {
    const spec = data[canvas.dataset.chart];
    const scatter = spec.kind === 'qq' || spec.kind === 'dot';
    const qq = spec.kind === 'qq';
    const stacked = spec.kind === 'stacked';
    const compact = canvas.closest('.compact-plots');
    const pointRadius = spec.points?.length > 30 ? 2.1 : 4;
    const title = text => ({ display: !!text, text, font: { size: compact ? 10 : 12, weight: 'bold' } });
    const unit = spec.unit || (stacked ? '%' : '건');
    let datasets;
    if (scatter) {
      datasets = [{ label: '관측값', data: spec.points, pointRadius: c => c.raw?.label ? 5 : pointRadius,
        pointHoverRadius: 6, backgroundColor: c => c.raw?.label ? coral : navy }];
      if (spec.line) datasets.push({ label: '중심부 기준선', data: spec.line, showLine: true, pointRadius: 0,
        pointHitRadius: 0, borderColor: '#66809c', borderDash: [5, 4], borderWidth: 1.4, order: 1 });
    } else {
      datasets = [{ label: spec.labels?.[0] || '지연', data: spec.late, backgroundColor: coral, maxBarThickness: 86, borderRadius: stacked ? 0 : 5 }];
      if (spec.second) datasets.push({ label: spec.labels?.[1] || '정시', data: spec.second, backgroundColor: light, maxBarThickness: 86, borderRadius: stacked ? 0 : 5 });
    }

    const axisX = { title: title(spec.x), ticks: { maxTicksLimit: 7, maxRotation: 0 }, grid: { color: '#e8eff7' } };
    if (scatter) Object.assign(axisX, { type: 'linear', min: spec.xmin, max: spec.xmax });
    const axisY = { display: spec.kind !== 'dot', title: title(spec.y), beginAtZero: !scatter,
      min: spec.ymin, max: stacked ? 100 : spec.ymax, ticks: { maxTicksLimit: 5, precision: scatter ? undefined : 0 }, grid: { color: '#e8eff7' } };
    if (stacked) { axisX.stacked = true; axisY.stacked = true; axisY.ticks.callback = x => `${x}%`; }

    const labels = {
      id: 'lessonLabels',
      beforeDatasetsDraw(chart) {
        if (!spec.guides) return;
        const { ctx, chartArea, scales } = chart;
        ctx.save();
        for (const { axis, values } of spec.guides) {
          ctx.strokeStyle = axis === 'horizontal' ? '#af685e' : coral;
          ctx.setLineDash(axis === 'horizontal' ? [3, 4] : []);
          if (axis === 'horizontal') {
            for (const value of values) {
              const y = scales.y.getPixelForValue(value);
              ctx.beginPath();
              ctx.moveTo(chartArea.left, y);
              ctx.lineTo(chartArea.right, y);
              ctx.stroke();
            }
          } else {
            ctx.beginPath();
            values.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](scales.x.getPixelForValue(x), scales.y.getPixelForValue(y)));
            ctx.stroke();
          }
        }
        ctx.restore();
      },
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.font = `700 ${compact ? 10 : 12}px Paperlogy, sans-serif`;
        ctx.textBaseline = 'middle';
        chart.getDatasetMeta(0).data.forEach((mark, i) => {
          const label = scatter ? spec.points[i].label : `${spec.late[i]}${unit}`;
          if (!label || !Number.isFinite(mark.x) || !Number.isFinite(mark.y)) return;
          ctx.fillStyle = stacked ? '#301711' : '#8f3228';
          ctx.textAlign = 'center';
          const width = ctx.measureText(label).width / 2 + 3;
          const x = Math.max(chartArea.left + width, Math.min(chartArea.right - width, mark.x));
          const y = stacked ? (mark.y + mark.base) / 2 : Math.max(chartArea.top - 7, mark.y - 13);
          ctx.fillText(label, x, y);
        });
        ctx.restore();
      }
    };
    const chart = new Chart(canvas, {
      type: scatter ? 'scatter' : 'bar', data: { labels: scatter ? undefined : ['빠른배송', '일반배송'], datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: !animate || reduced.matches ? false : { duration: 350 },
        layout: { padding: { top: 12, right: 5 } }, scales: { x: axisX, y: axisY },
        plugins: { legend: { display: !scatter && !!spec.second && !compact, labels: { boxWidth: 12 } },
          tooltip: { filter: item => !scatter || item.datasetIndex === 0, callbacks: {
            label: c => qq ? `이론 분위수 ${number(c.parsed.x, 4)} · 관측값 ${number(c.parsed.y)}` :
              scatter ? `${number(c.parsed.x)}분` : `${c.dataset.label} ${number(c.parsed.y)}${unit}`
          } } }
      }, plugins: [labels]
    });
    charts.set(canvas, chart);
  }

  function showCharts(slides, animate = true) {
    for (const slide of slides) {
      for (const canvas of slide.querySelectorAll('canvas[data-chart]')) {
        if (charts.has(canvas)) charts.get(canvas).resize();
        else draw(canvas, animate);
      }
    }
  }
  function renderVisible() {
    const reading = deck.classList.contains('reading-mode');
    showCharts(reading ? slideList : slideList.filter(s => s.classList.contains('active')), !reading);
  }
  const observer = new MutationObserver(() => requestAnimationFrame(renderVisible));
  observer.observe(deck, { attributes: true, attributeFilter: ['class'] });
  slideList.forEach(s => observer.observe(s, { attributes: true, attributeFilter: ['class'] }));
  requestAnimationFrame(renderVisible);
  document.fonts.ready.then(() => charts.forEach(chart => chart.update('none')));

  const fullscreen = document.querySelector('[data-action="fullscreen"]');
  document.addEventListener('fullscreenchange', () => {
    const active = !!document.fullscreenElement;
    fullscreen.setAttribute('aria-pressed', String(active));
    fullscreen.textContent = active ? '전체화면 해제' : '화면 전체보기';
  });
  for (const button of deck.querySelectorAll('[data-open-dialog]')) {
    const dialog = document.getElementById(button.dataset.openDialog);
    button.addEventListener('click', () => dialog.showModal());
    dialog.addEventListener('close', () => button.focus());
    dialog.addEventListener('keydown', e => e.stopPropagation());
  }

  let openedAnswers = [];
  addEventListener('beforeprint', () => {
    const first = Number(printRange.get('from')) || 1;
    const last = Number(printRange.get('to')) || slideList.length;
    slideList.forEach((slide, i) => { slide.dataset.skipPrint = String(i + 1 < first || i + 1 > last); });
    const printedSlides = slideList.filter(s => s.dataset.skipPrint !== 'true');
    openedAnswers = printedSlides.flatMap(s => [...s.querySelectorAll('details:not([open])')]);
    openedAnswers.forEach(d => { d.open = true; });
    showCharts(printedSlides, false);
    charts.forEach((chart, canvas) => {
      if (canvas.closest('.slide').dataset.skipPrint === 'true') return;
      chart.stop();
      chart.resize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
      chart.update('none');
    });
  });
  addEventListener('afterprint', () => {
    openedAnswers.forEach(d => { d.open = false; });
    slideList.forEach(s => { delete s.dataset.skipPrint; });
    requestAnimationFrame(renderVisible);
  });
})();
