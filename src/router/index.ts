import { createRouter, createWebHistory } from 'vue-router'
import BookSearchView from '@/views/BookSearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'book-search',
      component: BookSearchView,
    },
  ],
})

export default router
