<template>
  <HeaderBar @category-selected="onCategorySelected" />
  <HeroSection />
  
  <CardCocktail
    :products="products" :categoryId="selectedCategory?.id ?? null"
    @edit-product="handleEditProduct"  @delete-product="handleDeleteProduct" />
  
  <Footer />

  <EditProductModal
    :isVisible="isEditModalVisible"
    :productToEdit="currentProductToEdit"
    @update:isVisible="isEditModalVisible = $event" @product-updated="handleProductUpdated" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue' // Ajout de onMounted et watch
import axios from 'axios' // Ajout d'axios pour la récupération des données
import HeaderBar from '@/components/HeaderBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import CardCocktail from '@/components/CardCocktail.vue'
import Footer from '@/components/Footer.vue'
import EditProductModal from '@/components/EditProductModal.vue' // Import du nouveau composant de modale

// Interface pour les données du produit (cohérente entre les composants)
interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  price?: number
  categoryId?: number
  showAdminIcons?: boolean // Pour l'état local de l'UI dans CardCocktail
}

// État de la catégorie sélectionnée (provenant de HeaderBar)
const selectedCategory = ref<{ id: number; name: string } | null>(null)

// Liste principale des produits, maintenant gérée dans App.vue
const products = ref<Product[]>([])

// --- État lié à la modale ---
const isEditModalVisible = ref(false)
const currentProductToEdit = ref<Product | null>(null)

// Fonction asynchrone pour récupérer les produits depuis l'API
const fetchProducts = async () => {
  try {
    let url = 'http://localhost:8080/api/cocktails'
    if (selectedCategory.value !== null) {
      url += `?categoryId=${selectedCategory.value.id}` // Utilise .id de selectedCategory
    }
    console.log('App.vue - Requête API envoyée:', url)
    const res = await axios.get(url)
    // Ajoute showAdminIcons pour l'état local de l'UI dans CardCocktail
    products.value = res.data.map((p: Product) => ({ ...p, showAdminIcons: false }))
    console.log('App.vue - Produits reçus. Nombre de produits:', products.value.length)
  } catch (error) {
    console.error('App.vue - Erreur chargement cocktails :', error)
    products.value = []
  }
}

// --- Gestionnaires d'événements ---

// Gestionnaire pour la sélection de catégorie depuis HeaderBar
const onCategorySelected = (category: { id: number; name: string } | null) => { 
  selectedCategory.value = category
  console.log('App.vue: Catégorie sélectionnée mise à jour:', selectedCategory.value)
  console.log('App.vue: ID envoyé à CardCocktail:', selectedCategory.value?.id ?? null)
  fetchProducts() // Récupère les produits à nouveau lorsque la catégorie change
}

// Cette fonction reçoit l'objet `product` complet émis par CardCocktail
const handleEditProduct = (product: Product) => {
  currentProductToEdit.value = product // Définit le produit à modifier dans la modale
  isEditModalVisible.value = true // Affiche la modale
}

// Cette fonction gère la mise à jour réussie d'un produit par la modale
const handleProductUpdated = (updatedProduct: Product) => {
  console.log('Produit mis à jour dans App.vue:', updatedProduct)
  // Récupère à nouveau les produits pour s'assurer que la liste est complètement à jour
  fetchProducts() 
}

// Cette fonction gère l'événement de suppression
const handleDeleteProduct = async (productId: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
    try {
      await axios.delete(`http://localhost:8080/api/cocktails/${productId}`) // Adaptez le point d'API si nécessaire
      alert('Produit supprimé avec succès !')
      fetchProducts() // Récupère à nouveau les produits après suppression pour mettre à jour la liste
    } catch (error: any) {
      console.error('Erreur lors de la suppression du produit:', error.response?.data || error.message)
      alert('Erreur lors de la suppression du produit.')
    }
  }
}

// --- Hooks de cycle de vie ---
onMounted(() => {
  console.log('App.vue - Composant monté.')
  fetchProducts() // Récupération initiale lorsque App.vue est monté
})

// Pas besoin de "watcher" pour selectedCategory ici, car onCategorySelected appelle déjà fetchProducts
</script>