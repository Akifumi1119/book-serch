import type { Book } from '@/types/book'

const BASE_URL = 'http://localhost:8080/api/books'

export async function fetchBookByIsbn(isbn: string): Promise<Book> {
  const response = await fetch(`${BASE_URL}/isbn/${isbn}`)
  if (!response.ok) {
    throw new Error(`書籍が見つかりませんでした (ISBN: ${isbn})`)
  }
  return response.json()
}
