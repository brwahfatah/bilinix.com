<script setup lang="ts">
// ── Static data ────────────────────────────────────────────────────────────
const nodes = [
  { cx: 200, cy: 160, delay: '0s',   color: '#22d3ee' },
  { cx: 320, cy: 100, delay: '0.8s', color: '#38bdf8' },
  { cx: 380, cy: 220, delay: '1.4s', color: '#06b6d4' },
  { cx: 260, cy: 290, delay: '0.5s', color: '#7dd3fc' },
  { cx: 160, cy: 250, delay: '1.8s', color: '#22d3ee' },
  { cx: 340, cy: 340, delay: '1.1s', color: '#38bdf8' },
  { cx: 430, cy: 160, delay: '0.3s', color: '#06b6d4' },
  { cx: 130, cy: 180, delay: '2.1s', color: '#7dd3fc' },
]

const particles = Array.from({ length: 28 }, (_, i) => ({
  id:    i,
  x:     Math.round((i * 37 + 12) % 520),
  y:     Math.round((i * 53 + 20) % 400),
  r:     (i % 3) + 1,
  delay: `${(i * 0.3) % 4}s`,
  dur:   `${3 + (i % 4)}s`,
}))
</script>

<template>
  <div class="globe-wrapper" aria-hidden="true">
    <!-- background glow -->
    <div class="glow-bg" />

    <!-- particle field -->
    <svg class="particles" viewBox="0 0 520 400" xmlns="http://www.w3.org/2000/svg">
      <circle
        v-for="p in particles"
        :key="p.id"
        :cx="p.x"
        :cy="p.y"
        :r="p.r"
        fill="#22d3ee"
        class="particle"
        :style="{ animationDelay: p.delay, animationDuration: p.dur }"
      />
    </svg>

    <!-- globe pivot — no mouse-follow transform -->
    <div class="globe-pivot">
      <svg class="globe-svg" viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="globeFill" cx="42%" cy="38%" r="58%">
            <stop offset="0%"   stop-color="#0e4f7a" />
            <stop offset="55%"  stop-color="#051a35" />
            <stop offset="100%" stop-color="#020d1e" />
          </radialGradient>
          <radialGradient id="globeShine" cx="35%" cy="30%" r="50%">
            <stop offset="0%"   stop-color="#38bdf8" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
          </radialGradient>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ringGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="globeClip">
            <circle cx="230" cy="230" r="165" />
          </clipPath>
        </defs>

        <!-- base sphere -->
        <circle cx="230" cy="230" r="165" fill="url(#globeFill)" />

        <!-- grid lines clipped to sphere — slow spin gives rotation feel -->
        <g clip-path="url(#globeClip)" class="globe-grid">
          <!-- latitude lines -->
          <ellipse cx="230" cy="230" rx="165" ry="50"  fill="none" stroke="#22d3ee" stroke-width="0.6" stroke-opacity="0.18" />
          <ellipse cx="230" cy="185" rx="148" ry="42"  fill="none" stroke="#22d3ee" stroke-width="0.5" stroke-opacity="0.12" />
          <ellipse cx="230" cy="275" rx="148" ry="42"  fill="none" stroke="#22d3ee" stroke-width="0.5" stroke-opacity="0.12" />
          <ellipse cx="230" cy="140" rx="110" ry="30"  fill="none" stroke="#22d3ee" stroke-width="0.4" stroke-opacity="0.09" />
          <ellipse cx="230" cy="320" rx="110" ry="30"  fill="none" stroke="#22d3ee" stroke-width="0.4" stroke-opacity="0.09" />
          <!-- longitude lines -->
          <line x1="230" y1="65"  x2="230" y2="395" stroke="#22d3ee" stroke-width="0.5" stroke-opacity="0.14" />
          <line x1="148" y1="70"  x2="312" y2="390" stroke="#22d3ee" stroke-width="0.4" stroke-opacity="0.10" />
          <line x1="85"  y1="115" x2="375" y2="345" stroke="#22d3ee" stroke-width="0.4" stroke-opacity="0.10" />
          <line x1="67"  y1="185" x2="393" y2="275" stroke="#22d3ee" stroke-width="0.4" stroke-opacity="0.08" />
          <line x1="312" y1="70"  x2="148" y2="390" stroke="#22d3ee" stroke-width="0.4" stroke-opacity="0.10" />
          <line x1="375" y1="115" x2="85"  y2="345" stroke="#22d3ee" stroke-width="0.4" stroke-opacity="0.10" />
        </g>

        <!-- specular shine -->
        <circle cx="230" cy="230" r="165" fill="url(#globeShine)" />
        <!-- rim light -->
        <circle cx="230" cy="230" r="165" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.25" />

        <!-- orbit ring 1 — equatorial -->
        <g class="orbit-1" filter="url(#ringGlow)">
          <ellipse cx="230" cy="230" rx="200" ry="58" fill="none" stroke="#22d3ee" stroke-width="1.2" stroke-opacity="0.35" stroke-dasharray="6 4" />
        </g>
        <!-- orbit ring 2 — polar -->
        <g class="orbit-2" filter="url(#ringGlow)">
          <ellipse cx="230" cy="230" rx="58" ry="200" fill="none" stroke="#38bdf8" stroke-width="0.9" stroke-opacity="0.28" stroke-dasharray="4 6" />
        </g>
        <!-- orbit ring 3 — diagonal -->
        <g transform="rotate(45 230 230)" class="orbit-3" filter="url(#ringGlow)">
          <ellipse cx="230" cy="230" rx="195" ry="52" fill="none" stroke="#7dd3fc" stroke-width="0.7" stroke-opacity="0.2" stroke-dasharray="3 7" />
        </g>

        <!-- glowing network nodes -->
        <g filter="url(#nodeGlow)">
          <circle
            v-for="(n, i) in nodes"
            :key="i"
            :cx="n.cx"
            :cy="n.cy"
            r="5"
            :fill="n.color"
            class="node-pulse"
            :style="{ animationDelay: n.delay }"
          />
          <!-- node connectors -->
          <line x1="200" y1="160" x2="320" y2="100" stroke="#22d3ee" stroke-width="0.7" stroke-opacity="0.30" />
          <line x1="320" y1="100" x2="380" y2="220" stroke="#38bdf8" stroke-width="0.7" stroke-opacity="0.25" />
          <line x1="380" y1="220" x2="260" y2="290" stroke="#22d3ee" stroke-width="0.7" stroke-opacity="0.25" />
          <line x1="260" y1="290" x2="160" y2="250" stroke="#7dd3fc" stroke-width="0.7" stroke-opacity="0.22" />
          <line x1="160" y1="250" x2="200" y2="160" stroke="#38bdf8" stroke-width="0.7" stroke-opacity="0.22" />
          <line x1="380" y1="220" x2="340" y2="340" stroke="#22d3ee" stroke-width="0.6" stroke-opacity="0.18" />
          <line x1="320" y1="100" x2="430" y2="160" stroke="#38bdf8" stroke-width="0.6" stroke-opacity="0.18" />
        </g>

        <!-- travelling dot — orbit ring 1 -->
        <g class="orbit-dot-1">
          <circle cx="430" cy="230" r="5" fill="#22d3ee" opacity="0.9" filter="url(#nodeGlow)" />
        </g>
        <!-- travelling dot — orbit ring 2 -->
        <g class="orbit-dot-2">
          <circle cx="230" cy="30" r="4" fill="#38bdf8" opacity="0.8" filter="url(#nodeGlow)" />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.globe-wrapper {
  position: relative;
  width: 100%;
  max-width: 520px;
  aspect-ratio: 1 / 0.88;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeInGlobe 1s ease-out both;
}

.glow-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(6, 182, 212, 0.18) 0%, rgba(14, 79, 122, 0.08) 55%, transparent 75%);
  filter: blur(24px);
  pointer-events: none;
  animation: glowBreathe 8s ease-in-out infinite;
}

.particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  opacity: 0;
  animation: particleFade linear infinite;
}

.globe-pivot {
  position: relative;
  z-index: 1;
  width: 88%;
}

.globe-svg {
  display: block;
  width: 100%;
  height: auto;
  animation: globeFloat 10s ease-in-out infinite;
  filter: drop-shadow(0 0 24px rgba(6, 182, 212, 0.35));
}

/* Globe grid — slow spin gives the rotation appearance */
.globe-grid {
  animation: gridSpin 26s linear infinite;
  transform-origin: 230px 230px;
}

/* Orbit rings — independent speeds */
.orbit-1 {
  animation: orbitSpin 16s linear infinite;
  transform-origin: 230px 230px;
}
.orbit-2 {
  animation: orbitSpin 24s linear infinite reverse;
  transform-origin: 230px 230px;
}
.orbit-3 {
  animation: orbitSpin 32s linear infinite;
  transform-origin: 230px 230px;
}

/* Travelling dots — match ring speeds */
.orbit-dot-1 {
  animation: orbitSpin 16s linear infinite;
  transform-origin: 230px 230px;
}
.orbit-dot-2 {
  animation: orbitSpin 24s linear infinite reverse;
  transform-origin: 230px 230px;
}

/* Node pulse */
.node-pulse {
  animation: nodePulse 3s ease-in-out infinite;
}

/* ── Keyframes ─────────────────────────────────────────────────────────── */

@keyframes fadeInGlobe {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

@keyframes glowBreathe {
  0%, 100% { opacity: 0.8; }
  50%       { opacity: 1.0; }
}

@keyframes globeFloat {
  0%, 100% { transform: translateY(0px)   scale(1); }
  50%       { transform: translateY(-10px) scale(1.012); }
}

@keyframes gridSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes orbitSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes nodePulse {
  0%, 100% { opacity: 0.45; r: 5; }
  50%       { opacity: 1;    r: 7; }
}

@keyframes particleFade {
  0%   { opacity: 0; }
  30%  { opacity: 0.5; }
  70%  { opacity: 0.5; }
  100% { opacity: 0; }
}

/* Respect reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .globe-wrapper,
  .globe-svg,
  .glow-bg,
  .globe-grid,
  .orbit-1, .orbit-2, .orbit-3,
  .orbit-dot-1, .orbit-dot-2,
  .node-pulse,
  .particle {
    animation: none;
  }
  .globe-wrapper { opacity: 1; }
}
</style>

