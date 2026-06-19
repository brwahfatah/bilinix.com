<template>
  <div
    class="
      group relative
      bg-white dark:bg-gray-900
      rounded-2xl p-8
      border border-gray-200 dark:border-gray-800
      shadow-md hover:shadow-2xl
      transition-all duration-500
      hover:-translate-y-3
      overflow-hidden
    "
  >
    <!-- Gradient Glow -->
    <div
      class="
        absolute inset-0
        opacity-0 group-hover:opacity-100
        bg-gradient-to-br
        from-blue-500/10 to-indigo-500/10
        dark:from-indigo-400/10 dark:to-purple-500/10
        transition duration-500
      "
    ></div>

    <!-- Icon -->
    <div
      class="
        relative z-10 w-14 h-14 flex items-center justify-center
        rounded-xl
        bg-gradient-to-r from-blue-500 to-indigo-600
        dark:from-indigo-500 dark:to-purple-600
        text-white mb-6
        shadow-lg
      "
    >
      <slot name="icon" />
    </div>

    <!-- Content -->
    <h3
      class="
        relative z-10
        text-lg font-bold mb-2
        text-gray-900 dark:text-white
      "
    >
      {{ title }}
    </h3>

    <p
      class="
        relative z-10
        text-sm leading-relaxed
        text-gray-600 dark:text-gray-400
      "
    >
      {{ description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String
})
</script>
