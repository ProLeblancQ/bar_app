<template>
  <header class="header">
    <nav class="nav-bar">
      <!-- Dropdown catégories -->
      <div class="auth-container">
        <button class="nav-btn" @click="toggleCategoryDropdown">Catégories</button>

        <div v-if="showCategoryDropdown" class="dropdown">
          <ul class="category-list">
            <li
              v-for="category in categories"
              :key="category.category_id"
              :class="{ selected: selectedCategory?.category_id === category.category_id }"
              @click="selectCategory(category)"
            >
              {{ category.name }}
            </li>
          </ul>
          <p class="switch-auth" @click="clearCategory">Supprimer les filtres</p>
        </div>
      </div>

      <!-- Logo -->
      <div class="logo-container">
        <img src="../assets/logo_bar_app_bgrm.png" alt="Bar-App Logo" class="logo" />
      </div>

      <!-- Connexion / Inscription -->
      <div class="auth-container">
        <button class="nav-btn" @click="toggleDropdown">Se connecter</button>

        <div v-if="showDropdown" class="dropdown">
          <form @submit.prevent="isLogin ? handleLogin() : handleRegister()">
            <input v-model="form.email" type="email" placeholder="Email" required />
            <input v-model="form.password" type="password" placeholder="Mot de passe" required />

            <input
              v-if="!isLogin"
              v-model="form.confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              required
            />

            <button type="submit">{{ isLogin ? 'Connexion' : 'Inscription' }}</button>
          </form>

          <p class="switch-auth" @click="toggleAuthMode">
            {{
              isLogin ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'
            }}
          </p>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type { Category } from '@/types'

// Dropdown catégories
const showCategoryDropdown = ref(false)
const categories = ref<Category[]>([])
const selectedCategory = ref<Category | null>(null)
const emit = defineEmits<{
  (e: 'category-selected', category: Category | null): void
}>()

const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
}

const selectCategory = (category: Category) => {
  selectedCategory.value = category
  emit('category-selected', category)
  showCategoryDropdown.value = false
}

const clearCategory = () => {
  selectedCategory.value = null
  emit('category-selected', null)
  showCategoryDropdown.value = false
}

// Charger les catégories au montage
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/categories')
    categories.value = res.data
  } catch (error) {
    console.error('Erreur chargement des catégories :', error)
  }
})

// Dropdown connexion / inscription
const showDropdown = ref(false)
const isLogin = ref(true)

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
}

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email: form.value.email,
      password: form.value.password,
    })
    console.log('Login success:', response.data)
    // TODO: gérer token / redirection
  } catch (error) {
    console.error('Erreur login:', error)
  }
}

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }

  try {
    const response = await axios.post('http://localhost:8080/api/auth/register', {
      email: form.value.email,
      password: form.value.password,
    })
    console.log('Inscription réussie:', response.data)
    isLogin.value = true
    form.value.password = ''
    form.value.confirmPassword = ''
  } catch (error) {
    console.error('Erreur inscription:', error)
  }
}
</script>





<style scoped>

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #111;
  padding: 1rem 2rem 3rem;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
}

.nav-bar {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* Boutons gauche/droite */
.nav-btn {
  background: transparent;
  color: #ffc300;
  border: 1px solid #ffc300;
  padding: 0.5rem 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.3s ease;
}

.nav-btn:hover {
  background: #ffc300;
  color: #111;
}

.logo-container {
  position: absolute;
  top: 200%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1500;
}

.logo {
  height: 150px;
  border-radius: 50%;
  background: #111;
  padding: 0.3rem;
}

.auth-container {
  position: relative;
}

.dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background-color: #222;
  border: 1px solid #ffc300;
  border-radius: 0.5rem;
  padding: 1rem;
  z-index: 2000;
  width: 250px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
}

.dropdown form {
  display: flex;
  flex-direction: column;
}

.dropdown input {
  margin-bottom: 0.8rem;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
}

.dropdown button {
  background-color: #ffc300;
  color: #111;
  font-weight: bold;
  padding: 0.5rem;
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.dropdown button:hover {
  background-color: #e6b200;
}

.switch-auth {
  margin-top: 0.8rem;
  color: #ffc300;
  cursor: pointer;
  font-size: 0.85rem;
  text-align: center;
}
</style>
