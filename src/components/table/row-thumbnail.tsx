'use client'

import { useState, useEffect } from 'react'

type Props = {
  websiteUrl: string | null
  thumbnailUrl: string | null
}

export function useRowThumbnail({ websiteUrl, thumbnailUrl }: Props) {
  const [src, setSrc] = useState(thumbnailUrl)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (src || failed || !websiteUrl) return

    fetch(`/api/og-image?url=${encodeURIComponent(websiteUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.og_image) setSrc(d.og_image)
        else setFailed(true)
      })
      .catch(() => setFailed(true))
  }, [src, failed, websiteUrl])

  if (!src || failed) return null
  return src
}

export function RowThumbnail({ websiteUrl, thumbnailUrl }: Props) {
  const src = useRowThumbnail({ websiteUrl, thumbnailUrl })

  if (!src) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.07]"
      />
    </div>
  )
}
