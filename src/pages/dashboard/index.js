import Layout from '../../components/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-fbNavy mb-8">Welcome back, Athlete</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Practicum 1 Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-fbOrange/10 text-fbOrange text-[10px] font-black px-2 py-1 rounded uppercase">Current</span>
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-bold text-fbNavy text-xl">Practicum 1</h3>
            <p className="text-sm text-gray-400 mb-6">Foundational Movements</p>
            <button className="w-full bg-fbGray text-fbNavy font-bold py-3 rounded-xl hover:bg-fbOrange hover:text-white transition-all">
              Open Log
            </button>
          </div>

          {/* Practicum 2 Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm opacity-60">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gray-100 text-gray-400 text-[10px] font-black px-2 py-1 rounded uppercase">Locked</span>
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-bold text-fbNavy text-xl">Practicum 2</h3>
            <p className="text-sm text-gray-400 mb-6">Advanced Conditioning</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
