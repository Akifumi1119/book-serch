import { createRouter, createWebHistory } from 'vue-router'
import BookSearchView from '@/views/BookSearchView.vue'
import BookDetailView from '@/views/BookDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'book-search',
      component: BookSearchView,
    },
    {
      path: '/books/:isbn',
      name: 'book-detail',
      component: BookDetailView,
    },
  ],
})

export default router
