import { CoreFeature } from '@/types/idea';

const priorityColors: Record<string, string> = {
  must: 'bg-red-500/20 text-red-400 border-red-500/30',
  should: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  nice: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

export function FeatureList({ features }: { features: CoreFeature[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Feature</th>
            <th className="text-left py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Description</th>
            <th className="text-center py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Priority</th>
            <th className="text-right py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">Hours</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-2.5 text-white font-medium">{f.name}</td>
              <td className="py-2.5 text-zinc-400 hidden md:table-cell">{f.description}</td>
              <td className="py-2.5 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[f.priority]}`}>
                  {f.priority}
                </span>
              </td>
              <td className="py-2.5 text-right text-zinc-300">{f.est_hours}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
