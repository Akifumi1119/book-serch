import type { Book } from '@/types/book'

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/books`

export async function fetchBookByIsbn(isbn: string): Promise<Book> {
  const response = await fetch(`${BASE_URL}/isbn/${isbn}`)
  if (!response.ok) {
    throw new Error(`書籍が見つかりませんでした (ISBN: ${isbn})`)
  }
  return response.json()
}
