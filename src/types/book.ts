export interface Book {
  title: string
  author: string
  publisher: string
  publishedDate: string
  isbn: string
  thumbnailUrl: string | null
  link: string | null
}

export interface BookDetail {
  isbn: string
  title: string
  author: string
  publisher: string
  publishedDate: string
  series: string
  cover: string
  description: string
  link: string
}
