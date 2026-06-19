<script setup lang="ts">
</script>

<template>
  <main class="bg-slate-50 px-4 py-20 dark:bg-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <AppEmptyState
        icon="domain"
        title="Domain checkout moved to the cart"
        description="Domains now use the same review and checkout flow as VPS and hosting services."
      >
        <template #actions>
          <AppButton @click="navigateTo('/cart')">View Cart</AppButton>
          <AppButton variant="outline" @click="navigateTo('/domains')">Search Domains</AppButton>
        </template>
      </AppEmptyState>
    </div>
  </main>
</template>
