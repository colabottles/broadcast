<template>
  <div></div>
</template>

<script setup>
const router = useRouter()

// Redirect /dashboard to /
onMounted(() => {
  router.push('/')
})
</script>