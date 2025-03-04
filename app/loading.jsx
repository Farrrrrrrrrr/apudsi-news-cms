export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#191970] mx-auto"></div>
        <p className="mt-4 text-xl font-medium text-[#191970]">Loading...</p>
      </div>
    </div>
  );
}
