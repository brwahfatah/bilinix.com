<script setup lang="ts">
const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '< 5m',  label: 'Deploy time' },
  { value: '24/7',  label: 'Support' },
  { value: '12+',   label: 'Datacenters' },
]
</script>

<template>
  <section class="hero-section relative overflow-hidden">
    <!-- Background layers -->
    <div class="hero-bg-gradient" />
    <div class="hero-grid" />
    <div class="hero-radial-left" />
    <div class="hero-radial-right" />

    <div class="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">

      <!-- LEFT: copy -->
      <div class="hero-copy flex flex-col items-start">

        <!-- Badge -->
        <div class="badge mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          <span class="badge-dot" />
          Infrastructure Online
        </div>

        <!-- Headline -->
        <h1 class="headline text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
          Cloud Infrastructure<br />
          <span class="headline-accent">Built For Serious<br />Businesses</span>
        </h1>

        <!-- Subheadline -->
        <p class="subline mt-6 max-w-lg text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
          High performance VPS, dedicated servers, hosting automation and enterprise cloud solutions.
        </p>

        <!-- CTAs -->
        <div class="cta-group mt-8 flex flex-col gap-3 sm:flex-row">
          <NuxtLink
            to="/vps"
            class="cta-primary group inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold text-white transition-all duration-200"
          >
            <svg class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m13 10 4 4-4 4M7 14h10" />
            </svg>
            Deploy Now
          </NuxtLink>
          <NuxtLink
            to="/#pricing"
            class="cta-secondary inline-flex items-center justify-center rounded-lg border border-slate-600 px-6 py-3.5 text-sm font-bold text-slate-300 transition-all duration-200 hover:border-cyan-500/60 hover:text-cyan-300"
          >
            View Plans
          </NuxtLink>
        </div>

        <!-- Stats row -->
        <dl class="stats-row mt-12 flex flex-wrap gap-x-8 gap-y-4">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <dd class="text-2xl font-black text-white">{{ stat.value }}</dd>
            <dt class="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500">{{ stat.label }}</dt>
          </div>
        </dl>
      </div>

      <!-- RIGHT: globe -->
      <div class="hero-globe flex items-center justify-center">
        <MHeroGlobe />
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: #020617;
  border-bottom: 1px solid rgba(34, 211, 238, 0.08);
}

.hero-bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #020617 0%, #0a1628 45%, #060e20 100%);
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%);
}

.hero-radial-left {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 55%;
  height: 80%;
  background: radial-gradient(ellipse, rgba(6, 182, 212, 0.07) 0%, transparent 65%);
  pointer-events: none;
}

.hero-radial-right {
  position: absolute;
  top: 10%;
  right: -15%;
  width: 55%;
  height: 70%;
  background: radial-gradient(ellipse, rgba(56, 189, 248, 0.06) 0%, transparent 65%);
  pointer-events: none;
}

.badge {
  animation: fadeSlideUp 0.6s ease-out both;
}

.badge-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 6px #22d3ee;
  animation: dotPulse 2s ease-in-out infinite;
}

.headline {
  animation: fadeSlideUp 0.7s ease-out 0.1s both;
}

.headline-accent {
  background: linear-gradient(90deg, #38bdf8 0%, #22d3ee 50%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subline {
  animation: fadeSlideUp 0.7s ease-out 0.2s both;
}

.cta-group {
  animation: fadeSlideUp 0.7s ease-out 0.3s both;
}

.cta-primary {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
}

.cta-primary:hover {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.45), 0 4px 16px rgba(0, 0, 0, 0.5);
  transform: translateY(-1px);
}

.cta-secondary:hover {
  background: rgba(6, 182, 212, 0.06);
}

.stats-row {
  animation: fadeSlideUp 0.7s ease-out 0.4s both;
}

.stat-item {
  position: relative;
  padding-right: 2rem;
}

.stat-item::after {
  content: '';
  position: absolute;
  right: 0;
  top: 10%;
  height: 80%;
  width: 1px;
  background: rgba(34, 211, 238, 0.15);
}

.stat-item:last-child::after { display: none; }

.hero-globe {
  animation: fadeSlideUp 0.9s ease-out 0.15s both;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes dotPulse {
  0%, 100% { box-shadow: 0 0 4px #22d3ee; opacity: 0.7; }
  50%       { box-shadow: 0 0 10px #22d3ee, 0 0 18px rgba(34, 211, 238, 0.4); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .badge, .headline, .subline, .cta-group, .stats-row, .hero-globe { animation: none; }
}
</style>
