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
  COMMUNITY_COUNT: 503,
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
interface BotStats {
  total_revenue_sol: number
  total_revenue_usd: number
  solPrice?: number
  total_jac_burned_ui: number
  lastBurnTx?: string
}

let isRevenueUSD = false
let dashLastRevenueSOL = 0
let dashLastRevenueUSD = 0
let dashLastSolPrice = 0
let dashLastBurned = 0
let lastDashboardData: BotStats | null = null

function getGradient(ctx: CanvasRenderingContext2D, colorStart: string, colorEnd: string) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 60);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
}

function initCharts() {
  Chart.defaults.color = '#CBD5E1';
  Chart.defaults.font.family = "'Space Grotesk', sans-serif";

  // Sparklines
  const sparklineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false, min: 0 } },
    elements: { point: { radius: 0, hitRadius: 10, hoverRadius: 4 }, line: { tension: 0.4, borderWidth: 2 } },
    interaction: { mode: 'index' as const, intersect: false }
  };

  const heroSparkline = $('heroSparkline') as HTMLCanvasElement
  if (heroSparkline) {
    const ctx = heroSparkline.getContext('2d')
    new Chart(heroSparkline, {
      type: 'line',
      data: { labels: [1,2,3,4,5,6,7], datasets: [{ data: [10, 25, 20, 45, 40, 60, 80], borderColor: '#8b5cf6', backgroundColor: ctx ? getGradient(ctx, 'rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0)') : 'transparent', fill: true }] },
      options: sparklineOptions
    });
  }

  const sparklineRev = $('sparklineRev') as HTMLCanvasElement
  if (sparklineRev) {
    const ctx = sparklineRev.getContext('2d')
    new Chart(sparklineRev, {
      type: 'line',
      data: { labels: [1,2,3,4,5,6,7], datasets: [{ data: [5, 10, 15, 12, 20, 25, 30], borderColor: '#8b5cf6', backgroundColor: ctx ? getGradient(ctx, 'rgba(139, 92, 246, 0.4)', 'rgba(139, 92, 246, 0)') : 'transparent', fill: true }] },
      options: sparklineOptions
    });
  }

  const sparklineBuy = $('sparklineBuy') as HTMLCanvasElement
  if (sparklineBuy) {
    const ctx = sparklineBuy.getContext('2d')
    new Chart(sparklineBuy, {
      type: 'line',
      data: { labels: [1,2,3,4,5,6,7], datasets: [{ data: [2, 5, 8, 7, 10, 15, 20], borderColor: '#10b981', backgroundColor: ctx ? getGradient(ctx, 'rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0)') : 'transparent', fill: true }] },
      options: sparklineOptions
    });
  }

  const sparklineBurn = $('sparklineBurn') as HTMLCanvasElement
  if (sparklineBurn) {
    const ctx = sparklineBurn.getContext('2d')
    new Chart(sparklineBurn, {
      type: 'line',
      data: { labels: [1,2,3,4,5,6,7], datasets: [{ data: [10, 12, 11, 15, 14, 18, 22], borderColor: '#f97316', backgroundColor: ctx ? getGradient(ctx, 'rgba(249, 115, 22, 0.4)', 'rgba(249, 115, 22, 0)') : 'transparent', fill: true }] },
      options: sparklineOptions
    });
  }

  const sparklineUsers = $('sparklineUsers') as HTMLCanvasElement
  if (sparklineUsers) {
    const ctx = sparklineUsers.getContext('2d')
    new Chart(sparklineUsers, {
      type: 'line',
      data: { labels: [1,2,3,4,5,6,7], datasets: [{ data: [200, 250, 300, 280, 320, 380, 450], borderColor: '#3b82f6', backgroundColor: ctx ? getGradient(ctx, 'rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0)') : 'transparent', fill: true }] },
      options: sparklineOptions
    });
  }

  const sparklineTx = $('sparklineTx') as HTMLCanvasElement
  if (sparklineTx) {
    const ctx = sparklineTx.getContext('2d')
    new Chart(sparklineTx, {
      type: 'line',
      data: { labels: [1,2,3,4,5,6,7], datasets: [{ data: [5000, 6000, 5800, 7200, 6900, 8500, 9200], borderColor: '#a855f7', backgroundColor: ctx ? getGradient(ctx, 'rgba(168, 85, 247, 0.4)', 'rgba(168, 85, 247, 0)') : 'transparent', fill: true }] },
      options: sparklineOptions
    });
  }

  // Main Revenue Chart
  let revenueChartInstance: InstanceType<typeof Chart> | null = null
  const revenueChart = $('revenueChart') as HTMLCanvasElement
  if (revenueChart) {
    const isMobile = window.innerWidth <= 480
    revenueChartInstance = new Chart(revenueChart, {
      type: 'line',
      data: {
        labels: ['May 17', 'May 18', 'May 19', 'May 20', 'May 21', 'May 22', 'May 23'],
        datasets: [{
          label: 'Revenue',
          data: [10000, 25000, 22000, 45000, 40000, 65000, 80000],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: isMobile ? 4 : 7,
              font: { size: isMobile ? 10 : 12 }
            }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { dash: [5, 5] },
            ticks: { font: { size: isMobile ? 10 : 12 } }
          }
        }
      }
    })

    // Re-render chart on orientation change / resize (debounced)
    let resizeTimeout: ReturnType<typeof setTimeout>
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        revenueChartInstance?.resize()
      }, 150)
    }, { passive: true })
  }
}

function showDashboardToast() {
  const toast = $('dashboard-toast')
  if (toast) {
    toast.classList.add('show')
    setTimeout(() => {
      toast.classList.remove('show')
    }, 3000)
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

function renderDashboard(data: BotStats | null) {
  const revEl = $('dash-revenue')
  const burnEl = $('dash-burned')
  const burnUsdEl = $('dash-burned-usd')
  const updatedEl = $('dash-last-updated')
  const liveDot = $('dash-live-dot')
  const burnGlow = $('burn-glow')

  // Mock elements for the new layout
  const dailyRevEl = $('dash-daily-rev')
  const buybacksUsdEl = $('dash-buybacks-usd')
  const activeUsersEl = $('dash-active-users')
  const txPerDayEl = $('dash-tx-per-day')

  // Mock Data Updates (always populate these, even if real API fails)
  if (dailyRevEl) dailyRevEl.textContent = isRevenueUSD ? '$48,529.23' : '◎ 315.42'
  if (buybacksUsdEl) buybacksUsdEl.textContent = isRevenueUSD ? '$1,342,984.52' : '◎ 8,725.14'
  if (activeUsersEl) animateCounterFromTo(activeUsersEl, 0, 1542, '', '', 0)
  if (txPerDayEl) animateCounterFromTo(txPerDayEl, 0, 9205, '', '', 0)

  if (!data) {
    if (revEl) revEl.innerHTML = '<span style="font-size: 1.5rem; color: var(--text-secondary);">API Rate Limited</span>'
    if (burnEl) burnEl.innerHTML = '<span style="font-size: 1.5rem; color: var(--text-secondary);">API Rate Limited</span>'
    if (burnUsdEl) burnUsdEl.textContent = '--'
    if (updatedEl) updatedEl.textContent = 'Error fetching (Rate Limit)'
    if (liveDot) liveDot.style.backgroundColor = '#ef4444'
    if (burnGlow) burnGlow.classList.remove('active')
    return
  }

  if (liveDot) liveDot.style.backgroundColor = '#22c55e'

  // Real Data
  if (revEl) {
    const targetVal = isRevenueUSD ? data.total_revenue_usd : data.total_revenue_sol
    const startVal = isRevenueUSD ? dashLastRevenueUSD : dashLastRevenueSOL
    const prefix = isRevenueUSD ? '$' : '◎ '
    animateCounterFromTo(revEl, startVal, targetVal, prefix, '', isRevenueUSD ? 2 : 2)
  }

  if (burnEl) {
    animateCounterFromTo(burnEl, dashLastBurned, data.total_jac_burned_ui, '', '', 0)
    if (data.total_jac_burned_ui > dashLastBurned && dashLastBurned > 0 && burnGlow) {
      burnGlow.classList.add('active')
      setTimeout(() => burnGlow.classList.remove('active'), 5000)
    }
  }

  if (burnUsdEl) {
    const solPrice = data.solPrice || (data.total_revenue_usd / data.total_revenue_sol) || 0
    const usdValue = data.total_jac_burned_ui * solPrice
    const lastUsdValue = dashLastBurned * dashLastSolPrice
    animateCounterFromTo(burnUsdEl, lastUsdValue, usdValue, '', '', 2)
    dashLastSolPrice = solPrice
  }



  if (updatedEl) {
    updatedEl.textContent = 'Live Data · Updated just now'
  }

  dashLastRevenueSOL = data.total_revenue_sol
  dashLastRevenueUSD = data.total_revenue_usd
  dashLastBurned = data.total_jac_burned_ui
}

async function loadDashboard() {
  const updatedEl = $('dash-last-updated')
  if (updatedEl) updatedEl.textContent = 'Updating...'
  
  // Check session cache first to prevent excessive API calls during development (HMR reloads)
  const cacheKey = 'msk_dashboard_cache'
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()
      // If cache is less than 180 seconds old, use it instead of fetching
      if (now - timestamp < 180_000) {
        lastDashboardData = data
        renderDashboard(data)
        if (updatedEl) updatedEl.textContent = 'Live Data · Cached'
        return
      }
    } catch (e) {
      sessionStorage.removeItem(cacheKey)
    }
  }

  try {
    const res = await fetch('/api/stats')
    if (res.ok) {
      const data: BotStats = await res.json()
      
      // Update cache
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
      
      lastDashboardData = data
      renderDashboard(data)
      showDashboardToast()
    } else {
      lastDashboardData = null
      renderDashboard(null)
    }
  } catch (e) {
    console.error('Failed to load dashboard data', e)
    lastDashboardData = null
    renderDashboard(null)
  }
}

// Set up revenue toggle
const revToggleBtn = $('revenue-toggle-btn')
if (revToggleBtn) {
  revToggleBtn.addEventListener('click', () => {
    isRevenueUSD = !isRevenueUSD
    revToggleBtn.textContent = isRevenueUSD ? 'USD' : 'SOL'
    
    // Re-render the dashboard with the new currency state
    if (lastDashboardData) {
      renderDashboard(lastDashboardData)
    } else {
      // Just toggle the mock data if no real data
      const dailyRevEl = $('dash-daily-rev')
      const buybacksUsdEl = $('dash-buybacks-usd')
      
      if (dailyRevEl) dailyRevEl.textContent = isRevenueUSD ? '$48,529.23' : '◎ 315.42'
      if (buybacksUsdEl) buybacksUsdEl.textContent = isRevenueUSD ? '$1,342,984.52' : '◎ 8,725.14'
    }
  })
}

/* ============================================
   MOBILE NAVIGATION — Hamburger Menu
   ============================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('nav-hamburger')
  const mobileMenu = document.getElementById('nav-mobile-menu')
  if (!hamburger || !mobileMenu) return

  function openMenu() {
    mobileMenu.classList.add('open')
    hamburger!.classList.add('open')
    hamburger!.setAttribute('aria-expanded', 'true')
    mobileMenu.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
  }

  function closeMenu() {
    mobileMenu.classList.remove('open')
    hamburger!.classList.remove('open')
    hamburger!.setAttribute('aria-expanded', 'false')
    mobileMenu.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('open')
    isOpen ? closeMenu() : openMenu()
  })

  // Close on any link/button tap
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu)
  })

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu()
      hamburger!.focus()
    }
  })
}

initMobileMenu()

// Refresh every 180s
setInterval(loadDashboard, 180_000)

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
   7. MEME LEADERBOARD — X API Integration
   ============================================ */
interface LeaderboardPost {
  id: string
  text: string
  likes: number
  author: string
  authorAvatar?: string
}

// Mock data (used when X API isn't configured)
const MOCK_POSTS: LeaderboardPost[] = [
  { id: '1', text: '$JAC is going to the moon 🚀🚀🚀 this is the one!! #JustACoin #Solana', likes: 2847, author: '@crypto_whale', authorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=whale' },
  { id: '2', text: 'Just aped into $JAC 💎🙌 the community is insane. LFG!!!', likes: 1923, author: '@degen_trader', authorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=degen' },
  { id: '3', text: 'If you\'re sleeping on $JAC you\'re ngmi 😂 best meme coin on SOL right now', likes: 1456, author: '@sol_maxi', authorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=maxi' },
  { id: '4', text: '$JAC holders are true diamond hands. This community doesn\'t fold 🔥', likes: 987, author: '@meme_lord', authorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=lord' },
  { id: '5', text: 'Literally just a coin but the vibes are immaculate 🪙✨ $JAC', likes: 743, author: '@alpha_caller', authorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alpha' },
  { id: '6', text: '$JAC x Solana = unstoppable combo 🌐 wen $1B?', likes: 612, author: '@sol_degen99', authorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sol' },
  { id: '7', text: 'Bought the dip on $JAC — again. This is the way 📈', likes: 534, author: '@buythedip', authorAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=dip' },
]

async function fetchFromXApi(): Promise<LeaderboardPost[]> {
  if (!CONFIG.X_BEARER_TOKEN) return MOCK_POSTS

  try {
    const res = await fetch(
      'https://api.twitter.com/2/tweets/search/recent?query=%24JAC&tweet.fields=public_metrics,author_id&expansions=author_id&user.fields=username,profile_image_url&max_results=10',
      {
        headers: {
          Authorization: `Bearer ${CONFIG.X_BEARER_TOKEN}`,
        },
      }
    )

    if (!res.ok) {
      console.warn('X API returned', res.status, '— using mock data')
      return MOCK_POSTS
    }

    const data = await res.json()
    const users = new Map<string, { username: string; avatar: string }>()

    if (data.includes?.users) {
      for (const u of data.includes.users) {
        users.set(u.id, { username: u.username, avatar: u.profile_image_url })
      }
    }

    if (!data.data) return MOCK_POSTS

    const posts: LeaderboardPost[] = data.data.map((tweet: any) => {
      const user = users.get(tweet.author_id)
      return {
        id: tweet.id,
        text: tweet.text,
        likes: tweet.public_metrics?.like_count || 0,
        author: user ? `@${user.username}` : '@unknown',
        authorAvatar: user?.avatar,
      }
    })

    posts.sort((a, b) => b.likes - a.likes)
    return posts.length > 0 ? posts : MOCK_POSTS
  } catch (e) {
    console.warn('X API fetch failed, using mock data:', e)
    return MOCK_POSTS
  }
}

async function loadLeaderboard() {
  const posts = await fetchFromXApi()
  const podiumContainer = $('podium-container')
  const listContainer = $('leaderboard-list')

  if (!podiumContainer || !listContainer) return

  const top3 = posts.slice(0, 3)
  const rest = posts.slice(3)

  const rankClasses = ['gold-rank', 'silver-rank', 'bronze-rank']
  const rankEmojis = ['🥇', '🥈', '🥉']

  podiumContainer.innerHTML = top3
    .map(
      (post, i) => `
    <div class="glass-card podium-card ${rankClasses[i]}">
      <div class="podium-rank">${rankEmojis[i]}</div>
      ${post.authorAvatar
          ? `<img src="${post.authorAvatar}" class="podium-avatar" alt="${post.author}">`
          : `<div class="podium-avatar"></div>`
        }
      <div class="podium-handle">${post.author}</div>
      <div class="podium-text">${post.text.slice(0, 120)}${post.text.length > 120 ? '…' : ''}</div>
      <div class="podium-likes">❤️ ${post.likes.toLocaleString()}</div>
    </div>
  `
    )
    .join('')

  listContainer.innerHTML = rest
    .map(
      (post, i) => `
    <div class="glass-card leaderboard-item">
      <div class="leaderboard-item-rank">#${i + 4}</div>
      ${post.authorAvatar
          ? `<img src="${post.authorAvatar}" class="podium-avatar" style="width: 36px; height: 36px; margin: 0;" alt="${post.author}">`
          : `<div class="podium-avatar" style="width: 36px; height: 36px; margin: 0;"></div>`
        }
      <div class="leaderboard-item-content">
        <div class="leaderboard-item-handle">${post.author}</div>
        <div class="leaderboard-item-text">${post.text.slice(0, 100)}${post.text.length > 100 ? '…' : ''}</div>
      </div>
      <div class="leaderboard-item-likes" style="display: flex; align-items: center;">❤️ ${post.likes.toLocaleString()}</div>
    </div>
  `
    )
    .join('')
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
    const target = document.querySelector(href)
    if (target) {
      e.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
})

// Start loading data in the background immediately
loadStats()
loadLeaderboard()
initCharts()
loadDashboard()
