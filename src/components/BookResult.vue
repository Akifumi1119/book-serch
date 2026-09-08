<script setup lang="ts">
import type { Book } from '@/types/book'

defineProps<{ book: Book }>()
</script>

<template>
  <div class="book-card">
    <img v-if="book.thumbnailUrl" :src="book.thumbnailUrl" :alt="book.title" class="thumbnail" />
    <div class="info">
      <h2 class="title">{{ book.title }}</h2>
      <dl class="details">
        <div class="detail-row">
          <dt>著者</dt>
          <dd>{{ book.author || '不明' }}</dd>
        </div>
        <div class="detail-row">
          <dt>出版社</dt>
          <dd>{{ book.publisher || '不明' }}</dd>
        </div>
        <div class="detail-row">
          <dt>出版年</dt>
          <dd>{{ book.publishedDate || '不明' }}</dd>
        </div>
        <div class="detail-row">
          <dt>ISBN</dt>
          <dd>{{ book.isbn }}</dd>
        </div>
      </dl>
      <a v-if="book.link" :href="book.link" target="_blank" rel="noopener noreferrer" class="link">
        詳細を見る →
      </a>
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
