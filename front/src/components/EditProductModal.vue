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
  isVisible: boolean
  productToEdit: Product | null
}>()

const emit = defineEmits(['update:isVisible', 'product-updated'])

const editedProduct = ref<Product>({
  id: 0,
  name: '',
  description: '',
  imageUrl: '',
  price: 0,
  categoryId: 0,
})

watch(
  () => props.productToEdit,
  (newProduct) => {
    if (newProduct) {
      editedProduct.value = { ...newProduct }
    }
  },
  { immediate: true }
)

const closeModal = () => {
  emit('update:isVisible', false)
}

const saveChanges = async () => {
  try {
    const productId = editedProduct.value.id
    if (!productId) {
      console.error('Product ID is missing for update.')
      alert('Erreur: ID du produit manquant pour la mise à jour.')
      return
    }

    const dataToSend = {
      name: editedProduct.value.name,
      description: editedProduct.value.description,
      imageUrl: editedProduct.value.imageUrl,
      categoryId: editedProduct.value.categoryId,
      price: editedProduct.value.price,
    }

    const response = await axios.put(`http://localhost:8080/api/cocktails/${productId}`, dataToSend)

    console.log('Product updated successfully:', response.data)
    alert('Produit mis à jour avec succès !')

    emit('product-updated', response.data)
    closeModal()
  } catch (error: any) {
    console.error('Error updating product:', error.response?.data || error.message)
    alert(
      'Erreur lors de la mise à jour du produit: ' + (error.response?.data?.message || error.message)
    )
  }
}
</script>

<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">&times;</button>
      <h2>Modifier le produit: {{ editedProduct.name }}</h2>
      <form @submit.prevent="saveChanges">
        <div class="form-group">
          <label for="name">Nom:</label>
          <input type="text" id="name" v-model="editedProduct.name" required />
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description" v-model="editedProduct.description"></textarea>
        </div>
        <div class="form-group">
          <label for="imageUrl">URL de l'image:</label>
          <input type="text" id="imageUrl" v-model="editedProduct.imageUrl" />
        </div>
        <div class="form-group">
          <label for="price">Prix (si directement modifiable sur le cocktail):</label>
          <input type="number" id="price" v-model="editedProduct.price" step="0.01" />
        </div>
        <div class="form-group">
          <label for="categoryId">ID de la Catégorie:</label>
          <input type="number" id="categoryId" v-model="editedProduct.categoryId" />
        </div>

        <button type="submit" class="save-btn">Enregistrer les modifications</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Styles for the modal overlay and content */
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
</style>