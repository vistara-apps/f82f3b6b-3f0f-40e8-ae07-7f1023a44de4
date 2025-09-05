export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Loading Right Guard
        </h2>
        <p className="text-gray-300">
          Preparing your legal rights information...
        </p>
      </div>
    </div>
  );
}
