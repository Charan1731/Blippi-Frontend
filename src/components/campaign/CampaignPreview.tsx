// React import removed as it's not needed in modern React
import type { CampaignFormData } from '../../types/campaign';
import MDEditor from '@uiw/react-md-editor';

interface CampaignPreviewProps {
  data: CampaignFormData;
  imagePreview?: string;
}

export default function CampaignPreview({ data, imagePreview }: CampaignPreviewProps) {
  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Preview</h3>
      
      {(imagePreview || data.image) && (
        <div className="aspect-video mb-6 overflow-hidden rounded-xl">
          <img
            src={imagePreview || data.image}
            alt="Campaign preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://next-images.123rf.com/index/_next/image/?url=https://assets-cdn.123rf.com/index/static/assets/top-section-bg.jpeg&w=3840&q=75';
            }}
          />
        </div>
      )}
      
      {!imagePreview && !data.image && (
        <div className="aspect-video mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload an image to see preview</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
            {data.title || 'Blog Title'}
          </h4>
        </div>
        
        <div data-color-mode="light" className="prose prose-sm max-w-none">
          <div className="max-h-[150px] overflow-hidden relative">
            <MDEditor.Markdown 
              source={data.description || 'Blog description will appear here...'} 
              style={{ whiteSpace: 'pre-wrap' }}
              className='bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm dark:text-white p-4 rounded-lg'
            />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 dark:from-gray-800/90 to-transparent" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Target Amount</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.target ? `${data.target} ETH` : '0 ETH'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.deadline ? new Date(data.deadline).toLocaleDateString() : 'Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}