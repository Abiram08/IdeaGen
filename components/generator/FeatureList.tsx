'use client';

import { Feature } from '@/types/idea';
import { Check, X } from 'lucide-react';

interface FeatureListProps {
  features: Feature[];
  editable?: boolean;
  onToggle?: (index: number) => void;
}

export function FeatureList({ features, editable = false, onToggle }: FeatureListProps) {
  return (
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li
          key={index}
          className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${
            editable ? 'hover:bg-white/5 cursor-pointer' : ''
          } ${!feature.included ? 'opacity-50' : ''}`}
          onClick={() => editable && onToggle?.(index)}
        >
          <span
            className={`flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center ${
              feature.included
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {feature.included ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
          </span>
          <span className={`text-sm text-gray-300 ${!feature.included ? 'line-through text-gray-500' : ''}`}>
            {feature.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

interface FeatureListReadOnlyProps {
  features: Feature[];
}

export function FeatureListReadOnly({ features }: FeatureListReadOnlyProps) {
  const included = features.filter((f) => f.included);
  const excluded = features.filter((f) => !f.included);

  return (
    <div className="space-y-4">
      {included.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            Included Features
          </h4>
          <ul className="space-y-1">
            {included.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                <Check className="w-4 h-4 text-green-400" />
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {excluded.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">
            Excluded Features
          </h4>
          <ul className="space-y-1">
            {excluded.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-500">
                <X className="w-4 h-4 text-red-400" />
                <span className="line-through">{feature.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
