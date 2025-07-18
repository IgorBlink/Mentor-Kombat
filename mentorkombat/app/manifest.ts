import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "nFactorial Mentor Kombat",
    short_name: "Mentor Kombat",
    description: "Aziz & Igor",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ff6b00",
    icons: [
      {
        src: "/icons/nfacfavicon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/icons/nfacfavicon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  }
}
