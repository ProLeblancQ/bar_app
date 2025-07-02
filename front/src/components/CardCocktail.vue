<template>
  <div class="product-list">
    <div v-for="product in products" :key="product.id" class="product-card">
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="card-content">
        <div class="description">
          <p class="product-description">{{ product.description }}</p>
        </div>
        <div class="image-container">
          <img :src="product.imageUrl" :alt="product.name" />
        </div>
      </div>
      <div class="bottom-bar">
        <!-- Si tu n'as pas le prix, tu peux supprimer cette ligne ou l’adapter -->
        <p class="product-price">{{ formatPrice(product.price || 0) }}</p>
        <button class="add-to-cart-btn">Ajouter</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CardCocktail',
  data() {
    return {
      products: []
    }
  },
  methods: {
    formatPrice(price) {
      return price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
    }
  },
  mounted() {
    axios.get('http://localhost:8080/api/cocktails')
      .then(response => {
        this.products = response.data
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des cocktails:', error)
      })
  }
}
</script>

<style scoped>

.product-list {
  display: flex;
  gap: 50px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 40px;
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
  color: #FBFAF7;
  padding: 15px;
  box-sizing: border-box;
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
  opacity: 0.2;
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
</style>
