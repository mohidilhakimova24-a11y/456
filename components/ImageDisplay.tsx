
import React from 'react';

const Spinner: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 backdrop-blur-sm rounded-2xl">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
  </div>
);

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, isLoading = false }) => {
  return (
    <div className="flex flex-col space-y-3">
      <h2 className="text-xl font-semibold text-center text-gray-300">{title}</h2>
      <div className="relative w-full aspect-square bg-gray-800 rounded-2xl border border-gray-700 flex items-center justify-center overflow-hidden shadow-lg">
        {isLoading && <Spinner />}
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
          !isLoading && (
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M20 28v.01M20 20v.01M28 20v.01M40 28v.01M20 12v.01M28 12v.01M40 20v.01M40 12v.01M12 28v.01M12 20v.01M12 12v.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className="mt-2 block text-sm font-medium">{title === 'Original' ? 'Upload an image to start' : 'Your result will appear here'}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
