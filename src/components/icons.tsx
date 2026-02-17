import { Briefcase, Cpu, Landmark, type LucideProps } from 'lucide-react';
import type { ReactElement } from 'react';

export const categoryIcons: Record<
  string,
  ReactElement<LucideProps>
> = {
  Business: <Briefcase className="h-4 w-4" />,
  Tech: <Cpu className="h-4 w-4" />,
  Policy: <Landmark className="h-4 w-4" />,
};
