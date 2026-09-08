<script setup lang="ts">
import { ref } from 'vue'
import BarcodeScanner from '@/components/BarcodeScanner.vue'
import BookResult from '@/components/BookResult.vue'
import { fetchBookByIsbn } from '@/api/books'
import { useIsMobile } from '@/composables/useIsMobile'
import type { Book } from '@/types/book'

const isMobile = useIsMobile()

const isbnInput = ref('')
const book = ref<Book | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

async function searchByIsbn(isbn: string) {
  const normalized = isbn.replace(/-/g, '').trim()
  if (!normalized) return

  isLoading.value = true
  book.value = null
  errorMessage.value = ''

  try {
    book.value = await fetchBookByIsbn(normalized)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '検索中にエラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

function onScanned(isbn: string) {
  isbnInput.value = isbn
  searchByIsbn(isbn)
}

function onScanError(message: string) {
  errorMessage.value = message
}

function onFormSubmit() {
  searchByIsbn(isbnInput.value)
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <h1 class="page-title">書籍検索</h1>
      <p class="page-subtitle">
        <span v-if="isMobile">ISBNバーコードをスキャン、または</span>
        <span v-else>ISBNコードを</span>
        手動で入力して書籍情報を取得します
      </p>
    </header>

    <section v-if="isMobile" class="card">
      <h2 class="section-title">バーコードスキャン</h2>
      <BarcodeScanner @scanned="onScanned" @error="onScanError" />
    </section>

    <section class="card">
      <h2 class="section-title">ISBN手動入力</h2>
      <form class="search-form" @submit.prevent="onFormSubmit">
        <input
          v-model="isbnInput"
          type="text"
          class="isbn-input"
          placeholder="例: 9784297135140"
          inputmode="numeric"
          maxlength="17"
        />
        <button type="submit" class="btn btn-primary" :disabled="isLoading || !isbnInput.trim()">
          検索
        </button>
      </form>
    </section>

    <section v-if="isLoading" class="status-section">
      <div class="spinner" />
      <p>検索中...</p>
    </section>

    <section v-else-if="errorMessage" class="status-section error-section">
      <p class="error-text">{{ errorMessage }}</p>
    </section>

    <section v-else-if="book" class="result-section">
      <h2 class="section-title">検索結果</h2>
      <BookResult :book="book" />
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  text-align: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.search-form {
  display: flex;
  gap: 10px;
}

.isbn-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.isbn-input:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background-color: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2b6cb0;
}

.btn-primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
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

.result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
