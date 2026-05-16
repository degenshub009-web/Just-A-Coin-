import './style.css'
import confetti from 'canvas-confetti'
import Chart from 'chart.js/auto'

/* ============================================
   CONFIG — Replace with real values at launch
   ============================================ */
const CONFIG = {
  TOKEN_ADDRESS: 'E714f3oiK3sA8WGBBpmgx7Vkptz7Xh7H9YNWjpkLpump',
  PAIR_ADDRESS: 'Ddvid1rXpEsbXh7zjdjVGW4Tu7pKHstMVZ5M5znxCg8a',
  CONTRACT_DISPLAY: 'E714…pump',
  FULL_CONTRACT: 'E714f3oiK3sA8WGBBpmgx7Vkptz7Xh7H9YNWjpkLpump',
  COMMUNITY_WALLET_DISPLAY: '69jz…7zug',
  COMMUNITY_WALLET_FULL: '69jzVYz3bykcB2PQnEtZSUuxx6jtuuNJiuogKQ2H7zug',
  X_BEARER_TOKEN: import.meta.env.VITE_X_BEARER_TOKEN || '',
  // Placeholder social proof numbers
  COMMUNITY_COUNT: 677,
}

/* ============================================
   ELEMENTS
   ============================================ */
const $ = (id: string) => document.getElementById(id)

const loader = $('loader')
const enterDiv = $('enter')
const enterBtn = $('enter-btn')
const mainDiv = $('main')
const navbar = $('navbar')
const canvas = $('particle-canvas') as HTMLCanvasElement | null
const buyBtn = $('buy-btn')

/* ============================================
   1. LOADING SCREEN
   ============================================ */
window.addEventListener('load', () => {
  loader?.classList.add('hidden')
})

/* ============================================
   2. PARTICLE CANVAS — Golden dust
   ============================================ */
interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
}

function initParticles() {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let particles: Particle[] = []
  let mouseX = 0
  let mouseY = 0

  // Detect touch to reduce load and skip mousemove parallax
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0

  function resize() {
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const heroContent = document.querySelector('.hero-content') as HTMLElement | null

  // Only run mouse parallax on non-touch devices
  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (heroContent) {
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
        const deltaX = (e.clientX - centerX) / centerX
        const deltaY = (e.clientY - centerY) / centerY
        heroContent.style.transform = `translate(${deltaX * -15}px, ${deltaY * -15}px)`
      }
    })
  }

  // Aggressively cap particles on touch devices
  const count = isTouchDevice
    ? Math.min(20, Math.floor(window.innerWidth / 20))
    : Math.min(80, Math.floor(window.innerWidth / 15))

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.3 + 0.1),
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.1,
    })
  }

  function draw() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach((p) => {
      // Subtle mouse parallax (only non-touch)
      if (!isTouchDevice) {
        const dx = (mouseX - canvas!.width / 2) * 0.0002
        const dy = (mouseY - canvas!.height / 2) * 0.0002
        p.x += p.speedX + dx
        p.y += p.speedY + dy
      } else {
        p.x += p.speedX
        p.y += p.speedY
      }

      // Wrap
      if (p.y < -10) {
        p.y = canvas!.height + 10
        p.x = Math.random() * canvas!.width
      }
      if (p.x < -10) p.x = canvas!.width + 10
      if (p.x > canvas!.width + 10) p.x = -10

      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx!.fillStyle = `rgba(247, 181, 0, ${p.opacity})`
      ctx!.fill()
    })

    requestAnimationFrame(draw)
  }
  draw()
}

initParticles()

/* ============================================
   3. ENTER PAGE — Cinematic transition
   ============================================ */
const unmuteBtn = $('unmute-btn')
const enterVideo = $('enter-video') as HTMLVideoElement | null

if (unmuteBtn && enterVideo) {
  unmuteBtn.addEventListener('click', () => {
    if (enterVideo.muted) {
      enterVideo.muted = false
      unmuteBtn.innerHTML = '🔊 Mute'
    } else {
      enterVideo.muted = true
      unmuteBtn.innerHTML = '🔇 Unmute'
    }
  })
}

if (enterBtn && enterDiv && mainDiv) {
  enterBtn.addEventListener('click', () => {
    // Play confetti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#F7B500', '#FFD54F', '#C48E00'],
    })

    if (enterVideo) {
      enterVideo.pause()
    }

    // Fade out enter page
    enterDiv.classList.add('exit')

    // Show main page immediately while enter screen fades
    enterDiv.style.pointerEvents = 'none'
    mainDiv.classList.add('active')

    // Trigger reveal animations
    requestAnimationFrame(() => {
      initScrollReveal()
    })

    setTimeout(() => {
      enterDiv.style.display = 'none'
    }, 800)
  })
}

/* ============================================
   4. STICKY NAVIGATION — Show on scroll
   ============================================ */
function initStickyNav() {
  if (!navbar) return

  // Show nav bar as soon as the user starts scrolling down (which is when the stats bar starts coming up)
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('visible')
    } else {
      navbar.classList.remove('visible')
    }
  }, { passive: true })
}

// Init after main is shown
const mainObserver = new MutationObserver(() => {
  if (mainDiv?.classList.contains('active')) {
    initStickyNav()
    mainObserver.disconnect()
  }
})
if (mainDiv) {
  mainObserver.observe(mainDiv, { attributes: true, attributeFilter: ['class'] })
}

/* ============================================
   5. LIVE STATS — DexScreener + Solscan APIs
   ============================================ */
function animateCounter(el: HTMLElement, target: number, prefix = '', suffix = '', decimals = 0) {
  const duration = 1500
  const start = performance.now()

  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    // ease-out quad
    const ease = 1 - (1 - progress) * (1 - progress)
    const current = target * ease

    const parts = current.toFixed(decimals).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    el.textContent = prefix + parts.join('.') + suffix

    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

async function loadStats() {
  const priceEl = $('stat-price')
  const mcapEl = $('stat-mcap')
  const holdersEl = $('stat-holders')
  const communityEl = $('stat-community')

  // Animate community count (placeholder)
  if (communityEl) {
    animateCounter(communityEl, CONFIG.COMMUNITY_COUNT)
  }

  // DexScreener API for price + market cap
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/solana/${CONFIG.PAIR_ADDRESS}`
    )
    const data = await res.json()
    if (data.pair) {
      const price = parseFloat(data.pair.priceUsd || '0')
      const mcap = parseFloat(data.pair.marketCap || '0')
      if (priceEl) animateCounter(priceEl, price, '$', '', price < 0.01 ? 6 : 4)
      if (mcapEl) animateCounter(mcapEl, mcap, '$', '', 0)
    }
  } catch {
    if (priceEl) priceEl.textContent = '$0.00'
    if (mcapEl) mcapEl.textContent = '$0'
  }

  // Helius API for holder count
  try {
    const apiKey = import.meta.env.VITE_HELIUS_API_KEY || 'e57d5c45-a5f7-4506-a38b-a53700dbecd8';
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccounts',
          params: {
            mint: CONFIG.TOKEN_ADDRESS
          },
        }),
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.result?.total !== undefined && holdersEl) {
        // Helius returns total token accounts
        animateCounter(holdersEl, data.result.total)
      }
    } else {
      if (holdersEl) holdersEl.textContent = '—'
    }
  } catch (e) {
    if (holdersEl) holdersEl.textContent = '—'
  }
}

// Auto-refresh stats every 30s
setInterval(loadStats, 30000)

/* ============================================
   5.5 BOT PERFORMANCE DASHBOARD
   ============================================ */
interface DailyStat {
  date: string
  revenue_sol: number
  revenue_usd: number
  revenue_events: number
  burn_sol: number
  burn_usd: number
  burn_events: number
  jac_burned_ui: number
  users?: number
}

interface BotStats {
  total_revenue_sol: number
  total_revenue_usd: number
  total_revenue_events: number
  last_revenue_tx: string
  total_burn_sol: number
  total_burn_usd: number
  total_burn_events: number
  total_jac_burned_raw: number
  total_jac_burned_ui: number
  last_burn_sol: number
  last_burn_usd: number
  last_burn_jac_raw: number
  last_burn_jac_ui: number
  last_burn_buy_tx: string
  last_burn_tx: string
  total_users: number
  daily: DailyStat[]
  updated_at: string
}

const dashCharts: Record<string, InstanceType<typeof Chart>> = {}

let isRevenueUSD = false
let dashLastRevenueSOL = 0
let dashLastRevenueUSD = 0
let dashLastBurned = 0
let dashLastDailyRev = 0
let dashLastBuybacks = 0
let dashLastUsers = 0
let lastDashboardData: BotStats | null = null

function sortDaily(daily: DailyStat[]): DailyStat[] {
  return [...daily].sort((a, b) => a.date.localeCompare(b.date))
}

function latestDaily(data: BotStats): DailyStat | null {
  if (!data.daily?.length) return null
  return sortDaily(data.daily).at(-1) ?? null
}

function dayOverDayPct(daily: DailyStat[], pick: (d: DailyStat) => number): number | null {
  const sorted = sortDaily(daily)
  if (sorted.length < 2) return null
  const prev = pick(sorted[sorted.length - 2])
  const curr = pick(sorted[sorted.length - 1])
  if (prev === 0) return null
  return ((curr - prev) / prev) * 100
}

function formatNumber(n: number, decimals = 0): string {
  const parts = n.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Live Data'
  return `Updated ${date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Recent'
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  return `${Math.floor(diffSec / 86400)}d ago`
}

function truncateTx(hash: string): string {
  if (!hash || hash.length < 12) return hash || '—'
  return `${hash.slice(0, 4)}...${hash.slice(-4)}`
}

function solscanTxUrl(hash: string): string {
  return `https://solscan.io/tx/${hash}`
}

function setStatChange(id: string, pct: number | null) {
  const el = $(id)
  if (!el) return
  el.classList.remove('positive', 'negative')
  if (pct === null) {
    el.textContent = ''
    return
  }
  const sign = pct >= 0 ? '+' : ''
  el.textContent = `${sign}${pct.toFixed(1)}% vs yesterday`
  el.classList.add(pct >= 0 ? 'positive' : 'negative')
}

function updateChartData(key: string, labels: string[], values: number[]) {
  const chart = dashCharts[key]
  if (!chart) return
  chart.data.labels = labels.length ? labels : ['—']
  chart.data.datasets[0].data = values.length ? values : [0]
  chart.update('none')
}

function updateChartsFromDaily(data: BotStats, days = 7) {
  const sorted = sortDaily(data.daily)
  const sliced = days === -1 ? sorted : sorted.slice(-days)

  const labels = sliced.map((d) => {
    const [, month, day] = d.date.split('-')
    return `${month}/${day}`
  })
  const isUSD = isRevenueUSD
  const revenue = sliced.map((d) => (isUSD ? d.revenue_usd : d.revenue_sol))
  const burn = sliced.map((d) => (isUSD ? d.burn_usd : d.burn_sol))
  const jacBurned = sliced.map((d) => d.jac_burned_ui)
  const txCounts = sliced.map((d) => d.revenue_events + d.burn_events)
  const usersLine = sliced.map((d) => d.users ?? data.total_users ?? 0)

  updateChartData('hero', labels, revenue)
  updateChartData('rev', labels, revenue)
  updateChartData('buy', labels, burn)
  updateChartData('burn', labels, jacBurned)
  updateChartData('users', labels, usersLine)

  // Main Revenue Chart - update with both Revenue and Buybacks
  const mainChart = dashCharts.revenue
  if (mainChart) {
    mainChart.data.labels = labels
    mainChart.data.datasets[0].label = isUSD ? 'Revenue ($)' : 'Revenue (◎)'
    mainChart.data.datasets[0].data = revenue
    
    if (mainChart.data.datasets.length === 1) {
      mainChart.data.datasets.push({
        label: isUSD ? 'Buybacks ($)' : 'Buybacks (◎)',
        data: burn,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        fill: true,
        tension: 0.4,
      })
    } else {
      mainChart.data.datasets[1].label = isUSD ? 'Buybacks ($)' : 'Buybacks (◎)'
      mainChart.data.datasets[1].data = burn
    }
    mainChart.update('none')
  }
}

function renderTxTable(data: BotStats) {
  const tbody = $('dash-tx-table')
  if (!tbody) return

  const timeLabel = formatRelativeTime(data.updated_at)
  const rows: Array<{
    type: 'buyback' | 'burn' | 'revenue'
    sol: number | null
    jacBought: number | null
    jacBurned: number | null
    tx: string
  }> = []

  if (data.last_burn_buy_tx) {
    rows.push({
      type: 'buyback',
      sol: data.last_burn_sol,
      jacBought: data.last_burn_jac_ui,
      jacBurned: null,
      tx: data.last_burn_buy_tx,
    })
  }

  if (data.last_burn_tx && data.last_burn_tx !== data.last_burn_buy_tx) {
    rows.push({
      type: 'burn',
      sol: null,
      jacBought: null,
      jacBurned: data.last_burn_jac_ui,
      tx: data.last_burn_tx,
    })
  }

  if (data.last_revenue_tx) {
    const latest = latestDaily(data)
    rows.push({
      type: 'revenue',
      sol: latest ? latest.revenue_sol : null,
      jacBought: null,
      jacBurned: null,
      tx: data.last_revenue_tx,
    })
  }

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:24px;">No transactions yet</td></tr>'
    return
  }

  const typeLabels = {
    buyback: '<span class="type-buyback">🛒 Buyback</span>',
    burn: '<span class="type-burn">🔥 Burn</span>',
    revenue: '<span class="type-revenue">💰 Revenue</span>',
  }

  tbody.innerHTML = rows
    .map((row) => {
      const solCell = row.sol != null && row.sol > 0 ? `${formatNumber(row.sol, 4)} SOL` : '–'
      const boughtCell = row.jacBought != null ? formatNumber(row.jacBought, 0) : '–'
      const burnedCell = row.jacBurned != null ? formatNumber(row.jacBurned, 0) : '–'
      return `<tr>
        <td data-label="Time">${timeLabel}</td>
        <td data-label="Type">${typeLabels[row.type]}</td>
        <td data-label="Amount">${solCell}</td>
        <td data-label="$JAC Bought">${boughtCell}</td>
        <td data-label="$JAC Burned">${burnedCell}</td>
        <td data-label="TX Hash"><a href="${solscanTxUrl(row.tx)}" target="_blank" rel="noopener noreferrer">${truncateTx(row.tx)}</a></td>
      </tr>`
    })
    .join('')
}

function getGradient(ctx: CanvasRenderingContext2D, colorStart: string, colorEnd: string) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 60);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
}

function createSparkline(canvasId: string, chartKey: string, borderColor: string, rgba: string) {
  const canvas = $(canvasId) as HTMLCanvasElement | null
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  dashCharts[chartKey] = new Chart(canvas, {
    type: 'line',
    data: {
      labels: [''],
      datasets: [{
        data: [0],
        borderColor,
        backgroundColor: ctx ? getGradient(ctx, rgba, 'transparent') : 'transparent',
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false, min: 0 } },
      elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 4 }, line: { tension: 0.4, borderWidth: 2 } },
      interaction: { mode: 'index' as const, intersect: false },
    },
  })
}

function initCharts() {
  Chart.defaults.color = '#CBD5E1'
  Chart.defaults.font.family = "'Space Grotesk', sans-serif"

  createSparkline('heroSparkline', 'hero', '#8b5cf6', 'rgba(139, 92, 246, 0.4)')
  createSparkline('sparklineRev', 'rev', '#8b5cf6', 'rgba(139, 92, 246, 0.4)')
  createSparkline('sparklineBuy', 'buy', '#10b981', 'rgba(16, 185, 129, 0.4)')
  createSparkline('sparklineBurn', 'burn', '#f97316', 'rgba(249, 115, 22, 0.4)')
  createSparkline('sparklineUsers', 'users', '#3b82f6', 'rgba(59, 130, 246, 0.4)')

  const revenueChart = $('revenueChart') as HTMLCanvasElement | null
  if (revenueChart) {
    const isMobile = window.innerWidth <= 480
    dashCharts.revenue = new Chart(revenueChart, {
      type: 'line',
      data: {
        labels: [''],
        datasets: [
          {
            label: 'Revenue',
            data: [0],
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 11 }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: isMobile ? 4 : 10,
              font: { size: isMobile ? 10 : 12 },
            },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { dash: [5, 5] },
            ticks: { 
              font: { size: isMobile ? 10 : 12 },
              callback: (val) => typeof val === 'number' ? (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val) : val
            },
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      },
    })

    let resizeTimeout: ReturnType<typeof setTimeout>
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        dashCharts.revenue?.resize()
      }, 150)
    }, { passive: true })
  }
}


function animateCounterFromTo(el: HTMLElement, start: number, target: number, prefix = '', suffix = '', decimals = 0) {
  const duration = 1500
  const startTime = performance.now()

  function tick(now: number) {
    const progress = Math.min((now - startTime) / duration, 1)
    const ease = 1 - (1 - progress) * (1 - progress)
    const current = start + (target - start) * ease

    const parts = current.toFixed(decimals).split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    el.textContent = prefix + parts.join('.') + suffix

    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

function isValidBotStats(data: unknown): data is BotStats {
  if (!data || typeof data !== 'object') return false
  const stats = data as BotStats
  return (
    typeof stats.total_revenue_sol === 'number' &&
    typeof stats.total_revenue_usd === 'number' &&
    typeof stats.total_jac_burned_ui === 'number' &&
    Array.isArray(stats.daily)
  )
}

/** MSK API refresh frequency - set to 15 minutes. */
const MSK_API_MIN_INTERVAL_MS = 900_000
/** Background refresh interval (15 minutes). */
const MSK_STATS_REFRESH_MS = 900_000

const DASHBOARD_CACHE_KEY = 'msk_dashboard_cache'
const MSK_RATE_LIMIT_KEY = 'msk_stats_rate_limited_until'
const MSK_LAST_FETCH_KEY = 'msk_last_stats_fetch'

let dashboardFetchInFlight = false
let dashboardStatusOverride: string | null = null

function getRateLimitedUntil(): number {
  const raw = sessionStorage.getItem(MSK_RATE_LIMIT_KEY)
  return raw ? Number(raw) : 0
}

function setRateLimitedForOneMinute() {
  sessionStorage.setItem(MSK_RATE_LIMIT_KEY, String(Date.now() + MSK_API_MIN_INTERVAL_MS))
}

function getLastFetchAt(): number {
  const raw = sessionStorage.getItem(MSK_LAST_FETCH_KEY)
  return raw ? Number(raw) : 0
}

function recordStatsFetch() {
  sessionStorage.setItem(MSK_LAST_FETCH_KEY, String(Date.now()))
}

function msUntilNextFetchAllowed(now: number): number {
  const waits = [
    getRateLimitedUntil() - now,
    getLastFetchAt() + MSK_STATS_REFRESH_MS - now,
  ]
  return Math.max(0, ...waits)
}

function startDashboardTimer() {
  const updatedEl = $('dash-last-updated')
  if (!updatedEl) return

  setInterval(() => {
    // If there is a manual status override (error or cache notice), show that instead
    if (dashboardStatusOverride) {
      updatedEl.textContent = dashboardStatusOverride
      return
    }

    // If a fetch is happening, don't show the timer
    if (dashboardFetchInFlight) {
      updatedEl.textContent = 'Updating now...'
      return
    }

    const now = Date.now()
    const waitMs = msUntilNextFetchAllowed(now)
    
    if (waitMs > 0) {
      const totalSeconds = Math.ceil(waitMs / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      
      let timeStr = ''
      if (minutes > 0) {
        timeStr += `${minutes}m `
      }
      timeStr += `${seconds}s`
      
      updatedEl.textContent = `Updating in ${timeStr}`
    } else {
      updatedEl.textContent = 'Refreshing data...'
    }
  }, 1000)
}

function readDashboardCache(): { data: BotStats; timestamp: number } | null {
  const cached = sessionStorage.getItem(DASHBOARD_CACHE_KEY)
  if (!cached) return null
  try {
    const parsed = JSON.parse(cached) as { data: unknown; timestamp: number }
    if (!isValidBotStats(parsed.data) || typeof parsed.timestamp !== 'number') {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY)
      return null
    }
    return { data: parsed.data, timestamp: parsed.timestamp }
  } catch {
    sessionStorage.removeItem(DASHBOARD_CACHE_KEY)
    return null
  }
}

function writeDashboardCache(data: BotStats) {
  sessionStorage.setItem(
    DASHBOARD_CACHE_KEY,
    JSON.stringify({ data, timestamp: Date.now() }),
  )
}

function clearDashboardMetrics() {
  const placeholders = [
    'dash-revenue',
    'dash-burned',
    'dash-daily-rev',
    'dash-buybacks-usd',
    'dash-active-users',
  ]
  placeholders.forEach((id) => {
    const el = $(id)
    if (el) el.innerHTML = '<span style="font-size: 1.5rem; color: var(--text-secondary);">—</span>'
  })
  ;['dash-daily-rev-change', 'dash-buybacks-change', 'dash-users-change'].forEach((id) => {
    setStatChange(id, null)
  })
  const tbody = $('dash-tx-table')
  if (tbody) tbody.innerHTML = ''
}

function renderDashboardError(message: string) {
  clearDashboardMetrics()
  const liveDot = $('dash-live-dot')
  const updatedEl = $('dash-last-updated')
  const burnGlow = $('burn-glow')
  if (liveDot) liveDot.style.backgroundColor = '#ef4444'
  if (updatedEl) updatedEl.textContent = message
  dashboardStatusOverride = message
  if (burnGlow) burnGlow.classList.remove('active')
  lastDashboardData = null
}

function renderDashboard(data: BotStats | null) {
  const revEl = $('dash-revenue')
  const burnEl = $('dash-burned')
  const updatedEl = $('dash-last-updated')
  const liveDot = $('dash-live-dot')
  const burnGlow = $('burn-glow')
  const dailyRevEl = $('dash-daily-rev')
  const buybacksEl = $('dash-buybacks-usd')
  const activeUsersEl = $('dash-active-users')

  if (!data) return

  if (liveDot) liveDot.style.backgroundColor = '#22c55e'
  // Timer handles the updatedEl text now

  const latest = latestDaily(data)

  if (revEl) {
    const targetVal = isRevenueUSD ? data.total_revenue_usd : data.total_revenue_sol
    const startVal = isRevenueUSD ? dashLastRevenueUSD : dashLastRevenueSOL
    const prefix = isRevenueUSD ? '$' : '◎ '
    animateCounterFromTo(revEl, startVal, targetVal, prefix, '', 2)
  }

  if (burnEl) {
    animateCounterFromTo(burnEl, dashLastBurned, data.total_jac_burned_ui, '', '', 2)
    if (data.total_jac_burned_ui > dashLastBurned && dashLastBurned > 0 && burnGlow) {
      burnGlow.classList.add('active')
      setTimeout(() => burnGlow.classList.remove('active'), 5000)
    }
  }

  if (latest && dailyRevEl) {
    const dailyVal = isRevenueUSD ? latest.revenue_usd : latest.revenue_sol
    animateCounterFromTo(
      dailyRevEl,
      dashLastDailyRev,
      dailyVal,
      isRevenueUSD ? '$' : '◎ ',
      '',
      isRevenueUSD ? 2 : 4,
    )
    dashLastDailyRev = dailyVal
    setStatChange(
      'dash-daily-rev-change',
      dayOverDayPct(data.daily, (d) => (isRevenueUSD ? d.revenue_usd : d.revenue_sol)),
    )
  } else if (dailyRevEl) {
    dailyRevEl.textContent = '—'
    setStatChange('dash-daily-rev-change', null)
  }

  if (buybacksEl) {
    const dailyVal = latest ? (isRevenueUSD ? latest.burn_usd : latest.burn_sol) : 0
    animateCounterFromTo(
      buybacksEl,
      dashLastBuybacks,
      dailyVal,
      isRevenueUSD ? '$' : '◎ ',
      '',
      isRevenueUSD ? 2 : 4,
    )
    dashLastBuybacks = dailyVal
    setStatChange(
      'dash-buybacks-change',
      dayOverDayPct(data.daily, (d) => (isRevenueUSD ? d.burn_usd : d.burn_sol)),
    )
  }

  if (activeUsersEl) {
    const latestUsers = latest?.users ?? data.total_users ?? 0
    animateCounterFromTo(activeUsersEl, dashLastUsers, latestUsers, '', '', 0)
    dashLastUsers = latestUsers
    setStatChange(
      'dash-users-change',
      dayOverDayPct(data.daily, (d) => d.users ?? 0),
    )
  }

  // Get current chart range from dropdown
  const chartDropdown = document.querySelector('.chart-dropdown') as HTMLSelectElement | null
  let days = 7
  if (chartDropdown) {
    const val = chartDropdown.value
    if (val === '30D') days = 30
    else if (val === 'ALL') days = -1
  }

  updateChartsFromDaily(data, days)
  renderTxTable(data)

  dashLastRevenueSOL = data.total_revenue_sol
  dashLastRevenueUSD = data.total_revenue_usd
  dashLastBurned = data.total_jac_burned_ui
  dashboardStatusOverride = null // Clear override on successful render
}

function renderDashboardFromCache(data: BotStats, statusMessage?: string) {
  lastDashboardData = data
  renderDashboard(data)
  const liveDot = $('dash-live-dot')
  if (liveDot) liveDot.style.backgroundColor = '#eab308'
  if (statusMessage) {
    dashboardStatusOverride = statusMessage
  }
}

async function loadDashboard() {
  if (dashboardFetchInFlight) return

  const cache = readDashboardCache()
  const now = Date.now()
  const cacheAge = cache ? now - cache.timestamp : Infinity
  const cacheIsFresh = cacheAge < MSK_API_MIN_INTERVAL_MS

  // Serve from cache without hitting the network (HMR, tab focus, interval ticks).
  if (cache && cacheIsFresh) {
    renderDashboardFromCache(cache.data)
    return
  }

  const waitMs = msUntilNextFetchAllowed(now)
  if (waitMs > 0) {
    if (cache) {
      renderDashboardFromCache(cache.data)
    }
    return
  }

  dashboardFetchInFlight = true
  try {
    const res = await fetch('/api/stats')
    const payload: unknown = await res.json().catch(() => null)

    if (res.ok && isValidBotStats(payload)) {
      recordStatsFetch()
      writeDashboardCache(payload)
      lastDashboardData = payload
      renderDashboard(payload)
      return
    }

    if (res.status === 429) {
      setRateLimitedForOneMinute()
      recordStatsFetch()
    }

    if (cache) {
      const status =
        res.status === 429
          ? 'Cached data · rate limited (1 req/min)'
          : `Cached data · API unavailable (${res.status})`
      renderDashboardFromCache(cache.data, status)
      return
    }

    const apiError =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : null
    if (res.status === 429) {
      renderDashboardError(apiError || 'Rate limited — refreshes every minute')
    } else if (res.status === 500 && apiError?.includes('MSK_API_KEY')) {
      renderDashboardError('API key missing — add MSK_API_KEY to .env')
    } else {
      renderDashboardError(apiError || 'Connection Error')
    }
  } catch (e) {
    console.error('Failed to load dashboard data', e)
    if (cache) {
      renderDashboardFromCache(cache.data, 'Cached data · offline')
      return
    }
    renderDashboardError('Connection Error')
  } finally {
    dashboardFetchInFlight = false
  }
}

// Set up revenue toggle
const revToggleBtn = $('revenue-toggle-btn')
if (revToggleBtn) {
  revToggleBtn.addEventListener('click', () => {
    isRevenueUSD = !isRevenueUSD
    revToggleBtn.textContent = isRevenueUSD ? 'USD' : 'SOL'
    dashLastDailyRev = 0
    dashLastBuybacks = 0
    if (lastDashboardData) {
      renderDashboard(lastDashboardData)
    }
  })
}

// Set up chart range dropdown
const chartDropdown = document.querySelector('.chart-dropdown') as HTMLSelectElement | null
if (chartDropdown) {
  chartDropdown.addEventListener('change', () => {
    if (lastDashboardData) {
      const val = chartDropdown.value
      let days = 7
      if (val === '30D') days = 30
      else if (val === 'ALL') days = -1
      updateChartsFromDaily(lastDashboardData, days)
    }
  })
}

/* ============================================
   MOBILE NAVIGATION — Hamburger Menu
   ============================================ */
function initMobileMenu() {
  const hamburgerEl = document.getElementById('nav-hamburger')
  if (!(hamburgerEl instanceof HTMLElement)) return
  const menuEl = document.getElementById('nav-mobile-menu')
  if (!(menuEl instanceof HTMLElement)) return

  const setMenuOpen = (open: boolean) => {
    menuEl.classList.toggle('open', open)
    hamburgerEl.classList.toggle('open', open)
    hamburgerEl.setAttribute('aria-expanded', open ? 'true' : 'false')
    menuEl.setAttribute('aria-hidden', open ? 'false' : 'true')
    document.body.style.overflow = open ? 'hidden' : ''
  }

  hamburgerEl.addEventListener('click', () => {
    setMenuOpen(!menuEl.classList.contains('open'))
  })

  menuEl.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false))
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuEl.classList.contains('open')) {
      setMenuOpen(false)
      hamburgerEl.focus()
    }
  })
}

initMobileMenu()
startDashboardTimer()

// Refresh based on interval
setInterval(loadDashboard, MSK_STATS_REFRESH_MS)

/* ============================================
   6. CONFETTI ON BUY BUTTON
   ============================================ */
if (buyBtn) {
  buyBtn.addEventListener('click', () => {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#F7B500', '#FFD54F', '#C48E00', '#fff'],
    })
  })
}



/* ============================================
   8. COPY BUTTONS (Contract & Wallet)
   ============================================ */
function initCopyContract() {
  const buttons = document.querySelectorAll('.copy-contract')

  buttons.forEach((btn) => {
    let timeoutId: any;

    btn.addEventListener('click', async () => {
      try {
        const isWallet = btn.id === 'copy-wallet-btn'
        const textToCopy = isWallet ? CONFIG.COMMUNITY_WALLET_FULL : CONFIG.FULL_CONTRACT

        await navigator.clipboard.writeText(textToCopy)
        btn.classList.add('copied')
        const icon = btn.querySelector('.copy-contract-icon')
        const addressText = btn.querySelector('.copy-contract-address')

        if (icon) icon.textContent = '✅'
        if (addressText) addressText.textContent = 'COPIED!'

        if (timeoutId) clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          btn.classList.remove('copied')
          if (icon) icon.textContent = '📋'
          if (addressText) addressText.textContent = isWallet ? CONFIG.COMMUNITY_WALLET_DISPLAY : CONFIG.CONTRACT_DISPLAY
        }, 4000)
      } catch (e) {
        console.error('Failed to copy:', e)
      }
    })
  })
}

initCopyContract()

/* ============================================
   9. SCROLL REVEAL — Intersection Observer
   ============================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        } else {
          entry.target.classList.remove('visible')
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  )

  elements.forEach((el) => observer.observe(el))
}

/* ============================================
   10. SMOOTH SCROLL for nav links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = (a as HTMLAnchorElement).getAttribute('href')
    if (!href || href === '#') return
    const target = document.querySelector(href) as HTMLElement | null
    if (target) {
      e.preventDefault()
      // Measure the live navbar height so the section title clears the bar cleanly
      const navEl = document.getElementById('navbar')
      const navH = navEl ? navEl.offsetHeight : 60
      const gap = 16 // extra breathing room below the nav
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navH - gap
      window.scrollTo({ top: targetTop, behavior: 'smooth' })
    }
  })
})

// Start loading data in the background immediately
loadStats()

initCharts()
loadDashboard()
