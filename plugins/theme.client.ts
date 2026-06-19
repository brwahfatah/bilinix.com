export default defineNuxtPlugin(() => {
  const stored = localStorage.getItem('theme')

  if (stored === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (stored === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    // fallback to system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', prefersDark)
  }
})
