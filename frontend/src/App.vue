<template>
  <div
    id="app"
    class="min-h-screen bg-light-gray text-dark-gray font-sans"
  >
    <component :is="layout">
      <router-view />
    </component>
    <ToastContainer />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DefaultLayout from './layouts/DefaultLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'
import ToastContainer from './components/common/ToastContainer.vue'

export default {
  name: 'App',
  components: {
    DefaultLayout,
    AuthLayout,
    ToastContainer
  },
  setup() {
    const route = useRoute()
    
    const layout = computed(() => {
      const layoutName = route.meta.layout || 'default'
      return layoutName === 'auth' ? 'AuthLayout' : 'DefaultLayout'
    })
    
    return {
      layout
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700&family=Roboto+Mono&display=swap');
</style>