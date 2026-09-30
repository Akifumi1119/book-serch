<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchBookDetail, fetchBookByIsbn } from '@/api/books'
import type { BookDetail } from '@/types/book'
import type { Book } from '@/types/book'

const route = useRoute()
const router = useRouter()

const isbn = route.params.isbn as string

const detail = ref<BookDetail | null>(null)
const fallback = ref<Book | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

function formatPublishedDate(raw: string): string {
  if (raw.length === 8) {
    return `${raw.slice(0, 4)}年${raw.slice(4, 6)}月${raw.slice(6, 8)}日`
  }
  return raw
}

const publishedDateLabel = computed(() =>
  detail.value?.publishedDate ? formatPublishedDate(detail.value.publishedDate) : '不明',
)

onMounted(async () => {
  try {
    detail.value = await fetchBookDetail(isbn)
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      try {
        fallback.value = await fetchBookByIsbn(isbn)
      } catch {
        errorMessage.value = '書籍情報が見つかりませんでした'
      }
    } else {
      errorMessage.value =
        err instanceof Error ? err.message : '書籍詳細の取得中にエラーが発生しました'
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="page">
    <button class="back-btn" @click="router.back()">← 検索に戻る</button>

    <section v-if="isLoading" class="status-section">
      <div class="spinner" />
      <p>読み込み中...</p>
    </section>

    <section v-else-if="errorMessage" class="status-section error-section">
      <p class="error-text">{{ errorMessage }}</p>
    </section>

    <!-- openBD詳細情報あり -->
    <article v-else-if="detail" class="detail-card">
      <div class="info">
        <h1 class="title">{{ detail.title }}</h1>
        <p v-if="detail.series" class="series">{{ detail.series }}</p>
        <dl class="meta">
          <div class="meta-row">
            <dt>著者</dt>
            <dd>{{ detail.author || '不明' }}</dd>
          </div>
          <div class="meta-row">
            <dt>出版社</dt>
            <dd>{{ detail.publisher || '不明' }}</dd>
          </div>
          <div class="meta-row">
            <dt>出版日</dt>
            <dd>{{ publishedDateLabel }}</dd>
          </div>
          <div class="meta-row">
            <dt>ISBN</dt>
            <dd>{{ detail.isbn }}</dd>
          </div>
        </dl>
        <section v-if="detail.description" class="description-section">
          <h2 class="description-heading">内容紹介</h2>
          <p class="description">{{ detail.description }}</p>
        </section>
        <a
          v-if="detail.link"
          :href="detail.link"
          target="_blank"
          rel="noopener noreferrer"
          class="ndl-link"
        >
          NDL書誌ページで見る →
        </a>
      </div>
    </article>

    <!-- openBD未登録のフォールバック -->
    <article v-else-if="fallback" class="detail-card">
      <div class="info">
        <h1 class="title">{{ fallback.title }}</h1>
        <dl class="meta">
          <div class="meta-row">
            <dt>著者</dt>
            <dd>{{ fallback.author || '不明' }}</dd>
          </div>
          <div class="meta-row">
            <dt>出版社</dt>
            <dd>{{ fallback.publisher || '不明' }}</dd>
          </div>
          <div class="meta-row">
            <dt>出版年</dt>
            <dd>{{ fallback.publishedDate ? `${fallback.publishedDate}年` : '不明' }}</dd>
          </div>
          <div class="meta-row">
            <dt>ISBN</dt>
            <dd>{{ fallback.isbn }}</dd>
          </div>
        </dl>
        <p class="no-detail-note">※ 詳細情報（表紙・内容紹介）は未登録です</p>
        <a
          v-if="fallback.link"
          :href="fallback.link"
          target="_blank"
          rel="noopener noreferrer"
          class="ndl-link"
        >
          NDL書誌ページで見る →
        </a>
      </div>
    </article>
  </main>
</template>

<style scoped>
.page {
  max-width: 75%;
  margin: 0 auto;
  padding: 24px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-btn {
  align-self: flex-start;
  background: none;
  border: none;
  color: #3182ce;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.detail-card {
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  line-height: 1.4;
}

.series {
  font-size: 0.85rem;
  color: #718096;
  margin: 0;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
}

.meta-row {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
}

.meta-row dt {
  color: #718096;
  min-width: 60px;
  font-weight: 600;
  flex-shrink: 0;
}

.meta-row dd {
  color: #2d3748;
  margin: 0;
  word-break: break-all;
}

.description-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-heading {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
}

.description {
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.7;
  margin: 0;
}

.no-detail-note {
  font-size: 0.85rem;
  color: #a0aec0;
  margin: 0;
}

.ndl-link {
  display: inline-block;
  color: #3182ce;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
}

.ndl-link:hover {
  text-decoration: underline;
}

.status-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  color: #4a5568;
}

.error-section {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 10px;
}

.error-text {
  color: #c53030;
  margin: 0;
  font-size: 0.9rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #3182ce;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
