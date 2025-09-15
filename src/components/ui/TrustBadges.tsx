import {
  ShieldCheckIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  BeakerIcon,
  ClockIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical' | 'compact';
  showAll?: boolean;
}

export default function TrustBadges({
  variant = 'horizontal',
  showAll = true,
}: TrustBadgesProps) {
  const badges = [
    {
      icon: ShieldCheckIcon,
      title: 'Editorial Independence',
      description: 'No manufacturer influence on reviews',
      color: 'green',
    },
    {
      icon: BeakerIcon,
      title: 'Professional Testing',
      description: 'Lab-grade equipment & methodology',
      color: 'blue',
    },
    {
      icon: AcademicCapIcon,
      title: 'Expert Reviews',
      description: 'Industry professionals & engineers',
      color: 'purple',
    },
    {
      icon: CheckBadgeIcon,
      title: 'Verified Results',
      description: 'Peer-reviewed & fact-checked',
      color: 'indigo',
    },
    {
      icon: ClockIcon,
      title: 'Extended Testing',
      description: '2-4 weeks of real-world usage',
      color: 'orange',
    },
    {
      icon: StarIcon,
      title: 'Reader Trusted',
      description: 'Transparent scoring & recommendations',
      color: 'yellow',
    },
  ];

  const displayBadges = showAll ? badges : badges.slice(0, 4);

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-50 border-green-200 text-green-700',
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {displayBadges.slice(0, 3).map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <div
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getColorClasses(badge.color)}`}
            >
              <IconComponent className="w-3 h-3 mr-1" />
              {badge.title}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className="space-y-3">
        {displayBadges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getColorClasses(badge.color)}`}
            >
              <div className="flex items-start space-x-3">
                <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{badge.title}</div>
                  <div className="text-xs opacity-80">{badge.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {displayBadges.map((badge, index) => {
        const IconComponent = badge.icon;
        return (
          <div
            key={index}
            className={`p-3 rounded-lg border text-center ${getColorClasses(badge.color)}`}
          >
            <IconComponent className="w-6 h-6 mx-auto mb-2" />
            <div className="font-semibold text-xs">{badge.title}</div>
            <div className="text-xs opacity-80 mt-1">{badge.description}</div>
          </div>
        );
      })}
    </div>
  );
}
