import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProsConsProps {
  pros: string[];
  cons: string[];
}

export default function ProsCons({ pros, cons }: ProsConsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 my-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <CheckIcon className="w-5 h-5 mr-2" />
          Pros
        </h3>
        <ul className="space-y-2">
          {pros.map((pro, index) => (
            <li key={index} className="flex items-start text-green-700">
              <CheckIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
              <span className="text-sm">{pro}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
          <XMarkIcon className="w-5 h-5 mr-2" />
          Cons
        </h3>
        <ul className="space-y-2">
          {cons.map((con, index) => (
            <li key={index} className="flex items-start text-red-700">
              <XMarkIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-600" />
              <span className="text-sm">{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
