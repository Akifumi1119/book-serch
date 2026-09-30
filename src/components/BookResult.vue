<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Book } from '@/types/book'

const props = defineProps<{ book: Book }>()
const router = useRouter()

const details = computed(() => [
  { label: '著者',   value: props.book.author || '不明' },
  { label: '出版社', value: props.book.publisher || '不明' },
  { label: '出版年', value: props.book.publishedDate ? `${props.book.publishedDate}年` : '不明' },
  { label: 'ISBN',   value: props.book.isbn },
])

function goToDetail() {
  router.push({ name: 'book-detail', params: { isbn: props.book.isbn } })
}
</script>

<template>
  <div class="book-card" role="button" tabindex="0" @click="goToDetail" @keydown.enter="goToDetail">
    <img v-if="book.thumbnailUrl" :src="book.thumbnailUrl" :alt="book.title" class="thumbnail" />
    <div class="info">
      <h2 class="title">{{ book.title }}</h2>
      <dl class="details">
        <div v-for="detail in details" :key="detail.label" class="detail-row">
          <dt>{{ detail.label }}</dt>
          <dd>{{ detail.value }}</dd>
        </div>
      </dl>
      <span class="link">詳細を見る →</span>
    </div>
  </div>
</template>

<style scoped>
.book-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.book-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #bee3f8;
}

.thumbnail {
  width: 100px;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
}

.detail-row {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
}

.detail-row dt {
  color: #718096;
  min-width: 60px;
  font-weight: 600;
}

.detail-row dd {
  color: #2d3748;
  margin: 0;
}

.link {
  display: inline-block;
  color: #3182ce;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .book-card {
    flex-direction: column;
  }

  .thumbnail {
    width: 80px;
  }
}
</style>
