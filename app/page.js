import CarCanvas from "@components/Car/CarCanvas"
import Header from "@components/Header/header"

export default function Home() {

  return (
    <main className="w-full">
      <Header />
      <div className="">
        <CarCanvas width={400} height={800} />
      </div>
    </main>
  )
}