import { useNavigate } from 'react-router';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EEFD] via-white to-[#E3DBF9] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] bg-clip-text text-transparent">
            404
          </div>
          <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-[#7A42E8] opacity-20" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-[#1F2430] mb-3">Page Not Found</h1>
        <p className="text-[#7A7F8C] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8F6EE6] to-[#7A42E8] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border-2 border-[#DDDCE7] text-[#4F5868] font-semibold hover:bg-[#F8F9FB] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
