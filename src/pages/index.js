import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7f9] p-4 text-center">
      <h1 className="text-4xl font-bold text-[#051e34] mb-4">PATHFit Pro</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Welcome to your Fitness Tracker. Please complete your profile to begin your 
        Phase 1 Pre-Test and weekly training logs.
      </p>
      
      <Link href="/profile">
        <button className="btn-primary">
          Get Started: Set Up Profile
        </button>
      </Link>

      <div className="mt-12 text-xs text-gray-400">
        Optimized for PATHFit Curriculum &copy; 2026
      </div>
    </div>
  );
}
