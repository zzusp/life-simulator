import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          人生模拟器
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          体验不同的人生，做出关键选择
        </p>
        <Link 
          href="/game"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          开始游戏
        </Link>
      </div>
    </main>
  )
}