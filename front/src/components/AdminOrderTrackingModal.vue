<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-modal-btn" @click="closeModal">&times;</button>
      <h2>Suivi des Commandes</h2>

      <div class="kanban-board">
        <div v-for="status in orderStatuses" :key="status.key" class="kanban-column">
          <h3>{{ status.name }}</h3>
          <div class="orders-list">
            <div
              v-for="order in filteredOrdersByStatus(status.key)"
              :key="order.orderId"
              class="order-card"
            >
              <p><strong>Commande #{{ order.orderId }}</strong></p>
              <p>Client: {{ order.user?.name || 'Inconnu' }}</p>
              <p>Date: {{ formatDate(order.orderDate) }}</p>
              <h4>Articles:</h4>
              <ul>
                <li v-for="item in order.orderItems" :key="item.orderItemId">
                  {{ item.cocktail?.name || 'Cocktail' }} ({{ item.size?.name || 'Taille' }}) x {{ item.quantity }}
                </li>
              </ul>
              <div class="order-actions">
                <button
                  v-if="status.key !== 'annulée'"
                  @click="updateOrderStatus(order.orderId, getNextStatus(status.key))"
                  :disabled="!getNextStatus(status.key)"
                >
                  {{ getNextStatus(status.key) ? `Passer à ${orderStatuses.find(s => s.key === getNextStatus(status.key))?.name}` : 'Finalisé' }}
                </button>
                <button
                  v-if="status.key !== 'en attente' && status.key !== 'annulée'"
                  @click="updateOrderStatus(order.orderId, getPreviousStatus(status.key))"
                  :disabled="!getPreviousStatus(status.key)"
                >
                  Retour
                </button>
                <button
                  v-if="status.key !== 'annulée'"
                  class="cancel-btn"
                  @click="updateOrderStatus(order.orderId, 'annulée')"
                >
                  Annuler
                </button>
              </div>
            </div>
            <p v-if="filteredOrdersByStatus(status.key).length === 0" class="no-orders-message">
              Aucune commande.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

// Define types for Order and related objects based on your backend
interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
}

interface Cocktail {
    cocktailId: number;
    name: string;
    // ... other cocktail properties if needed
}

interface Size {
    sizeId: number;
    name: string;
    // ... other size properties if needed
}

interface OrderItem {
  orderItemId: number;
  cocktailId: number;
  sizeId: number;
  preparationStatus: string; // Should match backend enum/string
  quantity: number; // Assuming quantity is part of OrderItem
  cocktail?: Cocktail; // Optional, if backend returns nested cocktail object
  size?: Size; // Optional, if backend returns nested size object
}

interface Order {
  orderId: number;
  user: User; // Assuming full user object is returned now
  status: string;
  orderDate: string; // Or Date, depending on backend serialization
  orderItems: OrderItem[];
}

const props = defineProps<{
  isVisible: boolean;
}>();

const emit = defineEmits(['close']);

const orders = ref<Order[]>([]);

const orderStatuses = [
  { key: 'en attente', name: 'En Attente' },
  { key: 'en préparation', name: 'En Préparation' },
  { key: 'prête', name: 'Prête' },
  { key: 'récupérée', name: 'Récupérée' },
  { key: 'annulée', name: 'Annulée' },
];

const fetchOrders = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/orders'); // Endpoint to get all orders
    orders.value = response.data.map((order: any) => ({
        ...order,
        // Ensure nested objects are correctly mapped if backend sends IDs only
        // This part needs adjustment based on what your backend 'GET /api/orders' actually returns
        // If it returns full User/Cocktail/Size objects, you might not need these maps.
        // If it returns IDs, you might need to fetch details here or enhance backend response.
        user: order.user || { userId: order.userId, name: 'Utilisateur Inconnu' }, // Fallback if user is not fully nested
        orderItems: order.orderItems.map((item: any) => ({
            ...item,
            cocktail: item.cocktail || { cocktailId: item.cocktailId, name: 'Cocktail Inconnu' },
            size: item.size || { sizeId: item.sizeId, name: 'Taille Inconnue' }
        }))
    }));
    console.log('Orders fetched:', orders.value);
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

const updateOrderStatus = async (orderId: number, newStatus: string) => {
  try {
    // This assumes you have an endpoint like PUT /api/orders/{orderId}/status
    // or a more generic PUT /api/orders/{orderId} with a status field in the body
    await axios.put(`http://localhost:8080/api/orders/${orderId}/status`, { status: newStatus });
    console.log(`Order ${orderId} status updated to ${newStatus}`);
    await fetchOrders(); // Refresh orders after update
  } catch (error) {
    console.error(`Error updating order ${orderId} status to ${newStatus}:`, error);
    alert('Failed to update order status.');
  }
};

const closeModal = () => {
  emit('close');
};

const filteredOrdersByStatus = (statusKey: string) => {
  return orders.value.filter(order => order.status === statusKey);
};

const getNextStatus = (currentStatus: string) => {
  const currentIndex = orderStatuses.findIndex(s => s.key === currentStatus);
  if (currentIndex === -1 || currentIndex >= orderStatuses.length - 2) { // -2 because 'Récupérée' is final active, 'Annulée' is separate
    return null; // No next status for final active state or 'Annulée'
  }
  return orderStatuses[currentIndex + 1].key;
};

const getPreviousStatus = (currentStatus: string) => {
  const currentIndex = orderStatuses.findIndex(s => s.key === currentStatus);
  if (currentIndex <= 0 || currentStatus === 'annulée') { // No previous for first or cancelled
    return null;
  }
  return orderStatuses[currentIndex - 1].key;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};


// Fetch orders when the modal becomes visible
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    fetchOrders();
  }
});

onMounted(() => {
    // If modal might be visible on mount (e.g. refresh), fetch orders
    if (props.isVisible) {
        fetchOrders();
    }
});
</script>

<style scoped>
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
  z-index: 3000; /* Higher than other dropdowns */
}

.modal-content {
  background-color: #1a1a1a;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 1200px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  color: #fbfaf7;
}

.close-modal-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #ffc300;
  cursor: pointer;
}

h2 {
  text-align: center;
  color: #ffc300;
  margin-bottom: 25px;
}

.kanban-board {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.kanban-column {
  flex: 1;
  min-width: 280px;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.kanban-column h3 {
  text-align: center;
  color: #fbfaf7;
  margin-bottom: 15px;
  border-bottom: 2px solid #ffc300;
  padding-bottom: 10px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-card {
  background-color: #333;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  color: #ccc;
  font-size: 0.9rem;
}

.order-card p {
  margin: 5px 0;
}

.order-card h4 {
  color: #ffc300;
  margin-top: 10px;
  margin-bottom: 5px;
  font-size: 1rem;
}

.order-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.order-card li {
  margin-bottom: 3px;
  padding-left: 10px;
  position: relative;
}

.order-card li::before {
  content: "•";
  color: #f9ac37;
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

.order-actions {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.order-actions button {
  background-color: #ffc300;
  color: #111;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: bold;
}

.order-actions button:hover:not(:disabled) {
  background-color: #e6b200;
}

.order-actions button:disabled {
  background-color: #555;
  color: #888;
  cursor: not-allowed;
}

.order-actions .cancel-btn {
  background-color: #e74c3c;
  color: #fbfaf7;
}

.order-actions .cancel-btn:hover:not(:disabled) {
  background-color: #c0392b;
}

.no-orders-message {
  color: #888;
  text-align: center;
  padding: 20px 0;
}
</style>