<template>
  <header class="header">
    <nav class="nav-bar">
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
        <template v-if="authStore.isAuthenticated">
          <span class="welcome-message">
            Bienvenue à bord, {{ authStore.user?.name || 'Invité' }} !
          </span>
        </template>
      </div>

      <div class="logo-container">
        <img src="../assets/logo_bar_app_bgrm.png" alt="Bar-App Logo" class="logo" />
      </div>

      <div class="cart-button-fixed-position">
        <div class="cart-container" v-if="authStore.isAuthenticated && !authStore.user?.role?.includes('admin')">
          <button class="nav-btn cart-btn" @click="toggleCartDropdown">
            Panier ({{ cartStore.itemCount }})
          </button>

          <div v-if="showCartDropdown" class="dropdown cart-dropdown">
            <ul v-if="cartStore.itemCount > 0" class="cart-items-list">
              <li v-for="item in cartStore.items" :key="item.id" class="cart-item">
                <div class="cart-item-details">
                  <span class="cart-item-name">{{ item.name }}</span>
                  <span class="cart-item-quantity">x{{ item.quantity }}</span>
                  <span class="cart-item-price">{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
                <div class="cart-item-actions">
                  <button @click="cartStore.removeProduct(item.id)" class="remove-from-cart-btn">-</button>
                </div>
              </li>
            </ul>
            <p v-else class="empty-cart-message">Votre panier est vide.</p>

            <div v-if="cartStore.itemCount > 0" class="cart-summary">
              <p>Total: {{ formatPrice(cartStore.totalPrice) }}</p>
              <button class="nav-btn checkout-btn" @click="checkout">Commander</button>
              <button class="nav-btn clear-cart-btn" @click="cartStore.clearCart()">Vider le panier</button>
            </div>
          </div>
        </div>
        <div class="cart-container" v-else-if="authStore.isAuthenticated && authStore.user?.role?.includes('admin')">
          <button class="nav-btn cart-btn" @click="toggleAdminOrderTrackingModal">
            Suivi des Commandes
          </button>
        </div>
        </div>
      <div class="auth-container">
        <template v-if="authStore.isAuthenticated">
          <button class="nav-btn logout-btn" @click="handleLogout">Déconnexion</button>
        </template>
        <template v-else>
          <button class="nav-btn" @click="toggleDropdown">Se connecter</button>

          <div v-if="showDropdown" class="dropdown">
            <form @submit.prevent="isLogin ? handleLogin() : handleRegister()">
              <input v-if="!isLogin" v-model="form.name" type="text" placeholder="Nom" required />
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
              {{ isLogin ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous' }}
            </p>
          </div>
        </template>
      </div>
    </nav>
  </header>

  <AdminOrderTrackingModal
    :isVisible="showAdminOrderTrackingModal"
    @close="toggleAdminOrderTrackingModal"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';
import AdminOrderTrackingModal from './AdminOrderTrackingModal.vue'; // Importe le nouveau composant modal

interface Category {
  category_id: number;
  name: string;
}

interface CartItem {
  id: number;
  name: string;
  sizeId: number;
  price: number;
  quantity: number;
}

const authStore = useAuthStore();
const cartStore = useCartStore();

const showCategoryDropdown = ref(false);
const categories = ref<Category[]>([]);
const selectedCategory = ref<Category | null>(null);

const emit = defineEmits<{
  (e: 'category-selected', category: Category | null): void;
}>();

const toggleCategoryDropdown = () => {
  console.log('Toggle Catégories : ', !showCategoryDropdown.value);
  showCategoryDropdown.value = !showCategoryDropdown.value;
};

const selectCategory = (category: Category) => {
  console.log('HeaderBar: Catégorie sélectionnée, émission:', category);
  selectedCategory.value = category;
  emit('category-selected', category);
  showCategoryDropdown.value = false;
};

const clearCategory = () => {
  console.log('HeaderBar: Suppression des filtres, émission:', null);
  selectedCategory.value = null;
  emit('category-selected', null);
  showCategoryDropdown.value = false;
};

onMounted(async () => {
  console.log('HeaderBar monté. Chargement des catégories...');
  try {
    const res = await axios.get('http://localhost:8080/api/categories');
    categories.value = res.data;
    console.log('Catégories chargées avec succès:', categories.value);
  } catch (error) {
    console.error('Erreur chargement des catégories :', error);
  }
});

const showDropdown = ref(false);
const isLogin = ref(true);

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const toggleDropdown = () => {
  console.log('Toggle Connexion/Inscription : ', !showDropdown.value);
  showDropdown.value = !showDropdown.value;
  if (!showDropdown.value) {
    form.value.name = '';
    form.value.email = '';
    form.value.password = '';
    form.value.confirmPassword = '';
    isLogin.value = true;
  }
};

const showCartDropdown = ref(false);

const toggleCartDropdown = () => {
  console.log('Toggle Panier : ', !showCartDropdown.value);
  showCartDropdown.value = !showCartDropdown.value;
};

// NOUVEAU : État et fonction pour le modal admin
const showAdminOrderTrackingModal = ref(false);

const toggleAdminOrderTrackingModal = () => {
  showAdminOrderTrackingModal.value = !showAdminOrderTrackingModal.value;
  console.log('Toggle Suivi des commandes (Admin) : ', showAdminOrderTrackingModal.value);
};
// FIN NOUVEAU

const formatPrice = (price: number) =>
  price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

const checkout = async () => {
  console.log('Début du processus de commande.');
  console.log('État actuel du panier (itemCount) :', cartStore.itemCount);

  if (cartStore.itemCount === 0) {
    alert('Votre panier est vide. Impossible de passer commande.');
    console.warn('Commande annulée: panier vide.');
    return;
  }

  console.log('État d\'authentification (isAuthenticated) :', authStore.isAuthenticated);
  console.log('ID utilisateur (authStore.user?.id) :', authStore.user?.id);

  if (!authStore.isAuthenticated || !authStore.user?.id) {
    alert('Vous devez être connecté pour passer une commande.');
    console.warn('Commande annulée: utilisateur non connecté ou ID manquant.');
    return;
  }

  const orderItemsPayload = cartStore.items.map((item: CartItem) => ({
    cocktailId: item.id,
    sizeId: item.sizeId,
  }));
  console.log('Items du panier mappés pour le payload :', orderItemsPayload);

  const orderPayload = {
    userId: authStore.user.id,
    items: orderItemsPayload,
  };
  console.log('Payload complet de la commande à envoyer :', JSON.stringify(orderPayload, null, 2));

  try {
    console.log('Envoi de la requête POST à l\'API orders...');
    const response = await axios.post('http://localhost:8080/api/orders', orderPayload);
    console.log('Réponse de l\'API orders reçue. Statut :', response.status);

    if (response.status === 201) {
      alert('Commande passée avec succès ! Votre commande est en attente de préparation.');
      console.log('Commande réussie. Réponse complète de l\'API:', response.data);
      cartStore.clearCart();
      console.log('Panier vidé.');
      showCartDropdown.value = false;
      console.log('Dropdown du panier fermé.');
    } else {
      alert('Erreur lors du passage de la commande. Veuillez réessayer.');
      console.error('Erreur lors du passage de la commande - Statut:', response.status, 'Réponse:', response.data);
    }
  } catch (error) {
    console.error('Erreur API lors de la commande (bloc catch) :', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Détails de l\'erreur Axios - Statut:', error.response.status, 'Données:', error.response.data);
      alert(`Erreur de commande : ${error.response.data.message || error.response.statusText || error.message}`);
    } else {
      alert('Une erreur inattendue est survenue lors du passage de la commande.');
      console.error('Erreur non Axios :', error);
    }
  }
};

const toggleAuthMode = () => {
  console.log('Toggle mode authentification (login/register) : ', !isLogin.value ? 'Login' : 'Register');
  isLogin.value = !isLogin.value;
  form.value.name = '';
  form.value.email = '';
  form.value.password = '';
  form.value.confirmPassword = '';
};

const handleLogin = async () => {
  console.log('Tentative de connexion avec l\'email :', form.value.email);
  try {
    const response = await axios.post('http://localhost:8080/api/auth/login', {
      email: form.value.email,
      password: form.value.password,
    });
    console.log('Login success:', response.data);

    const loggedInUser = {
      id: response.data.user.id,
      name: response.data.user.name,
      email: response.data.user.email,
      role: response.data.user.role
    };

    authStore.setUser(loggedInUser);
    showDropdown.value = false;
    alert('Connexion réussie !');
    console.log('Utilisateur connecté et store mis à jour :', loggedInUser);
  } catch (error) {
    console.error('Erreur login:', error);
    alert('Erreur de connexion. Veuillez vérifier vos identifiants.');
  }
};

const handleRegister = async () => {
  console.log('Tentative d\'inscription pour l\'email :', form.value.email);
  if (form.value.password !== form.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas');
    console.warn('Inscription annulée: mots de passe non correspondants.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:8080/api/auth/register', {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
    });
    console.log('Inscription réussie:', response.data);
    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    isLogin.value = true;
    form.value.password = '';
    form.value.confirmPassword = '';
  } catch (error) {
    console.error('Erreur inscription:', error);
    alert('Erreur lors de l\'inscription. Cet email est peut-être déjà utilisé.');
  }
};

const handleLogout = () => {
  console.log('Déconnexion de l\'utilisateur.');
  authStore.clearUser();
  alert('Vous êtes déconnecté.');
};
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
  display: flex;
  align-items: center;
  gap: 10px;
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

.category-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.category-list li {
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.category-list li.selected {
  background-color: #ffc300;
  color: #111;
  font-weight: bold;
  border-radius: 4px;
}

/* NOUVEAU : Style pour le message de bienvenue */
.welcome-message {
  color: #FBFAF7;
  font-size: 1.1rem;
  font-weight: bold;
  margin-right: 15px;
}

---
.cart-button-fixed-position {
  position: absolute;
  top: 200%;
  right: 1000px;
  transform: translate(-50%, -50%);
  z-index: 1500;
  white-space: nowrap;
}

.cart-container {
  position: relative;
}

.cart-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 250px;
}

.cart-dropdown {
  left: auto;
  right: 0;
  width: 300px;
  padding: 1.5rem;
}

.empty-cart-message {
  color: #ccc;
  text-align: center;
  padding: 1rem 0;
}

.cart-items-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  max-height: 250px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #333;
  gap: 10px;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.cart-item-name {
  color: #fbfaf7;
  font-weight: bold;
  font-size: 0.95rem;
}

.cart-item-quantity,
.cart-item-price {
  color: #f9ac37;
  font-size: 0.85rem;
}

.cart-item-actions {
  flex-shrink: 0;
}

.remove-from-cart-btn {
  background: none;
  border: 1px solid #ffc300;
  color: #ffc300;
  padding: 0.2rem 0.6rem;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s ease, color 0.3s ease;
}

.remove-from-cart-btn:hover {
  background: #ffc300;
  color: #111;
}

.cart-summary {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #333;
  text-align: right;
  color: #fbfaf7;
  font-weight: bold;
  font-size: 1.1rem;
}

.cart-summary p {
  margin-bottom: 10px;
}

.checkout-btn, .clear-cart-btn {
  width: 100%;
  margin-top: 10px;
  padding: 0.7rem;
}

.checkout-btn {
  background-color: #ffc300;
  color: #111;
}

.checkout-btn:hover {
  background-color: #f9ac37;
}

.clear-cart-btn {
  background: transparent;
  border: 1px solid #ccc;
  color: #ccc;
}

.clear-cart-btn:hover {
  background: #ccc;
  color: #111;
}
</style>