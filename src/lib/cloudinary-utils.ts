export function categoryImageUrl(slug: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloud) return `/categories/${slug}.png`
  return `https://res.cloudinary.com/${cloud}/image/upload/mob-burger/categories/${slug}`
}
