import type { Book } from '@/types/book'

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/books`

export async function fetchBookByIsbn(isbn: string): Promise<Book> {
  const response = await fetch(`${BASE_URL}/isbn/${isbn}`)
  if (!response.ok) {
    throw new Error(`書籍が見つかりませんでした (ISBN: ${isbn})`)
  }
  return response.json()
}

export interface BookSearchParams {
  title?: string
  creator?: string
  publisher?: string
  keyword?: string
  page?: number
  size?: number
}

export interface BookSearchResponse {
  items: Book[]
  totalResults: number
  page: number
  size: number
}

export async function searchBooks(params: BookSearchParams): Promise<BookSearchResponse> {
  const query = new URLSearchParams()
  if (params.title) query.set('title', params.title)
  if (params.creator) query.set('creator', params.creator)
  if (params.publisher) query.set('publisher', params.publisher)
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.size !== undefined) query.set('size', String(params.size))

  const response = await fetch(`${BASE_URL}/search?${query}`)
  if (response.status === 400) {
    throw new Error('検索条件を1つ以上入力してください')
  }
  if (!response.ok) {
    throw new Error('検索中にエラーが発生しました')
  }
  return response.json()
}
