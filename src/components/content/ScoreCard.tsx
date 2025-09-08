import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface ScoreCardProps {
  overallScore: number;
  breakdown?: {
    [key: string]: number;
  };
}

export default function ScoreCard({ overallScore, breakdown }: ScoreCardProps) {
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 !== 0;
    const emptyStars = 5 - Math.ceil(score);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="w-5 h-5 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <StarOutlineIcon className="w-5 h-5 text-yellow-400" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarOutlineIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-900">
          {score.toFixed(1)}/5
        </span>
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-100';
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 my-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Rating</h3>
      
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getScoreColor(overallScore)}`}>
          {overallScore.toFixed(1)}
        </div>
        <div className="mt-2">
          {renderStars(overallScore)}
        </div>
        <p className="text-sm text-gray-800 mt-1">Overall Score</p>
      </div>

      {breakdown && (
        <div className="space-y-3">
          {Object.entries(breakdown).map(([category, score]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 capitalize">
                {category}
              </span>
              <div className="flex items-center">
                {renderStars(score)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}