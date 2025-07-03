import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Interface pour un produit tel qu'il est stocké dans le panier
interface CartItem {
  id: number
  name: string
  price: number
  imageUrl: string
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  // Getter pour obtenir le nombre total d'articles dans le panier
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  // Getter pour obtenir le prix total du panier
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  // Action pour ajouter un produit au panier
  const addProduct = (product: { id: number; name: string; price?: number; imageUrl: string }) => {
    const existingItem = items.value.find((item) => item.id === product.id)
    
    // Assurez-vous que le prix est un nombre avant de l'utiliser
    const productPrice = product.price ?? 0; 

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: productPrice, // Utiliser la valeur validée
        imageUrl: product.imageUrl,
        quantity: 1,
      })
    }
  }

  // Action pour supprimer un produit (ou une quantité) du panier
  const removeProduct = (productId: number) => {
    const existingItem = items.value.find((item) => item.id === productId)
    if (existingItem) {
      if (existingItem.quantity > 1) {
        existingItem.quantity--
      } else {
        items.value = items.value.filter((item) => item.id !== productId)
      }
    }
  }

  // Action pour vider complètement le panier
  const clearCart = () => {
    items.value = []
  }

  return {
    items,
    itemCount,
    totalPrice,
    addProduct,
    removeProduct,
    clearCart,
  }
})