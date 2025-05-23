<template>
  <div class="min-h-screen flex flex-col bg-light-gray py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="mx-auto text-center text-4xl font-bold text-indigo-600">
        MeaMen
      </h1>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-dark-gray">
        <slot name="title">
          Welcome to Meamen
        </slot>
      </h2>
      <p class="mt-2 text-center text-sm text-medium-gray">
        <slot name="subtitle">
          Fitness training management platform
        </slot>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <slot />
      </div>
      <div class="mt-4 text-center">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthLayout'
}
</script>