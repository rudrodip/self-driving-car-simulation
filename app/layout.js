import '@styles/globals.css'

export const metadata = {
  title: 'Self-Driving Car Simulation',
  description: 'A simulation of self-driving cars using neural networks and genetic algorithm',
  author: 'Rudrodip Sarker',
  keywords: ['Self-Driving Car', 'Simulation', 'Neural Networks', 'Artificial Intelligence', 'JavaScript', 'Web Development'],
  image: '/screenshot.png',
  url: 'https://sdc-simulation.vercel.app',
  icons: {
    icon: '/logo.png',
  },
  images: [
    {
      url: '/screenshot.png',
      width: 800,
      height: 600,
      alt: 'Self-driving Car Simulation'
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} >
        <div className="main">
          <div className="gradient" />
        </div>
        <main className="app">
          {children}
        </main>
      </body>
    </html>
  )
}
