<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth' // Assurez-vous que ce chemin est correct

// Interface pour les données du produit
interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  price?: number
  // IMPORTANT : Ajoutez cette propriété pour gérer le survol individuel de chaque carte
  showAdminIcons?: boolean
}

// Propriétés passées au composant (dans ce cas, categoryId pour filtrer les produits)
const props = defineProps({
  categoryId: {
    type: Number,
    default: null,
  },
})

// Référence réactive pour stocker la liste des produits
const products = ref<Product[]>([])

// Initialisation du store d'authentification Pinia
const authStore = useAuthStore()

// Propriété calculée pour vérifier si l'utilisateur est un administrateur
// Cette propriété est réactive et se mettra à jour si l'état d'authentification change
const isAdmin = computed(() => {
  return authStore.isAuthenticated && authStore.user?.role === 'admin'
})

// Déclaration des événements que ce composant peut émettre à son parent
// (pour gérer l'édition et la suppression des produits au niveau supérieur)
const emit = defineEmits(['edit-product', 'delete-product'])

// Fonction appelée quand le bouton d'édition est cliqué
const handleEditProduct = (productId: number) => {
  console.log(`CardCocktail - Éditer produit ID: ${productId}`)
  emit('edit-product', productId) // Émet l'événement 'edit-product' avec l'ID
}

// Fonction appelée quand le bouton de suppression est cliqué
const handleDeleteProduct = (productId: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    console.log(`CardCocktail - Supprimer produit ID: ${productId}`)
    emit('delete-product', productId) // Émet l'événement 'delete-product' avec l'ID
  }
}

// Fonction asynchrone pour récupérer les produits depuis l'API
const fetchProducts = async (categoryId: number | null) => {
  try {
    let url = 'http://localhost:8080/api/cocktails'
    if (categoryId !== null) {
      url += `?categoryId=${categoryId}`
    }
    console.log('CardCocktail - Requête API envoyée:', url)
    const res = await axios.get(url)

    // Transformation des données reçues : ajoute la propriété showAdminIcons à chaque produit
    // Ceci est crucial pour gérer le survol de chaque carte individuellement
    products.value = res.data.map((p: Product) => ({ ...p, showAdminIcons: false }))

    console.log('CardCocktail - Produits reçus. Nombre de produits:', products.value.length)
    console.log('CardCocktail - Contenu de products.value:', products.value)
  } catch (error) {
    console.error('CardCocktail - Erreur chargement cocktails :', error)
    products.value = [] // Vide le tableau en cas d'erreur
    console.log('CardCocktail - Tableau produits vidé après erreur. Taille:', products.value.length)
  }
}

// Fonction utilitaire pour formater le prix en devise EUR
const formatPrice = (price: number) =>
  price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

// Hook de cycle de vie : exécuté quand le composant est monté dans le DOM
onMounted(() => {
  console.log('CardCocktail - Composant monté. categoryId initial:', props.categoryId)
  fetchProducts(props.categoryId) // Charge les produits au montage
})

// Watcher : observe les changements de la prop categoryId et recharge les produits si elle change
watch(
  () => props.categoryId,
  (newId) => {
    console.log('CardCocktail - categoryId prop a changé. Nouvelle valeur:', newId)
    fetchProducts(newId)
  }
)
</script>

<template>
  <div class="product-list">
    <div
      v-for="product in products"
      :key="product.id"
      class="product-card"
      @mouseenter="product.showAdminIcons = true"  @mouseleave="product.showAdminIcons = false" >
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="card-content">
        <div class="description">
          <p class="product-description">{{ product.description }}</p>
        </div>
        <div class="image-container">
          <img :src="product.imageUrl" :alt="product.name" />
        </div>
         <div v-if="isAdmin && product.showAdminIcons" class="admin-icons">
            <button @click.stop="handleEditProduct(product.id)" class="admin-icon-btn edit-btn">
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
</template>

<style scoped>
/* Styles généraux de la liste de produits */
.product-list {
  display: flex;
  gap: 50px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 40px;
}

/* Styles de la carte individuelle du produit */
.product-card {
  position: relative; /* Indispensable pour positionner les icônes à l'intérieur */
  width: 230px;
  height: 230px;
  background-color: #141414;
  border-radius: 5px;
  overflow: hidden; /* Cache tout contenu qui dépasse les bordures */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  color: #FBFAF7;
  padding: 15px;
  box-sizing: border-box;
  transition: all 0.3s ease; /* Transition pour les effets de survol */
}

.product-name {
  margin: 0 0 10px 0;
  font-size: 20px;
  text-align: center;
  color: #FBFAF7;
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
  z-index: 2; /* Pour s'assurer que la description est au-dessus de l'image si elles se chevauchent */
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
  position: relative; /* Pour positionner les icônes d'admin par rapport à l'image */
  flex-shrink: 0;
  overflow: visible; /* Laisse l'image dépasser si elle est plus grande que son conteneur */
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
  color: #FBFAF7;
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
  gap: 50px; /* Espace entre les icônes */
  z-index: 20; /* Toujours au-dessus des autres éléments */
  opacity: 0; /* Cachées par défaut */
  transition: opacity 0.3s ease; /* Transition pour une apparition/disparition douce */
}

/* Rendre les icônes visibles et cliquables au survol de la carte entière */
.product-card:hover .admin-icons {
  opacity: 1;
  pointer-events: all; /* Rend les icônes cliquables au survol */
}

.admin-icon-btn {
  width: 50px; /* Grande taille des boutons */
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