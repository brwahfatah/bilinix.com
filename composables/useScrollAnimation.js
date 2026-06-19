import { ref, onMounted, onUnmounted } from 'vue'

export default function useScrollAnimation(options = {}) {
  const elRef = ref(null)
  const isVisible = ref(false)
  let observer = null

  onMounted(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer.disconnect()
          }
        },
        {
          threshold: options.threshold || 0.15
        }
      )

      if (elRef.value) observer.observe(elRef.value)
    }
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return { elRef, isVisible }
}
