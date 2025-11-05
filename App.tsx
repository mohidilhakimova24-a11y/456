
import React, { useState, useCallback } from 'react';
import { editImageWithGemini } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ImageDisplay from './components/ImageDisplay';

const App: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setOriginalFile(file);
    setEditedImage(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async () => {
    if (!originalFile || !prompt) {
      setError("Please upload an image and enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const result = await editImageWithGemini(originalFile, prompt);
      setEditedImage(result);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [originalFile, prompt]);
  
  const resetState = () => {
    setOriginalFile(null);
    setOriginalImagePreview(null);
    setPrompt('');
    setEditedImage(null);
    setError(null);
    setIsLoading(false);
  }

  const isGenerateDisabled = isLoading || !originalFile || !prompt;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            Gemini Image Editor
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Transform your images with the power of AI. Describe your edit and watch it come to life.
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          {/* Control Panel */}
          <div className="w-full lg:w-1/3 bg-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col space-y-6 border border-gray-700">
            <div>
              <label className="text-lg font-semibold text-gray-300 mb-2 block">1. Upload Image</label>
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
            <div>
              <label htmlFor="prompt-input" className="text-lg font-semibold text-gray-300 mb-2 block">2. Describe Your Edit</label>
              <textarea
                id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a retro cinematic filter' or 'Make the sky look like a galaxy'"
                className="w-full h-32 p-3 bg-gray-900 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none placeholder-gray-500"
                disabled={!originalFile}
              />
            </div>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className={`w-full py-3 px-6 text-lg font-bold rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
                  ${isGenerateDisabled
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg transform hover:scale-105'
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : "Generate"}
              </button>
              {originalFile && (
                <button
                  onClick={resetState}
                  className="w-full py-2 px-4 text-sm font-semibold rounded-lg bg-gray-700 hover:bg-red-700/50 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Start Over
                </button>
              )}
            </div>
          </div>

          {/* Image Display Panel */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImageDisplay title="Original" imageUrl={originalImagePreview} />
            <ImageDisplay title="Edited" imageUrl={editedImage} isLoading={isLoading} />
          </div>

        </main>

        {error && (
            <div className="mt-8 p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-center">
              <p><strong>Error:</strong> {error}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
