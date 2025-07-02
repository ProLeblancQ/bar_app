// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Définition de notre store d'authentification
export const useAuthStore = defineStore('auth', () => {
  // 'user' sera l'objet utilisateur connecté ou null
  const user = ref<User | null>(null);
  // 'isAuthenticated' sera vrai si un utilisateur est connecté
  const isAuthenticated = ref(false);

  // Fonction pour définir l'utilisateur et mettre à jour l'état de connexion
  function setUser(userData: User | null) {
    user.value = userData;
    isAuthenticated.value = !!userData; // true si userData n'est pas null, false sinon
  }

  // Fonction pour effacer l'utilisateur et son état de connexion (déconnexion)
  function clearUser() {
    user.value = null;
    isAuthenticated.value = false;
  }

  return { user, isAuthenticated, setUser, clearUser };
});