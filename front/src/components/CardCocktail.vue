<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import CreateProductModal from './CreateProductModal.vue' // <-- Importez le nouveau modal

interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  price?: number
  categoryId?: number
  showAdminIcons?: boolean
}

const props = defineProps({
  categoryId: {
    type: Number,
    default: null,
  },
})

const products = ref<Product[]>([])
const authStore = useAuthStore()

const isAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'admin'
})

const emit = defineEmits(['edit-product', 'delete-product'])

// --- NOUVEAUX ÉTATS ET FONCTIONS POUR LE MODAL DE CRÉATION ---
const isCreateModalVisible = ref(false) // Contrôle la visibilité du modal de création

const openCreateModal = () => {
  isCreateModalVisible.value = true
}

const handleProductCreated = (newProduct: Product) => {
  // Ajoutez le nouveau produit à la liste actuelle et rafraîchissez
  // products.value.push(newProduct); // Option simple mais ne tient pas compte du tri/filtrage
  fetchProducts(props.categoryId) // Recharger tous les produits pour s'assurer que la liste est à jour
}
// --- FIN NOUVEAUX ÉTATS ET FONCTIONS POUR LE MODAL DE CRÉATION ---

const handleEditProduct = (product: Product) => {
  console.log(`CardCocktail - Éditer produit ID: ${product.id}`)
  emit('edit-product', product)
}

const handleDeleteProduct = (productId: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    console.log(`CardCocktail - Supprimer produit ID: ${productId}`)
    emit('delete-product', productId)
  }
}

const fetchProducts = async (categoryId: number | null) => {
  try {
    let url = 'http://localhost:8080/api/cocktails'
    if (categoryId !== null) {
      url += `?categoryId=${categoryId}`
    }
    console.log('CardCocktail - Requête API envoyée:', url)
    const res = await axios.get(url)

    products.value = res.data.map((p: Product) => ({ ...p, showAdminIcons: false }))

    console.log('CardCocktail - Produits reçus. Nombre de produits:', products.value.length)
  } catch (error) {
    console.error('CardCocktail - Erreur chargement cocktails :', error)
    products.value = []
  }
}

const formatPrice = (price: number) =>
  price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

onMounted(() => {
  fetchProducts(props.categoryId)
})

watch(
  () => props.categoryId,
  (newId) => {
    fetchProducts(newId)
  }
)
</script>

<template>
  <div class="product-list-wrapper">
    <div v-if="isAdmin" class="create-product-section">
      <h2 class="create-product-title" @click="openCreateModal">
        <img src="../assets/add.png" alt="Ajouter" class="add-icon" /> 
        Ajouter un nouveau produit
      </h2>
    </div>

    <div class="product-list">
      <div
        v-for="product in products"
        :key="product.id"
        class="product-card"
        @mouseenter="product.showAdminIcons = true"
        @mouseleave="product.showAdminIcons = false"
      >
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="card-content">
          <div class="description">
            <p class="product-description">{{ product.description }}</p>
          </div>
          <div class="image-container">
            <img :src="product.imageUrl" :alt="product.name" />
          </div>
          <div v-if="isAdmin && product.showAdminIcons" class="admin-icons">
            <button @click.stop="handleEditProduct(product)" class="admin-icon-btn edit-btn">
              <img src="../assets/edit.png" alt="Modifier" class="icon" />
            </button>
            <button @click.stop="handleDeleteProduct(product.id)" class="admin-icon-btn delete-btn">
              <img src="../assets/delete.png" alt="Supprimer" class="icon" />
            </button>
          </div>
        </div>
        <div class="bottom-bar">
          <p class="product-price">{{ formatPrice(product.price || 0) }}</p>
          <button class="add-to-cart-btn">Ajouter</button>
        </div>
      </div>

      <p v-if="products.length === 0" class="no-cocktail-message-debug">
        Le bar-app ne sert pas encore de boisson sans alcool 😞
      </p>
    </div>

    <CreateProductModal
      :isVisible="isCreateModalVisible"
      @update:isVisible="isCreateModalVisible = $event"
      @product-created="handleProductCreated"
    />
  </div>
</template>

<style scoped>
/* NOUVEAUX STYLES POUR LE BOUTON DE CRÉATION */
.product-list-wrapper {
  position: relative; /* Important pour positionner la section de création par rapport à elle */
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrer le contenu horizontalement */
  padding: 40px;
}

.create-product-section {
  width: 100%; /* S'étend sur toute la largeur disponible */
  display: flex;
  justify-content: flex-start; /* Aligner le contenu à gauche */
  margin-bottom: 20px; /* Espace en dessous du titre */
  max-width: 1100px; /* Adapter à la largeur de votre liste de cartes si nécessaire */
}

.create-product-title {
  display: flex;
  align-items: center;
  gap: 10px; /* Espace entre l'icône et le texte */
  font-size: 24px;
  color: #fbfaf7; /* Couleur jaune pour le titre */
  cursor: pointer;
  transition: color 0.3s ease;
  font-family: 'Oswald', sans-serif;
}

.create-product-title:hover {
  color: #f9ac37; /* Changement de couleur au survol */
}

.add-icon {
  width: 30px;
  height: 30px;
}
/* Styles existants */
.product-list {
  display: flex;
  gap: 50px;
  flex-wrap: wrap;
  justify-content: center;
}

.product-card {
  position: relative;
  width: 230px;
  height: 230px;
  background-color: #141414;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  color: #fbfaf7;
  padding: 15px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.product-name {
  margin: 0 0 10px 0;
  font-size: 20px;
  text-align: center;
  color: #fbfaf7;
  font-family: 'Oswald', sans-serif;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  display: flex;
  position: relative;
}

.description {
  flex: 1;
  display: flex;
  align-items: center;
  padding-right: 10px;
  z-index: 2;
  position: relative;
  text-align: left;
}

.description p {
  margin: 0;
  color: #f9ac37;
  font-size: 16px;
  font-family: 'Oswald', sans-serif;
}

.image-container {
  width: 120px;
  height: 120px;
  position: relative;
  flex-shrink: 0;
  overflow: visible;
}

.image-container img {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
  z-index: 1;
}

.bottom-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding-top: 10px;
}

.product-price {
  font-weight: bold;
  font-size: 16px;
  color: #fbfaf7;
}

.add-to-cart-btn {
  background: transparent;
  color: #ffc300;
  border: 1px solid #ffc300;
  padding: 0.5rem 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #ffc300;
  color: #111;
}

.no-cocktail-message-debug {
  font-family: 'Oswald', sans-serif;
  color: #111;
  font-size: 24px;
  text-align: center;
  width: 80%;
  background-color: #ffc300;
  padding: 15px;
  margin-top: 50px;
}

/* --- STYLES SPÉCIFIQUES AUX ICÔNES D'ADMINISTRATION --- */
.admin-icons {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  display: flex;
  gap: 50px;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Rendre les icônes visibles et cliquables au survol de la carte entière */
.product-card:hover .admin-icons {
  opacity: 1;
  pointer-events: all;
}

.admin-icon-btn {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.admin-icon-btn .icon {
  width: 50px;
  height: 50px;
}
</style>