// Tech stack badge component

interface TechBadgeProps {
  tech: string;
  variant?: 'default' | 'primary' | 'secondary';
}

export function TechBadge({ tech, variant = 'default' }: TechBadgeProps) {
  const variants = {
    default: 'bg-white/5 text-gray-300 border border-white/10',
    primary: 'bg-green-500/10 text-green-300 border border-green-500/20',
    secondary: 'bg-green-600/10 text-green-400 border border-green-600/20',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}
    >
      {tech}
    </span>
  );
}

interface TechBadgeListProps {
  techs: string[];
  variant?: 'default' | 'primary' | 'secondary';
  maxDisplay?: number;
}

export function TechBadgeList({ techs, variant = 'default', maxDisplay = 5 }: TechBadgeListProps) {
  const displayTechs = techs.slice(0, maxDisplay);
  const remaining = techs.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2">
      {displayTechs.map((tech, index) => (
        <TechBadge key={index} tech={tech} variant={variant} />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-white/5 text-gray-500 border border-white/10">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
