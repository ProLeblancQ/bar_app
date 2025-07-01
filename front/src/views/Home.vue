<template>
  <HeaderBar @category-selected="onCategorySelected" />
  <HeroSection />
  <CardCocktail :categoryId="selectedCategoryId" />
  <Footer />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeaderBar from '@/components/HeaderBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import CardCocktail from '@/components/CardCocktail.vue'
import Footer from '@/components/Footer.vue'

const selectedCategoryId = ref<number | null>(null)

const onCategorySelected = (category: any) => {
  selectedCategoryId.value = category?.category_id || null
}
</script>