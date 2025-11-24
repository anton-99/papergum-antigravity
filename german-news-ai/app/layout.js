import './globals.css'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata = {
  title: 'Papergum',
  description: 'Your playful AI news companion',
  icons: {
    icon: '/icon.jpg',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body className={outfit.className}>{children}</body>
    </html>
  )
}
