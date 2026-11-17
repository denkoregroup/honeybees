export interface CartItem {
  variantId: string
  productId: string
  title: string
  variantTitle: string
  price: number
  quantity: number
  image?: string
}

export interface ContactFormData {
  name: string
  email: string
  message: string
  customRequest?: string
}
