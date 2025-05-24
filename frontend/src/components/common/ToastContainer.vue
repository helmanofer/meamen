<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-3">
      <transition-group
        name="toast"
        tag="div"
        class="space-y-3"
      >
        <Toast
          v-for="toast in toasts"
          :key="toast.id"
          :type="toast.type"
          :title="toast.title"
          :message="toast.message"
          :duration="toast.duration"
          :persistent="toast.persistent"
          @close="removeToast(toast.id)"
        />
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast';
import Toast from './Toast.vue';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>