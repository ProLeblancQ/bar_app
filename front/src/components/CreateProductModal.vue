<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'

interface Product {
  id: number
  name: string
  description: string
  imageUrl: string
  price?: number
  categoryId?: number
}

const props = defineProps<{
  isVisible: boolean // Nommé isVisible pour être cohérent avec votre modal d'édition
}>()

// Émet les événements pour fermer le modal et notifier le succès de la création
const emit = defineEmits(['update:isVisible', 'product-created'])

// État initial du nouveau produit (aucun ID car il sera généré par le backend)
const newProduct = ref<Product>({
  id: 0, // Sera ignoré par le backend lors de la création
  name: '',
  description: '',
  imageUrl: '',
  price: 0,
  categoryId: 0,
})

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Réinitialise le formulaire lorsque le modal s'ouvre
watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      resetForm()
    }
  },
  { immediate: true } // Exécute une fois immédiatement si le modal est déjà visible
)

const resetForm = () => {
  newProduct.value = {
    id: 0,
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    categoryId: 0,
  }
  errorMessage.value = null
}

const closeModal = () => {
  emit('update:isVisible', false)
  resetForm() // Assurez-vous que le formulaire est réinitialisé en fermant
}

const createProduct = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const dataToSend = {
      name: newProduct.value.name,
      description: newProduct.value.description,
      imageUrl: newProduct.value.imageUrl,
      categoryId: newProduct.value.categoryId,
      price: newProduct.value.price,
    }

    // Endpoint pour la création est généralement le même que pour la liste, mais en POST
    const response = await axios.post('http://localhost:8080/api/cocktails', dataToSend)

    console.log('Product created successfully:', response.data)
    alert('Produit créé avec succès !')

    // Émet l'événement de succès avec les données du produit créé (incluant l'ID généré)
    emit('product-created', response.data)
    closeModal()
  } catch (error: any) {
    console.error('Error creating product:', error.response?.data || error.message)
    errorMessage.value =
      'Erreur lors de la création du produit: ' + (error.response?.data?.message || error.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">&times;</button>
      <h2>Créer un nouveau produit</h2>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="createProduct">
        <div class="form-group">
          <label for="create-name">Nom:</label>
          <input type="text" id="create-name" v-model="newProduct.name" required />
        </div>
        <div class="form-group">
          <label for="create-description">Description:</label>
          <textarea id="create-description" v-model="newProduct.description"></textarea>
        </div>
        <div class="form-group">
          <label for="create-imageUrl">URL de l'image:</label>
          <input type="text" id="create-imageUrl" v-model="newProduct.imageUrl" />
        </div>
        <div class="form-group">
          <label for="create-price">Prix :</label>
          <input type="number" id="create-price" v-model.number="newProduct.price" step="0.01" />
        </div>
        <div class="form-group">
          <label for="create-categoryId">Catégorie:</label>
          <input type="number" id="create-categoryId" v-model.number="newProduct.categoryId" />
        </div>

        <button type="submit" class="save-btn" :disabled="isLoading">
          {{ isLoading ? 'Création en cours...' : 'Créer le produit' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Réutiliser les styles de votre EditProductModal, ou ajouter les vôtres */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #1a1a1a;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 500px;
  position: relative;
  color: #fbfaf7;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #ffc300;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.2);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #ffc300;
  font-family: 'Oswald', sans-serif;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #f9ac37;
}

.form-group input[type='text'],
.form-group input[type='number'],
.form-group textarea {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #2a2a2a;
  color: #fbfaf7;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.save-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background-color: #ffc300;
  color: #111;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 20px;
}

.save-btn:hover {
  background-color: #f9ac37;
  transform: translateY(-2px);
}

.error-message {
  background-color: #ffcccc;
  color: #cc0000;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}
</style>