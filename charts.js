// FrenzySport - SVG Charting Engine (Zero Dependencies)

const Charts = {
  // Renders a beautiful vertical SVG bar chart
  renderBarChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 400;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find max value
    const maxVal = Math.max(...data.map(d => d.value), 100);

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'svg-chart');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Gradients Definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="chartBarGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent-cyan)" />
        <stop offset="100%" stop-color="var(--accent-blue)" />
      </linearGradient>
    `;
    svg.appendChild(defs);

    // Draw Grid Lines & Y Axis Labels
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = Math.round((maxVal / yTicks) * i);
      const y = padding.top + chartHeight - (chartHeight / yTicks) * i;

      // Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'chart-axis-line');
      line.setAttribute('stroke', 'rgba(255,255,255,0.06)');
      svg.appendChild(line);

      // Text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('class', 'chart-axis-text');
      text.textContent = val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}k` : val;
      svg.appendChild(text);
    }

    // Draw Bars
    const barWidth = (chartWidth / data.length) * 0.6;
    const barGap = (chartWidth / data.length) * 0.4;

    data.forEach((d, i) => {
      const barHeight = (d.value / maxVal) * chartHeight;
      const x = padding.left + (barWidth + barGap) * i + barGap / 2;
      const y = padding.top + chartHeight - barHeight;

      // Group for hover tooltip
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.style.cursor = 'pointer';

      // Bar Rect
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', barWidth);
      rect.setAttribute('height', Math.max(barHeight, 2)); // Minimum height for visibility
      rect.setAttribute('fill', 'url(#chartBarGrad)');
      rect.setAttribute('rx', 4);
      rect.setAttribute('class', 'chart-bar');
      group.appendChild(rect);

      // Bar label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + barWidth / 2);
      text.setAttribute('y', padding.top + chartHeight + 18);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'chart-axis-text');
      text.textContent = d.label;
      svg.appendChild(text);

      // Tooltip Event listeners
      group.addEventListener('mouseenter', (e) => {
        this.showTooltip(container, e.clientX, e.clientY, `${d.label}: $${d.value.toLocaleString()}`);
      });
      group.addEventListener('mouseleave', () => {
        this.hideTooltip(container);
      });

      svg.appendChild(group);
    });

    container.appendChild(svg);
  },

  // Renders a modern horizontal metric listing with animated progress meters
  renderHorizontalProgressList(containerId, data, accentColorVar = 'var(--accent-purple)') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const maxVal = Math.max(...data.map(d => d.value), 1);

    const listWrapper = document.createElement('div');
    listWrapper.className = 'merch-order-list-panel';
    listWrapper.style.display = 'flex';
    listWrapper.style.flexDirection = 'column';
    listWrapper.style.gap = '14px';

    data.forEach(d => {
      const pct = Math.min((d.value / maxVal) * 100, 100);

      const row = document.createElement('div');
      row.className = 'stock-meter-container';
      row.innerHTML = `
        <div class="stock-labels">
          <span style="font-weight: 500; color: var(--text-primary);">${d.label}</span>
          <span style="font-weight: 700; color: ${accentColorVar};">${d.displayVal || ('$' + d.value.toLocaleString())}</span>
        </div>
        <div class="stock-bar-bg" style="height: 8px;">
          <div class="stock-bar-fill" style="width: 0%; background: ${accentColorVar}; height: 100%; border-radius: 4px;"></div>
        </div>
      `;
      listWrapper.appendChild(row);

      // Animate growth
      setTimeout(() => {
        const fill = row.querySelector('.stock-bar-fill');
        if (fill) fill.style.width = `${pct}%`;
      }, 50);
    });

    container.appendChild(listWrapper);
  },

  // Renders an SVG Donut chart showing distribution breakdown
  renderDonutChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = 200;
    const height = 200;
    const radius = 80;
    const strokeWidth = 14;
    const cx = width / 2;
    const cy = height / 2;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';
    svg.style.height = '180px';

    const colors = [
      'var(--accent-purple)',
      'var(--accent-cyan)',
      'var(--accent-orange)',
      'var(--accent-green)',
      'var(--accent-blue)'
    ];

    let accumulatedAngle = -90; // Start at top

    const circumference = 2 * Math.PI * radius;

    data.forEach((d, idx) => {
      const angle = total > 0 ? (d.value / total) * 360 : 0;
      const strokeDashArray = circumference;
      const strokeDashOffset = total > 0 ? circumference - (d.value / total) * circumference : circumference;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx);
      circle.setAttribute('cy', cy);
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', 'transparent');
      circle.setAttribute('stroke', colors[idx % colors.length]);
      circle.setAttribute('stroke-width', strokeWidth);
      circle.setAttribute('stroke-dasharray', strokeDashArray);
      circle.setAttribute('stroke-dashoffset', strokeDashOffset);
      circle.setAttribute('transform', `rotate(${accumulatedAngle} ${cx} ${cy})`);
      circle.style.transition = 'stroke-dashoffset 0.6s ease';
      circle.style.cursor = 'pointer';

      // Tooltip Event listeners
      circle.addEventListener('mouseenter', (e) => {
        const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : 0;
        this.showTooltip(container, e.clientX, e.clientY, `${d.label}: $${d.value.toLocaleString()} (${pct}%)`);
      });
      circle.addEventListener('mouseleave', () => {
        this.hideTooltip(container);
      });

      svg.appendChild(circle);
      accumulatedAngle += angle;
    });

    // Inner hole texts
    const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textVal.setAttribute('x', cx);
    textVal.setAttribute('y', cy + 4);
    textVal.setAttribute('text-anchor', 'middle');
    textVal.setAttribute('font-family', 'Outfit');
    textVal.setAttribute('font-weight', '700');
    textVal.setAttribute('font-size', '16px');
    textVal.setAttribute('fill', 'white');
    textVal.textContent = `$${total >= 1000000 ? (total/1000000).toFixed(1) + 'M' : total.toLocaleString()}`;
    svg.appendChild(textVal);

    const textLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textLabel.setAttribute('x', cx);
    textLabel.setAttribute('y', cy + 20);
    textLabel.setAttribute('text-anchor', 'middle');
    textLabel.setAttribute('font-size', '8px');
    textLabel.setAttribute('fill', 'var(--text-secondary)');
    textLabel.setAttribute('letter-spacing', '1px');
    textLabel.textContent = 'TOTAL VALUE';
    svg.appendChild(textLabel);

    container.appendChild(svg);

    // Create Legend alongside donut
    const legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.flexDirection = 'column';
    legend.style.gap = '8px';
    legend.style.marginTop = '12px';
    legend.style.fontSize = '0.8rem';

    data.forEach((d, idx) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '8px';
      item.innerHTML = `
        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${colors[idx % colors.length]}; display: inline-block;"></span>
        <span style="color: var(--text-secondary); flex: 1;">${d.label}</span>
        <span style="font-weight: 600;">$${d.value.toLocaleString()}</span>
      `;
      legend.appendChild(item);
    });
    container.appendChild(legend);
  },

  showTooltip(container, x, y, text) {
    let tooltip = container.querySelector('.chart-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      container.appendChild(tooltip);
    }
    tooltip.textContent = text;
    tooltip.style.display = 'block';

    const rect = container.getBoundingClientRect();
    const tooltipX = x - rect.left + 10;
    const tooltipY = y - rect.top - 35;

    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
  },

  hideTooltip(container) {
    const tooltip = container.querySelector('.chart-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
};

window.Charts = Charts;
