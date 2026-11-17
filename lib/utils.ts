import { clsx, type ClassValue } from "clsx"
import type { Money } from "@/lib/storefront/types"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price)
}

export function formatMoney(money: Money): string {
  return formatPrice(Number(money.amount), money.currencyCode)
}

/** The compare-at price when it is above the price (the item is on sale), otherwise null. */
export function saleCompareAt(price: Money, compareAt: Money | null): Money | null {
  return compareAt && Number(compareAt.amount) > Number(price.amount) ? compareAt : null
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim()
}
