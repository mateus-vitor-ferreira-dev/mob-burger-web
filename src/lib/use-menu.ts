import { useEffect, useState } from "react"

export interface MenuOptionItem {
  id: string
  name: string
  additionalPrice: number
}
export interface MenuOption {
  id: string
  label: string
  type: "RADIO" | "CHECKBOX"
  required: boolean
  items: MenuOptionItem[]
}
export interface ComboConfig {
  numBurgers: number
  numDrinks: number
  drinkCostPrice: number
  allowedSlugs: string[]
}

export interface MenuProduct {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  inStock: boolean
  options: MenuOption[]
  comboConfig?: ComboConfig | null
}
export interface MenuCategory {
  id: string
  name: string
  slug: string
  position: number
  products: MenuProduct[]
}

const TTL = 5 * 60 * 1000 // 5 min

let _cache: MenuCategory[] | null = null
let _cacheTime = 0
const _listeners = new Set<(data: MenuCategory[]) => void>()
let _fetching = false

async function fetchMenu() {
  if (_fetching) return
  _fetching = true
  try {
    const res = await fetch("/api/backend/menu")
    if (!res.ok) return
    const json = await res.json()
    _cache = json.data ?? []
    _cacheTime = Date.now()
    _listeners.forEach((fn) => fn(_cache!))
  } catch {
    // silently fail — consumers keep stale data
  } finally {
    _fetching = false
  }
}

export function useMenu() {
  const [categories, setCategories] = useState<MenuCategory[]>(_cache ?? [])
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    _listeners.add(setCategories)

    const now = Date.now()
    if (!_cache || now - _cacheTime > TTL) {
      fetchMenu().finally(() => setLoading(false))
    } else {
      setCategories(_cache) // eslint-disable-line react-hooks/set-state-in-effect
      setLoading(false)
    }

    return () => {
      _listeners.delete(setCategories)
    }
  }, [])

  function invalidate() {
    _cache = null
    _cacheTime = 0
    fetchMenu()
  }

  return { categories, loading, invalidate }
}
