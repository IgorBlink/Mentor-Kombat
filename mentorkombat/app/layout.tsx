import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SoundProvider } from "@/components/sound-context"
import { MuteButton } from "@/components/mute-button"

export const metadata: Metadata = {
  title: "Friedrichshain Connection",
  description: "A 90s-style fighting game",
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black h-screen overflow-hidden">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <SoundProvider>
            <MuteButton />
            <main className="h-screen overflow-hidden">{children}</main>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
