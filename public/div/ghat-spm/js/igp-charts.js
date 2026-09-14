// ════════════════════════════════════════
// IGP SPM CHARTS — Speed, OHE, Deceleration
// ════════════════════════════════════════

var chartInstances = {};

/**
 * Render all analysis charts
 * @param {Array} data - trip data rows
 * @param {Array} halts - detected halts
 * @param {Array|null} psrSegments - PSR data from buildTripPSR()
 * @param {Array|null} stationMarkers - station positions from buildStationMarkers()
 * @param {Array|null} signalMarkers - signal positions from buildTripSignals()
 * @param {Array|null} ghatMarkers - DN ghat markers from buildGhatMarkers() (drawn on the OHE chart)
 */
function renderCharts(data, halts, psrSegments, stationMarkers, signalMarkers, ghatMarkers) {
    // Destroy existing
    Object.values(chartInstances).forEach(function(c) { c.destroy() });
    chartInstances = {};

    // Downsample for performance (max 2000 points)
    var step = Math.max(1, Math.floor(data.length / 2000));
    var s = data.filter(function(_, i) { return i % step === 0 });

    var dl = s.map(function(r) { return r.cumDistKm.toFixed(2) });
    var tl = s.map(function(r) { return r.time });
    var sp = s.map(function(r) { return r.speed });

    renderSpeedDistChart(dl, sp, psrSegments, stationMarkers, signalMarkers);
    renderSpeedTimeChart(tl, sp);
    renderOHEChart(dl, sp, s, ghatMarkers);
    renderDecelerationChart(data, halts);
}

// ── Base chart options factory ──
function baseOpt(xl, yl) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { labels: { color: '#cbd5e1', font: { size: 11 }, boxWidth: 12 } }
        },
        scales: {
            x: {
                title: { display: true, text: xl, color: '#94a3b8' },
                ticks: { color: '#7a8ba8', maxTicksLimit: 15, font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.07)' }
            },
            y: {
                title: { display: true, text: yl, color: '#94a3b8' },
                ticks: { color: '#7a8ba8', font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.07)' },
                beginAtZero: true
            }
        }
    };
}

// ── 1. Speed vs Distance (Banking Profile) with PSR, Station & Signal markers ──
function renderSpeedDistChart(dl, sp, psrSegments, stationMarkers, signalMarkers) {
    var datasets = [];

    // PSR area (green, behind speed line)
    if (psrSegments && psrSegments.length) {
        var psrValues = getPSRForChart(dl, psrSegments);
        if (psrValues) {
            datasets.push({
                label: 'PSR/MPS Limit',
                data: psrValues,
                borderColor: 'rgba(74, 222, 128, 0.6)',
                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                borderWidth: 1,
                pointRadius: 0,
                fill: true,
                stepped: true,
                tension: 0,
                order: 2
            });
        }
    }

    // Speed line (blue, on top)
    datasets.push({
        label: 'Speed',
        data: sp,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.05)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.1,
        order: 1
    });

    // Combined marker plugin — draws signals (red) and stations (thicker red)
    var markerPlugin = {
        id: 'chartMarkers',
        afterDraw: function(chart) {
            var ctx = chart.ctx;
            var xScale = chart.scales.x;
            var chartArea = chart.chartArea;

            // Helper: find pixel X for a trip distance
            function getPixelX(tripDist) {
                var minDiff = Infinity, bestIdx = 0;
                for (var i = 0; i < dl.length; i++) {
                    var diff = Math.abs(parseFloat(dl[i]) - tripDist);
                    if (diff < minDiff) { minDiff = diff; bestIdx = i; }
                }
                return xScale.getPixelForValue(bestIdx);
            }

            // Signal markers: faint dotted full-height line, small rotated label at the TOP
            if (signalMarkers && signalMarkers.length) {
                signalMarkers.forEach(function(sig) {
                    var px = getPixelX(sig.tripDist);
                    if (px < chartArea.left || px > chartArea.right) return;

                    var color, labelColor;
                    var name = sig.name.toUpperCase();
                    if (name.indexOf('ADV') !== -1) {
                        color = 'rgba(245, 158, 11, 0.7)'; labelColor = 'rgba(245, 158, 11, 0.95)';   // Amber - Adv Starter
                    } else if (name.indexOf('DIST') !== -1) {
                        color = 'rgba(132, 204, 22, 0.7)'; labelColor = 'rgba(132, 204, 22, 0.95)';   // Lime - Distant
                    } else if (/\bH\b/.test(name) || name.indexOf('H S-') !== -1) {
                        color = 'rgba(239, 68, 68, 0.7)';  labelColor = 'rgba(239, 68, 68, 0.95)';    // Red - Home
                    } else if (name.indexOf('BKR') !== -1) {
                        color = 'rgba(34, 211, 238, 0.7)'; labelColor = 'rgba(34, 211, 238, 0.95)';   // Cyan - Banker start
                    } else {
                        color = 'rgba(234, 179, 8, 0.7)';  labelColor = 'rgba(234, 179, 8, 0.95)';    // Yellow - Starter/others
                    }

                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1.2;
                    ctx.setLineDash([4, 3]);
                    ctx.moveTo(px, chartArea.top);
                    ctx.lineTo(px, chartArea.bottom);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Label hangs down from the top edge, rotated
                    ctx.fillStyle = labelColor;
                    ctx.font = '500 8px "Plus Jakarta Sans", sans-serif';
                    ctx.textAlign = 'right';
                    ctx.translate(px - 2, chartArea.top + 3);
                    ctx.rotate(-Math.PI / 2);
                    ctx.fillText(sig.name, 0, 0);
                    ctx.restore();
                });
            }

            // Station markers: blue dot on the x axis with the name beside it (no line)
            if (stationMarkers && stationMarkers.length) {
                stationMarkers.forEach(function(stn) {
                    var px = getPixelX(stn.tripDist);
                    if (px < chartArea.left || px > chartArea.right) return;
                    var py = chartArea.bottom;

                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(px, py, 5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(96, 165, 250, 0.95)';
                    ctx.fill();
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = 'rgba(12, 18, 34, 0.9)';
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(96, 165, 250, 0.95)';
                    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(stn.name, px, py - 8);
                    ctx.restore();
                });
            }
        }
    };

    chartInstances.sd = new Chart(document.getElementById('chartSpeedDist'), {
        type: 'line',
        data: { labels: dl, datasets: datasets },
        options: baseOpt('Distance (km)', 'Speed (kmph)'),
        plugins: [markerPlugin]
    });
}

// ── 2. Speed vs Time ──
function renderSpeedTimeChart(tl, sp) {
    chartInstances.st = new Chart(document.getElementById('chartSpeedTime'), {
        type: 'line',
        data: {
            labels: tl,
            datasets: [{
                label: 'Speed', data: sp,
                borderColor: '#c084fc', backgroundColor: 'rgba(192,132,252,0.08)',
                borderWidth: 1.5, pointRadius: 0, fill: true, tension: 0.1
            }]
        },
        options: baseOpt('Time', 'Speed (kmph)')
    });
}

// ── 3. Speed & OHE Parameters ──
function renderOHEChart(dl, sp, sampled, ghatMarkers) {
    // Ghat marker plugin (DN only): orange dashed full-height lines, label at top.
    // Lives on this chart because GR-0 is checked against the Amps trace.
    var ghatPlugin = {
        id: 'ghatMarkers',
        afterDraw: function(chart) {
            if (!ghatMarkers || !ghatMarkers.length) return;
            var ctx = chart.ctx, xScale = chart.scales.x, area = chart.chartArea;
            ghatMarkers.forEach(function(g) {
                var minDiff = Infinity, best = 0;
                for (var i = 0; i < dl.length; i++) {
                    var diff = Math.abs(parseFloat(dl[i]) - g.tripDist);
                    if (diff < minDiff) { minDiff = diff; best = i; }
                }
                var px = xScale.getPixelForValue(best);
                if (px < area.left || px > area.right) return;
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(234, 88, 12, 0.9)';
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.moveTo(px, area.top);
                ctx.lineTo(px, area.bottom);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = 'rgba(234, 88, 12, 0.95)';
                ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
                ctx.textAlign = 'right';
                ctx.translate(px - 3, area.top + 4);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(g.name, 0, 0);
                ctx.restore();
            });
        }
    };

    chartInstances.ohe = new Chart(document.getElementById('chartOHE'), {
        type: 'line',
        data: {
            labels: dl,
            datasets: [
                {
                    label: 'Speed', data: sp,
                    borderColor: '#f87171', borderWidth: 1.5, pointRadius: 0,
                    yAxisID: 'y', tension: 0.1
                },
                {
                    label: 'OHE kV',
                    data: sampled.map(function(r) { return r.oheKV }),
                    borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)',
                    borderWidth: 1, pointRadius: 0, fill: true,
                    yAxisID: 'y1', tension: 0.1
                },
                {
                    label: 'Amps',
                    data: sampled.map(function(r) { return r.amps }),
                    borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.08)',
                    borderWidth: 1, pointRadius: 0, fill: true,
                    yAxisID: 'y2', tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { color: '#cbd5e1', font: { size: 11 }, boxWidth: 12 } }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Distance (km)', color: '#94a3b8' },
                    ticks: { color: '#7a8ba8', maxTicksLimit: 15, font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.07)' }
                },
                y: {
                    type: 'linear', position: 'left',
                    title: { display: true, text: 'Speed', color: '#f87171' },
                    ticks: { color: '#f87171', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.07)' },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear', position: 'right',
                    title: { display: true, text: 'OHE kV', color: '#34d399' },
                    ticks: { color: '#34d399', font: { size: 10 } },
                    grid: { display: false },
                    min: 18, max: 30
                },
                y2: {
                    type: 'linear', position: 'right',
                    title: { display: true, text: 'Amps', color: '#fbbf24' },
                    ticks: { color: '#fbbf24', font: { size: 10 } },
                    grid: { display: false }
                }
            }
        },
        plugins: [ghatPlugin]
    });
}

// ── 4. Deceleration Profile (Speed Ahead of Halts) ──
function renderDecelerationChart(data, halts) {
    var wrap = document.getElementById('haltChartWrap');

    if (!halts.length) {
        wrap.innerHTML = '<div style="display:grid;place-items:center;height:320px;color:var(--text-dim)">No halts - no deceleration chart</div>';
        return;
    }

    // Ensure canvas exists
    if (!document.getElementById('chartHalts')) {
        wrap.innerHTML = '<canvas id="chartHalts"></canvas>';
    }

    var hds = [];
    var colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#c084fc', '#fb923c', '#67e8f9', '#f472b6'];

    halts.slice(0, 8).forEach(function(halt, idx) {
        var td = halt.dist - 1.2; // Start 1200m before halt
        var pts = [];
        for (var j = Math.max(0, halt.dataIndex - 400); j <= halt.dataIndex; j++) {
            if (data[j].cumDistKm >= td) {
                pts.push({
                    x: Math.round((halt.dist - data[j].cumDistKm) * 1000),
                    y: data[j].speed
                });
            }
        }
        hds.push({
            label: 'Halt ' + halt.num + ' @' + halt.time,
            data: pts,
            borderColor: colors[idx % colors.length],
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            tension: 0.2
        });
    });

    chartInstances.hl = new Chart(document.getElementById('chartHalts'), {
        type: 'scatter',
        data: { datasets: hds },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#cbd5e1', font: { size: 10 }, boxWidth: 10 } }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Distance to Halt (m)', color: '#94a3b8' },
                    ticks: { color: '#7a8ba8', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.07)' },
                    reverse: true
                },
                y: {
                    title: { display: true, text: 'Speed (kmph)', color: '#94a3b8' },
                    ticks: { color: '#7a8ba8', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.07)' },
                    beginAtZero: true
                }
            }
        }
    });
}
