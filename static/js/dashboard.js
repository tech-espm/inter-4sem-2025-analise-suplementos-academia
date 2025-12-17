"use strict";

const state = {
    produtos: [],
    categorias: [],
    formatos: [],
    charts: {}
};

function safeNumber(v, def = 0) { return v === null || v === undefined ? def : Number(v); }

async function carregarDados() {
    const resp = await fetch('/obterDados');
    if (!resp.ok) throw new Error('Erro ao obter produtos: ' + resp.status);
    const dados = await resp.json();
    state.produtos = dados;

    const catSet = new Set();
    const formSet = new Set();
    dados.forEach(p => {
        if (p.categorias) {
            p.categorias.split(',').map(s => s.trim()).forEach(c => { if (c) catSet.add(c); })
        }
        if (p.formato) formSet.add(p.formato);
    });
    state.categorias = Array.from(catSet).sort();
    state.formatos = Array.from(formSet).sort();

    popularFiltros();
    state.loaded = true;
}

function popularFiltros() {
    const sel = document.getElementById('category-filter');
    sel.innerHTML = '<option value="">Todas</option>' + state.categorias.map(c => `<option value="${c}">${c}</option>`).join('\n');

    const priceSel = document.getElementById('price-filter');
    if (priceSel) {
        const currentPrice = priceSel.value;
        priceSel.innerHTML = '';
        const ranges = [{ k: '', t: 'Todas' }, { k: '0-50', t: 'R$ 0 - R$ 50' }, { k: '50-100', t: 'R$ 50 - 100' }, { k: '100-200', t: 'R$ 100 - 200' }, { k: '200+', t: '> R$ 200' }];
        priceSel.innerHTML = ranges.map(r => `<option value="${r.k}">${r.t}</option>`).join('');
        if (currentPrice) priceSel.value = currentPrice;
    }
}

function aplicarFiltros(produtos) {
    const cat = document.getElementById('category-filter')?.value || '';
    const price = document.getElementById('price-filter')?.value || '';

    return produtos.filter(p => {
        if (cat) {
            const cats = (p.categorias || '').split(',').map(s => s.trim());
            if (!cats.includes(cat)) return false;
        }
        const preco = safeNumber(p.preco);
        if (price === '0-50' && !(preco >= 0 && preco <= 50)) return false;
        if (price === '50-100' && !(preco > 50 && preco <= 100)) return false;
        if (price === '100-200' && !(preco > 100 && preco <= 200)) return false;
        if (price === '200+' && !(preco > 200)) return false;
        return true;
    });
}

function gerarPaleta(chaves) {
    const cores = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
    const map = {};
    chaves.forEach((k, i) => map[k] = cores[i % cores.length]);
    return map;
}

function criarScatterQualidadeVolume(produtos) {
    const canvas = document.getElementById('grafico-qualidade-volume');
    if (!canvas) return;
    canvas.classList.add('chart-canvas');

    const grupos = {};
    produtos.forEach(p => {
        const cat = (p.categorias || '').split(',')[0]?.trim() || p.formato || 'Sem categoria';
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(p);
    });

    const paleta = gerarPaleta(Object.keys(grupos));
    const datasets = Object.keys(grupos).map(k => {
        const map = {};
        grupos[k].forEach(p => {
            const x = Math.log10((safeNumber(p.avaliacoes) || 0) + 1);
            const y = safeNumber(p.estrelas_media);
            const key = `${x.toFixed(3)}|${y.toFixed(3)}`;
            if (!map[key]) map[key] = { x, y, r: 6, produtos: [] };
            map[key].produtos.push(p.nome || p.titulo || p.nome_produto || '');
        });
        const data = Object.values(map).map(pt => ({ x: pt.x, y: pt.y, r: pt.r, produto: pt.produtos.filter(Boolean).join(', ') }));
        return { label: k, data, backgroundColor: paleta[k] };
    });

    if (state.charts.qualidadeVolume) state.charts.qualidadeVolume.destroy();
    const ctx = canvas.getContext('2d');
    state.charts.qualidadeVolume = new Chart(ctx, {
        type: 'bubble',
        data: { datasets },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        title: (items) => items && items.length ? items[0].dataset.label : '',
                        label: (context) => {
                            const raw = context.raw || {};
                            const nome = raw.produto || '';
                            return nome ? [`${nome}`, `Avaliações (log): ${context.parsed.x.toFixed(2)}`, `Média: ${context.parsed.y}`] : [`x: ${context.parsed.x}`, `y: ${context.parsed.y}`];
                        }
                    }
                }
            },
            onHover: (evt, active) => { if (evt && evt.native) evt.native.target.style.cursor = active && active.length ? 'pointer' : 'default'; },
            scales: {
                x: { title: { display: true, text: 'log10(Total avaliações + 1)' } },
                y: { title: { display: true, text: 'Média de Estrelas' }, min: 3.8, max: 5 }
            }
        }
    });
}

function criarDistribuicaoAvaliacoes(produtos) {
    const canvas = document.getElementById('grafico-distribuicao-avaliacoes');
    if (!canvas) return;
    canvas.classList.add('chart-canvas');

    const mapa = {};
    produtos.forEach(p => {
        const cats = (p.categorias || '').split(',').map(s => s.trim()).filter(Boolean);
        const targetCats = cats.length ? cats : [p.formato || 'Sem categoria'];
        targetCats.forEach(c => {
            if (!mapa[c]) mapa[c] = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            mapa[c][5] += safeNumber(p.estrelas_5);
            mapa[c][4] += safeNumber(p.estrelas_4);
            mapa[c][3] += safeNumber(p.estrelas_3);
            mapa[c][2] += safeNumber(p.estrelas_2);
            mapa[c][1] += safeNumber(p.estrelas_1);
        });
    });

    const categorias = Object.keys(mapa);
    const paleta = gerarPaleta(categorias);

    const labels = categorias;
    const dataSets = [5, 4, 3, 2, 1].map(star => ({
        label: `${star}★`,
        data: categorias.map(c => Math.round(mapa[c][star] || 0)),
        backgroundColor: { 5: '#1cc88a', 4: '#36a2eb', 3: '#ffc107', 2: '#ff9f40', 1: '#d9534f' }[star]
    }));

    const totals = categorias.map(c => [5, 4, 3, 2, 1].reduce((s, st) => s + Math.round(mapa[c][st] || 0), 0));
    const maxTotal = totals.length ? Math.max(...totals) : 1;

    if (state.charts.distribuicaoAvaliacoes) state.charts.distribuicaoAvaliacoes.destroy();
    const ctx = canvas.getContext('2d');
    state.charts.distribuicaoAvaliacoes = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: dataSets },
        options: {
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: (context) => {
                            const idx = context.dataIndex;
                            const valRaw = (context.dataset && context.dataset.data && context.dataset.data[idx]) || context.parsed.y || 0;
                            const val = Math.round(valRaw);
                            return `${context.dataset.label}: ${val.toLocaleString('pt-BR')}`;
                        }
                    }
                }
            },
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, suggestedMax: Math.max(1, Math.ceil(maxTotal)), ticks: { stepSize: 1, callback: v => Math.round(v).toString() } } },
            maintainAspectRatio: false,
            responsive: true
        }
    });
}

function criarScatterPrecoPercepcao(produtos) {
    const canvas = document.getElementById('grafico-preco-percepcao');
    if (!canvas) return;
    canvas.classList.add('chart-canvas');

    const grupos = {};
    produtos.forEach(p => {
        const cat = (p.categorias || '').split(',')[0]?.trim() || p.formato || 'Sem categoria';
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(p);
    });
    const paleta = gerarPaleta(Object.keys(grupos));
    const datasets = Object.keys(grupos).map(k => {
        const map = {};
        grupos[k].forEach(p => {
            const x = safeNumber(p.preco);
            const y = safeNumber(p.estrelas_media);
            const key = `${x.toFixed(2)}|${y.toFixed(3)}`;
            if (!map[key]) map[key] = { x, y, r: 6, produtos: [] };
            map[key].produtos.push(p.nome || p.titulo || p.nome_produto || '');
        });
        const data = Object.values(map).map(pt => ({ x: pt.x, y: pt.y, r: pt.r, produto: pt.produtos.filter(Boolean).join(', ') }));
        return { label: k, data, backgroundColor: paleta[k] };
    });

    if (state.charts.precoPercepcao) state.charts.precoPercepcao.destroy();
    const ctx = canvas.getContext('2d');
    state.charts.precoPercepcao = new Chart(ctx, {
        type: 'bubble',
        data: { datasets },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        title: (items) => items && items.length ? items[0].dataset.label : '',
                        label: (context) => {
                            const raw = context.raw || {};
                            const nome = raw.produto || '';
                            return nome ? [`${nome}`, `Preço: R$ ${context.parsed.x}`, `Média: ${context.parsed.y}`] : [`x: ${context.parsed.x}`, `y: ${context.parsed.y}`];
                        }
                    }
                }
            },
            onHover: (evt, active) => { if (evt && evt.native) evt.native.target.style.cursor = active && active.length ? 'pointer' : 'default'; },
            scales: { x: { title: { display: true, text: 'Preço Unitário (R$)' } }, y: { title: { display: true, text: 'Média de Estrelas' }, min: 3.8, max: 5 } }
        }
    });
}

function criarComparacaoFormatos(produtos) {
    const container = document.getElementById('div-comparacao-formatos');
    container.innerHTML = '';

    const formatos = {};
    produtos.forEach(p => {
        const f = p.formato || 'Sem formato';
        formatos[f] = formatos[f] || [];
        formatos[f].push(safeNumber(p.estrelas_media));
    });


    const keys = Object.keys(formatos).sort();
    if (!keys.length) return;

    const containerWidth = Math.max(container.clientWidth || 900, 600);
    const containerHeight = Math.max(container.clientHeight || 220, 180);
    const padLeft = 36, padRight = 20;
    const padTop = 6, padBottom = 44;
    const n = keys.length;
    const available = Math.max(0, containerWidth - padLeft - padRight);
    const slot = Math.max(80, Math.floor(available / n) || 80);
    const width = containerWidth;
    const height = containerHeight;

    const minY = 3.8, maxY = 5.0;
    const yScale = v => {
        const vv = Math.max(minY, Math.min(maxY, v));
        return padTop + ((maxY - vv) / (maxY - minY)) * (height - padTop - padBottom);
    };

    let svg = `
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="width:100%;height:100%;display:block" preserveAspectRatio="xMinYMid meet">
            <style> .axis { font-size: 11px; fill:#000; } .label-x { font-size: 10px; fill:#000; text-anchor:middle; } .freq { font-size:12px; fill:#000; font-weight:600; }</style>
    `;

    const steps = Math.round((maxY - minY) / 0.2);
    for (let i = 0; i <= steps; i++) {
        const v = +(minY + i * 0.2).toFixed(2);
        const y = yScale(v);
        svg += `<line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#eee" stroke-width="1" />`;
        svg += `<text x="${padLeft - 10}" y="${y + 4}" class="axis">${v.toFixed(1)}</text>`;
    }

    keys.forEach((k, i) => {
        const arr = formatos[k].slice().sort((a, b) => a - b);
        const count = arr.length;
        if (!count) return;
        const q1 = quantile(arr, 0.25);
        const med = quantile(arr, 0.5);
        const q3 = quantile(arr, 0.75);
        const min = arr[0];
        const max = arr[arr.length - 1];

        const cx = padLeft + i * slot + slot / 2;
        const boxW = Math.min(Math.floor(slot * 0.78), slot - 12);
        const x1 = cx - boxW / 2;

        svg += `<line x1="${cx}" y1="${yScale(min)}" x2="${cx}" y2="${yScale(q1)}" stroke="#666" stroke-width="1" />`;
        svg += `<line x1="${cx}" y1="${yScale(q3)}" x2="${cx}" y2="${yScale(max)}" stroke="#666" stroke-width="1" />`;

        const boxTop = yScale(q3);
        const boxHeight = Math.max(8, yScale(q1) - yScale(q3));
        svg += `<rect x="${x1}" y="${boxTop}" width="${boxW}" height="${boxHeight}" fill="#1f77b4" stroke="#165a8f" stroke-width="1" />`;

        svg += `<line x1="${x1}" y1="${yScale(med)}" x2="${x1 + boxW}" y2="${yScale(med)}" stroke="#000" stroke-width="2" />`;

        const maxLabel = (s, l = 16) => s.length > l ? s.slice(0, l - 1) + '…' : s;
        const labelText = maxLabel(k, 16);

        svg += `<text x="${cx}" y="${height - (padBottom / 2) - 6}" class="label-x"><title>${k}</title>${labelText}</text>`;
        svg += `<text x="${cx}" y="${height - (padBottom / 2) + 10}" class="freq">n=${count}</text>`;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
}

function quantile(sorted, q) {
    if (!sorted.length) return 0;
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if ((sorted[base + 1] !== undefined)) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    return sorted[base];
}

function renderBoxSVG(min, q1, med, q3, max) {
    const w = 260, h = 56, pad = 10;
    const minX = pad, maxX = w - pad;
    const scale = v => minX + ((v - 0) / 5) * (maxX - minX);
    const sx = scale.bind(null);
    const svg = `
        <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="xMinYMid meet">
            <line x1="${sx(min)}" y1="${h / 2}" x2="${sx(max)}" y2="${h / 2}" stroke="#444" stroke-width="1" />
            <rect x="${sx(q1)}" y="${(h / 2) - 12}" width="${Math.max(2, sx(q3) - sx(q1))}" height="24" fill="#1f77b4" opacity="0.22" stroke="#1f77b4" />
            <line x1="${sx(med)}" y1="${(h / 2) - 14}" x2="${sx(med)}" y2="${(h / 2) + 14}" stroke="#1f77b4" stroke-width="2" />
            <text x="${sx(min)}" y="${h - 6}" font-size="11" fill="#333">${min.toFixed(2)}</text>
            <text x="${Math.max(sx(max) - 36, sx(q3) + 4)}" y="${h - 6}" font-size="11" fill="#333">${max.toFixed(2)}</text>
        </svg>
    `;
    return svg;
}

async function renderTudo() {
    try {
        if (!state.loaded) await carregarDados();
        const produtosFiltrados = aplicarFiltros(state.produtos);

        atualizarKPIs(produtosFiltrados);

        criarScatterQualidadeVolume(produtosFiltrados);
        criarDistribuicaoAvaliacoes(produtosFiltrados);
        criarScatterPrecoPercepcao(produtosFiltrados);
        criarComparacaoFormatos(produtosFiltrados);
    } catch (ex) {
        console.error('Erro ao renderizar dashboard', ex);
    }
}

function debounce(fn, wait = 150) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

function atualizarKPIs(produtos) {
    const total = produtos.length;
    const precoMedio = produtos.reduce((s, p) => s + (safeNumber(p.preco) || 0), 0) / (total || 1);
    const avaliacaoMedia = produtos.reduce((s, p) => s + (safeNumber(p.estrelas_media) || 0), 0) / (total || 1);
    const recomendacaoMedia = produtos.reduce((s, p) => s + (safeNumber(p.recomendacoes) || 0), 0) / (total || 1);

    const elTotal = document.getElementById('big-total-produtos');
    const elPreco = document.getElementById('big-preco-medio');
    const elAvaliacao = document.getElementById('big-avaliacao-media');
    const elRecom = document.getElementById('big-recomendacao-media');

    if (elTotal) elTotal.innerText = total.toLocaleString('pt-BR');
    if (elPreco) elPreco.innerText = (total ? 'R$ ' + precoMedio.toFixed(2).replace('.', ',') : 'R$ 0,00');
    if (elAvaliacao) elAvaliacao.innerText = (total ? avaliacaoMedia.toFixed(2) : '-');
    if (elRecom) elRecom.innerText = (total ? Math.round(recomendacaoMedia) + '%' : '-');
}

document.addEventListener('DOMContentLoaded', function () {
    const apply = document.getElementById('apply-filters');
    const reset = document.getElementById('reset-filters');
    if (apply) apply.addEventListener('click', () => renderTudo());
    if (reset) reset.addEventListener('click', () => { document.getElementById('category-filter').value = ''; document.getElementById('price-filter').value = ''; renderTudo(); });

    renderTudo();

    window.addEventListener('resize', debounce(() => {
        if (state.loaded) renderTudo();
    }, 150));
});
