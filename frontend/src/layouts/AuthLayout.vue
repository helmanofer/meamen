<template>
  <div class="min-h-screen flex flex-col bg-light-gray py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-12 w-auto" src="https://via.placeholder.com/120x48?text=Meamen" alt="Meamen" />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-dark-gray">
        <slot name="title">Welcome to Meamen</slot>
      </h2>
      <p class="mt-2 text-center text-sm text-medium-gray">
        <slot name="subtitle">Fitness training management platform</slot>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <slot></slot>
      </div>
      <div class="mt-4 text-center">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>