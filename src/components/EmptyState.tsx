export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">No recordings yet</h2>
      <p className="text-base text-gray-500 max-w-xs leading-relaxed">
        Tap the <span className="font-semibold text-red-600">Record</span> button below to start your first recording. Your meetings will be transcribed in your language!
      </p>
    </div>
  );
}
