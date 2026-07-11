import type { Metadata } from 'next'
import { Inter, Fredoka } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fredoka',
})

export const metadata: Metadata = {
  title: 'TwentyFour - Math Puzzle Game',
  description: 'Make 24 using four numbers and basic arithmetic operations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${fredoka.variable}`}>{children}</body>
    </html>
  )
}
