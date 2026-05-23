import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadBuffer(
  buffer: Buffer,
  options: { folder: string; public_id: string; overwrite?: boolean },
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...options, overwrite: options.overwrite ?? true },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload falhou"))
        resolve(result.secure_url)
      },
    )
    stream.end(buffer)
  })
}

export function categoryImageUrl(slug: string): string {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloud) return `/categories/${slug}.png`
  return `https://res.cloudinary.com/${cloud}/image/upload/mob-burger/categories/${slug}`
}
