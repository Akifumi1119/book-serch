<script setup lang="ts">
import { ref, computed } from 'vue'
import BarcodeScanner from '@/components/BarcodeScanner.vue'
import BookResult from '@/components/BookResult.vue'
import { fetchBookByIsbn, searchBooks } from '@/api/books'
import { useIsMobile } from '@/composables/useIsMobile'
import type { Book } from '@/types/book'
import type { BookSearchResponse } from '@/api/books'

// UA判定でモバイルかどうかを取得し、バーコードスキャナーの表示切り替えに使用
const isMobile = useIsMobile()

// 検索モード
// 'isbn': ISBNコード入力 / 'freeword': キーワード等による全文検索
const searchMode = ref<'isbn' | 'freeword'>('isbn')

// ISBN検索
const isbnInput = ref('')
const isbnBook = ref<Book | null>(null)

// フリーワード検索
// searchType: APIに渡す検索対象フィールド名（クエリパラメータのキーと一致させる）
const searchType = ref<'keyword' | 'title' | 'creator' | 'publisher'>('keyword')
const searchInput = ref('')
const searchResult = ref<BookSearchResponse | null>(null)
// 1ページあたりの取得件数（バックエンドのデフォルトと合わせる）
const PAGE_SIZE = 20

// 共通
const isLoading = ref(false)
const errorMessage = ref('')

// フリーワード検索の種別選択肢（<select> に渡す）
const searchTypeOptions = [
  { value: 'keyword', label: 'キーワード' },
  { value: 'title', label: 'タイトル' },
  { value: 'creator', label: '著者名' },
  { value: 'publisher', label: '出版社' },
] as const

// 選択中の検索種別に合わせてプレースホルダーを切り替える
const searchTypePlaceholder = computed(() => {
  switch (searchType.value) {
    case 'title': return '例: Java入門'
    case 'creator': return '例: 山田太郎'
    case 'publisher': return '例: 技術評論社'
    default: return '例: 機械学習'
  }
})

// totalResults と PAGE_SIZE からページ総数を算出
const totalPages = computed(() =>
  searchResult.value ? Math.ceil(searchResult.value.totalResults / PAGE_SIZE) : 0
)

// APIレスポンスの page は 0-indexed
const currentPage = computed(() => searchResult.value?.page ?? 0)

const hasPrev = computed(() => currentPage.value > 0)
const hasNext = computed(() => currentPage.value < totalPages.value - 1)

// タブ切り替え時に前の検索結果・エラーをリセット
function switchMode(mode: 'isbn' | 'freeword') {
  searchMode.value = mode
  isbnBook.value = null
  searchResult.value = null
  errorMessage.value = ''
}

async function searchByIsbn(isbn: string) {
  // ハイフン付きISBN（例: 978-4-297-13514-0）を正規化してからAPIへ送信
  const normalized = isbn.replace(/-/g, '').trim()
  if (!normalized) return

  isLoading.value = true
  isbnBook.value = null
  errorMessage.value = ''

  try {
    isbnBook.value = await fetchBookByIsbn(normalized)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '検索中にエラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

// BarcodeScanner からスキャン成功時に呼ばれる。入力欄にも反映してUIを同期
function onScanned(isbn: string) {
  isbnInput.value = isbn
  searchByIsbn(isbn)
}

function onScanError(message: string) {
  errorMessage.value = message
}

function onIsbnSubmit() {
  searchByIsbn(isbnInput.value)
}

// ページ番号を引数で受け取ることでページネーション・初回検索を共通化
async function runFreewordSearch(page: number) {
  const value = searchInput.value.trim()
  if (!value) return

  isLoading.value = true
  searchResult.value = null
  errorMessage.value = ''

  try {
    // searchType の値をそのままクエリパラメータのキーに使う（例: { title: "..." }）
    const result = await searchBooks({ [searchType.value]: value, page, size: PAGE_SIZE })
    if (result.totalResults === 0) {
      errorMessage.value = '該当する書籍が見つかりませんでした'
    } else {
      searchResult.value = result
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '検索中にエラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

// フォーム送信時は常に先頭ページ（page=0）から取得
function onFreewordSubmit() {
  runFreewordSearch(0)
}

function goToPrev() {
  if (hasPrev.value) runFreewordSearch(currentPage.value - 1)
}

function goToNext() {
  if (hasNext.value) runFreewordSearch(currentPage.value + 1)
}
</script>

<template>
  <main class="page">
    <header class="page-header">
      <h1 class="page-title">書籍検索</h1>
      <p class="page-subtitle">ISBNコードやキーワードで書籍情報を検索します</p>
    </header>

    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: searchMode === 'isbn' }"
        @click="switchMode('isbn')"
      >
        ISBNで検索
      </button>
      <button
        class="tab-btn"
        :class="{ active: searchMode === 'freeword' }"
        @click="switchMode('freeword')"
      >
        フリーワードで検索
      </button>
    </div>

    <!-- ISBN検索 -->
    <template v-if="searchMode === 'isbn'">
      <section v-if="isMobile" class="card">
        <h2 class="section-title">バーコードスキャン</h2>
        <BarcodeScanner @scanned="onScanned" @error="onScanError" />
      </section>

      <section class="card">
        <h2 class="section-title">ISBN手動入力</h2>
        <form class="search-form" @submit.prevent="onIsbnSubmit">
          <input
            v-model="isbnInput"
            type="text"
            class="text-input"
            placeholder="例: 9784297135140"
            inputmode="numeric"
            maxlength="17"
          />
          <button type="submit" class="btn btn-primary" :disabled="isLoading || !isbnInput.trim()">
            検索
          </button>
        </form>
      </section>
    </template>

    <!-- フリーワード検索 -->
    <template v-else>
      <section class="card">
        <h2 class="section-title">フリーワード検索</h2>
        <form class="search-form freeword-form" @submit.prevent="onFreewordSubmit">
          <select v-model="searchType" class="type-select">
            <option v-for="opt in searchTypeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <input
            v-model="searchInput"
            type="text"
            class="text-input"
            :placeholder="searchTypePlaceholder"
          />
          <button type="submit" class="btn btn-primary" :disabled="isLoading || !searchInput.trim()">
            検索
          </button>
        </form>
      </section>
    </template>

    <!-- ローディング -->
    <section v-if="isLoading" class="status-section">
      <div class="spinner" />
      <p>検索中...</p>
    </section>

    <!-- エラー -->
    <section v-else-if="errorMessage" class="status-section error-section">
      <p class="error-text">{{ errorMessage }}</p>
    </section>

    <!-- ISBN検索結果（1件） -->
    <section v-else-if="isbnBook" class="result-section">
      <h2 class="section-title">検索結果</h2>
      <BookResult :book="isbnBook" />
    </section>

    <!-- フリーワード検索結果（複数件） -->
    <section v-else-if="searchResult" class="result-section">
      <h2 class="section-title">
        検索結果
        <span class="result-count">全{{ searchResult.totalResults }}件</span>
      </h2>

      <BookResult v-for="(b, i) in searchResult.items" :key="i" :book="b" />

      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-ghost" :disabled="!hasPrev" @click="goToPrev">
          &#8592; 前へ
        </button>
        <span class="page-indicator">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button class="btn btn-ghost" :disabled="!hasNext" @click="goToNext">
          次へ &#8594;
        </button>
      </div>
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

.tab-bar {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: #f7fafc;
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.tab-btn + .tab-btn {
  border-left: 1px solid #e2e8f0;
}

.tab-btn.active {
  background: #3182ce;
  color: #fff;
}

.tab-btn:not(.active):hover {
  background: #edf2f7;
  color: #4a5568;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-count {
  font-size: 0.85rem;
  font-weight: 400;
  color: #718096;
}

.search-form {
  display: flex;
  gap: 10px;
}

.freeword-form {
  flex-wrap: wrap;
}

.type-select {
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  color: #2d3748;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  white-space: nowrap;
}

.type-select:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
}

.text-input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
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

.btn-ghost {
  background: #fff;
  color: #3182ce;
  border: 1px solid #bee3f8;
  font-size: 0.9rem;
  padding: 8px 16px;
}

.btn-ghost:hover:not(:disabled) {
  background: #ebf8ff;
}

.btn-ghost:disabled {
  color: #a0aec0;
  border-color: #e2e8f0;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 8px;
}

.page-indicator {
  font-size: 0.9rem;
  color: #4a5568;
  min-width: 60px;
  text-align: center;
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
