<template>
  <HeaderBar @category-selected="onCategorySelected" />
  <HeroSection />

  <CardCocktail
    :products="products"
    :categoryId="selectedCategory?.id ?? null"
    @edit-product="handleEditProduct"
    @delete-product="handleDeleteProduct"
  />

  <Footer />

  <EditProductModal
    :isVisible="isEditModalVisible"
    :productToEdit="currentProductToEdit"
    @update:isVisible="isEditModalVisible = $event"
    @product-updated="handleProductUpdated"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import HeaderBar from '@/components/HeaderBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import CardCocktail from '@/components/CardCocktail.vue'
import Footer from '@/components/Footer.vue'
import EditProductModal from '@/components/EditProductModal.vue'

interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  price?: number
  categoryId?: number
  showAdminIcons?: boolean
}

const selectedCategory = ref<{ id: number; name: string } | null>(null)
const products = ref<Product[]>([])

const isEditModalVisible = ref(false)
const currentProductToEdit = ref<Product | null>(null)

const fetchProducts = async () => {
  try {
    let url = 'http://localhost:8080/api/cocktails'
    if (selectedCategory.value !== null) {
      url += `?categoryId=${selectedCategory.value.id}`
    }
    console.log('App.vue - Requête API envoyée:', url)
    const res = await axios.get(url)
    products.value = res.data.map((p: Product) => ({ ...p, showAdminIcons: false }))
    console.log('App.vue - Produits reçus. Nombre de produits:', products.value.length)
  } catch (error) {
    console.error('App.vue - Erreur chargement cocktails :', error)
    products.value = []
  }
}

const onCategorySelected = (category: { id: number; name: string } | null) => {
  selectedCategory.value = category
  console.log('App.vue: Catégorie sélectionnée mise à jour:', selectedCategory.value)
  console.log('App.vue: ID envoyé à CardCocktail:', selectedCategory.value?.id ?? null)
  fetchProducts()
}

const handleEditProduct = (product: Product) => {
  console.log('App.vue - Édition du produit :', product)
  currentProductToEdit.value = product
  isEditModalVisible.value = true
}

const handleProductUpdated = (updatedProduct: Product) => {
  console.log('Produit mis à jour dans App.vue:', updatedProduct)
  fetchProducts()
}

const handleDeleteProduct = async (productId: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
    try {
      await axios.delete(`http://localhost:8080/api/cocktails/${productId}`)
      alert('Produit supprimé avec succès !')
      fetchProducts()
    } catch (error: any) {
      console.error('Erreur lors de la suppression du produit:', error.response?.data || error.message)
      alert('Erreur lors de la suppression du produit.')
    }
  }
}

onMounted(() => {
  console.log('App.vue - Composant monté.')
  fetchProducts()
})
</script>