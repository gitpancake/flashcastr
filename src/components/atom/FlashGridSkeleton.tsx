export const FlashGridSkeleton = ({ tiles = 8 }: { tiles?: number }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {Array.from({ length: tiles }).map((_, index) => (
          <div key={index} className="bg-gray-900 border border-gray-700 animate-pulse">
            <div className="aspect-square bg-gray-800" />
            <div className="p-2 sm:p-3 space-y-2">
              <div className="h-2 w-1/3 bg-gray-800" />
              <div className="h-2 w-2/3 bg-gray-800" />
              <div className="h-2 w-1/2 bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
