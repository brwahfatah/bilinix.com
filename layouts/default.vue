<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { publicNavItems } from '~/data/site'

const route = useRoute()
const menuOpen = ref(false)
const currentYear = computed(() => new Date().getFullYear())

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}

watch(() => route.fullPath, () => { menuOpen.value = false })

const productLinks = [
  {
    label: 'Shared Hosting',
    to: '/hosting',
    desc: 'Control Panel, NVMe SSD, free SSL',
    icon: 'hosting',
  },
  {
    label: 'Cloud VPS',
    to: '/vps',
    desc: 'KVM, root access, NVMe SSD',
    icon: 'vps',
  },
  {
    label: 'Dedicated Servers',
    to: '/dedicated',
    desc: 'Bare-metal, full hardware control',
    icon: 'dedicated',
  },
  {
    label: 'Domain Names',
    to: '/domains',
    desc: '.com, .io, .dev & 100+ TLDs',
    icon: 'domain',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100">

    <!-- ───── NAVBAR ───── -->
    <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95">
      <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="Bilinix home">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white shadow-glow-sm">
            B
          </span>
          <span class="flex flex-col">
            <span class="text-[15px] font-black leading-tight tracking-tight text-slate-950 dark:text-white">Bilinix</span>
            <span class="hidden text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:block">Hosting</span>
          </span>
        </NuxtLink>

        <!-- Desktop nav -->
        <ul class="hidden items-center gap-0.5 text-sm font-medium lg:flex">
          <li v-for="item in publicNavItems" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="relative rounded-lg px-3.5 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              :class="isActive(item.to) ? 'bg-slate-100 text-slate-950 dark:bg-slate-900 dark:text-white' : ''"
            >
              {{ item.label }}
              <span v-if="isActive(item.to)" class="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-emerald-500" />
            </NuxtLink>
          </li>
        </ul>

        <!-- Right side actions -->
        <div class="hidden items-center gap-2 lg:flex">
          <MDarkToggle />
          <MCartBadge />
          <NuxtLink to="/auth/login" class="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white">
            Log in
          </NuxtLink>
          <NuxtLink to="/auth/signup" class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
            Get started
          </NuxtLink>
        </div>

        <!-- Mobile actions -->
        <div class="flex items-center gap-2 lg:hidden">
          <MCartBadge />
          <MDarkToggle />
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            :aria-expanded="menuOpen"
            aria-label="Toggle navigation"
            @click="menuOpen = !menuOpen"
          >
            <svg v-if="!menuOpen" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </nav>

      <!-- Mobile menu -->
      <div v-if="menuOpen" class="border-t border-slate-200 bg-white px-4 pb-5 pt-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        <div class="space-y-1 pb-3">
          <NuxtLink
            v-for="item in publicNavItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition dark:text-slate-200"
            :class="isActive(item.to) ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400' : 'hover:bg-slate-100 dark:hover:bg-slate-900'"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="isActive(item.to) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'" />
            {{ item.label }}
          </NuxtLink>
        </div>
        <div class="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <NuxtLink to="/auth/login" class="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900">
            Log in
          </NuxtLink>
          <NuxtLink to="/auth/signup" class="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700">
            Get started
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- ───── MAIN ───── -->
    <main class="bg-white transition-colors dark:bg-slate-950">
      <slot />
    </main>

    <!-- ───── FOOTER ───── -->
    <footer class="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid gap-10 md:grid-cols-5">

          <!-- Brand col -->
          <div class="md:col-span-2">
            <NuxtLink to="/" class="flex items-center gap-2.5">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-black text-white">B</span>
              <span class="text-[15px] font-black text-slate-950 dark:text-white">Bilinix</span>
            </NuxtLink>
            <p class="mt-4 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
              Hosting, VPS, dedicated servers, and domain registration. Built for customers who need clarity over complexity.
            </p>
            <div class="mt-5 flex items-center gap-1">
              <span class="h-2 w-2 rounded-full bg-emerald-500" />
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">All systems operational</span>
            </div>
          </div>

          <!-- Products -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Products</h3>
            <ul class="mt-4 space-y-2.5">
              <li><NuxtLink to="/hosting" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Shared Hosting</NuxtLink></li>
              <li><NuxtLink to="/vps" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Cloud VPS</NuxtLink></li>
              <li><NuxtLink to="/dedicated" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Dedicated Servers</NuxtLink></li>
              <li><NuxtLink to="/domains" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Domain Names</NuxtLink></li>
            </ul>
          </div>

          <!-- Account -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Account</h3>
            <ul class="mt-4 space-y-2.5">
              <li><NuxtLink to="/auth/login" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Log In</NuxtLink></li>
              <li><NuxtLink to="/auth/signup" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Create Account</NuxtLink></li>
              <li><NuxtLink to="/dashboard" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Client Area</NuxtLink></li>
              <li><NuxtLink to="/cart" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Shopping Cart</NuxtLink></li>
            </ul>
          </div>

          <!-- Legal -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Company</h3>
            <ul class="mt-4 space-y-2.5">
              <li><NuxtLink to="/privacy" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="/contact" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">Contact Us</NuxtLink></li>
              <li><NuxtLink to="/about" class="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">About</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:flex-row sm:items-center">
          <p class="text-sm text-slate-500 dark:text-slate-400">© {{ currentYear }} Bilinix Hosting. All rights reserved.</p>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Enterprise Infrastructure
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              Global Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
