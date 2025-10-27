import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl mx-auto w-full">
        {/* 主标题区 */}
        <div className="text-center mb-16">
          <div className="mb-6 text-7xl">🎮</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            人生模拟器
          </h1>
          <p className="text-xl text-gray-700 mb-4 max-w-2xl mx-auto">
            体验不同的人生，做出关键选择，看看你的选择会带你走向何方
          </p>
          <p className="text-sm text-gray-600">
            🤖 AI 驱动 · 📊 分数系统 · 🏆 成就解锁
          </p>
        </div>

        {/* CTA 按钮组 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link href="/game">
            <button className="px-10 py-5 bg-teal-400 hover:bg-teal-500 text-white text-xl font-black rounded-2xl border-[5px] border-teal-600 shadow-lg hover:shadow-xl active:translate-y-1 transition-all w-full sm:w-auto">
              🚀 开始游戏
            </button>
          </Link>
          
          <Link href="/history">
            <button className="px-10 py-5 bg-cyan-400 hover:bg-cyan-500 text-white text-xl font-black rounded-2xl border-[5px] border-cyan-600 shadow-lg hover:shadow-xl active:translate-y-1 transition-all w-full sm:w-auto">
              📜 查看历史
            </button>
          </Link>
        </div>

        {/* 特性卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border-[5px] border-gray-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">多种人生类型</h3>
            <p className="text-gray-700 font-semibold">创业、修真、穿越等多种人生体验</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border-[5px] border-gray-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">AI 智能生成</h3>
            <p className="text-gray-700 font-semibold">每次游戏都是独特的体验</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 border-[5px] border-gray-900 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-black text-gray-900 mb-2">分数与成就</h3>
            <p className="text-gray-700 font-semibold">追踪你的选择，解锁成就</p>
          </div>
        </div>
      </div>
    </main>
  )
}