<template>
  <header class="header">
    <nav class="nav-bar">
      <!-- Dropdown catégories (inchangé) -->
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
      
      <!-- Logo (inchangé) -->
      <div class="logo-container">
        <img src="../assets/logo_bar_app_bgrm.png" alt="Bar-App Logo" class="logo" />
      </div>

      <!-- NOUVEAU : Logique d'affichage conditionnel pour l'authentification -->
      <div class="auth-container">
        <template v-if="authStore.isAuthenticated">
          <button class="nav-btn logout-btn" @click="handleLogout">Déconnexion</button>
        </template>
        <template v-else>
          <!-- Bouton de connexion/inscription si l'utilisateur n'est PAS connecté -->
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // <-- NOUVEAU : Importez votre store Pinia

interface Category {
  category_id: number;
  name: string;
}

// NOUVEAU : Initialisez et utilisez le store Pinia
const authStore = useAuthStore();

const showCategoryDropdown = ref(false);
const categories = ref<Category[]>([]);
const selectedCategory = ref<Category | null>(null);

const emit = defineEmits<{
  (e: 'category-selected', category: Category | null): void;
}>();

const toggleCategoryDropdown = () => {
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
  try {
    const res = await axios.get('http://localhost:8080/api/categories');
    categories.value = res.data;
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
  showDropdown.value = !showDropdown.value;
  // Optionnel : Réinitialiser les champs et le mode quand on ouvre/ferme
  if (!showDropdown.value) { // Si on ferme le dropdown
    form.value.name = '';
    form.value.email = '';
    form.value.password = '';
    form.value.confirmPassword = '';
    isLogin.value = true; // Revenir au mode connexion par défaut
  }
};

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
  form.value.name = '';
  form.value.email = '';
  form.value.password = '';
  form.value.confirmPassword = '';
};

// NOUVEAU : Gestion de la connexion
const handleLogin = async () => {
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

    authStore.setUser(loggedInUser); // Stocke l'utilisateur dans Pinia
    showDropdown.value = false; // Ferme le formulaire de connexion
    alert('Connexion réussie !'); // Message de succès
  } catch (error) {
    console.error('Erreur login:', error);
    alert('Erreur de connexion. Veuillez vérifier vos identifiants.'); // Message d'erreur
  }
};

// NOUVEAU : Gestion de l'inscription
const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas');
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
    isLogin.value = true; // Revenir au mode connexion après inscription
    form.value.password = '';
    form.value.confirmPassword = '';
  } catch (error) {
    console.error('Erreur inscription:', error);
    alert('Erreur lors de l\'inscription. Cet email est peut-être déjà utilisé.');
  }
};

// NOUVEAU : Gestion de la déconnexion
const handleLogout = () => {
  authStore.clearUser(); // Efface l'utilisateur du store Pinia
  alert('Vous êtes déconnecté.');
  // Optionnel : Redirection vers la page d'accueil ou autre (avec router.push('/'))
};
</script>

<style scoped>
/* Vos styles CSS existants */
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

/* MODIFIÉ : Pour aligner le message et le bouton de déconnexion */
.auth-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px; /* Espace entre les éléments */
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
  color: #FBFAF7; /* Couleur du texte */
  font-size: 1.1rem;
  font-weight: bold;
  margin-right: 15px; /* Pour espacer du bouton de déconnexion */
}

.logout-btn {
  /* Pas de styles spécifiques par défaut, prendra les styles de .nav-btn */
}
</style>