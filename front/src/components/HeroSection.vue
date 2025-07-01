<template>
  <section class="hero">
    <div class="hero-text">
      <p>
        Bienvenue au Bar-App, le repaire des amateurs de cocktails et de vibes rock'n'roll. Ici,
        chaque boisson a son riff, chaque soirée son histoire.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">

</script>

<style scoped>
.hero {
  max-width: 100%;
  height: 60vh;
  overflow: hidden;

  background-image: url('../assets/bar_banner2.jpg');
  background-size: cover;
  background-repeat: no-repeat;

  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 5vw;
}

.hero-text {
  margin-top: 160px;
  color: white;
  text-align: left;
  text-shadow: 1px 1px 4px black;
  max-width: 800px;
  font-family: 'Oswald', sans-serif;
}

.hero-text p {
  font-size: 36px;
}
</style>
