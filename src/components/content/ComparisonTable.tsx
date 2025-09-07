import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ComparisonRow {
  category: string;
  productA: string;
  productB: string;
  winner: string;
  explanation?: string;
}

interface ComparisonTableProps {
  productAName: string;
  productBName: string;
  comparisons: ComparisonRow[];
}

export default function ComparisonTable({ productAName, productBName, comparisons }: ComparisonTableProps) {
  const getWinnerIcon = (winner: string, currentProduct: 'productA' | 'productB') => {
    if (winner === 'tie') {
      return <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
        <span className="text-yellow-600 text-xs font-bold">=</span>
      </div>;
    }
    
    if (winner === currentProduct) {
      return <CheckIcon className="w-6 h-6 text-green-500" />;
    }
    
    return null;
  };

  return (
    <div className="overflow-x-auto my-8">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900 border-r border-gray-200">
              Category
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900 border-r border-gray-200">
              {productAName}
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900">
              {productBName}
            </th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((comparison, index) => (
            <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-4 font-medium text-gray-900 border-r border-gray-200">
                {comparison.category}
              </td>
              <td className="px-4 py-4 border-r border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{comparison.productA}</span>
                  {getWinnerIcon(comparison.winner, 'productA')}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{comparison.productB}</span>
                  {getWinnerIcon(comparison.winner, 'productB')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4 text-sm text-gray-800">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <CheckIcon className="w-4 h-4 text-green-500 mr-1" />
            <span>Winner</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center mr-1">
              <span className="text-yellow-600 text-xs font-bold">=</span>
            </div>
            <span>Tie</span>
          </div>
        </div>
      </div>
    </div>
  );
}