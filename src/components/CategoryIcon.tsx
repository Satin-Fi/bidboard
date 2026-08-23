import React from 'react'
import type { LucideProps } from 'lucide-react'
import {
  Bot,
  Wrench,
  Zap,
  Megaphone,
  Palette,
  Briefcase,
  Rocket,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Sparkles,
  Coins,
  CreditCard,
  ShoppingCart,
  Globe,
  Trophy,
  Flame,
  Shield,
  Layers,
  ArrowUpRight,
  Search,
} from 'lucide-react'

interface CategoryIconProps {
  name: string
  className?: string
  size?: number
}

const ICON_MAP: Record<string, React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>> = {
  'ai-automation': Bot,
  'developer-tools': Wrench,
  'productivity': Zap,
  'marketing': Megaphone,
  'design-creative': Palette,
  'saas-business': Briefcase,
  'startups-launches': Rocket,
  'games-entertainment': Gamepad2,
  'education': GraduationCap,
  'health-fitness': HeartPulse,
  'social-creator': Sparkles,
  'crypto-web3': Coins,
  'finance-fintech': CreditCard,
  'ecommerce': ShoppingCart,
  'security-privacy': Shield,
  'other': Globe,
}

export function CategoryIcon({ name, className = 'w-4 h-4', size = 16 }: CategoryIconProps) {
  const IconComponent = ICON_MAP[name] || Globe
  return <IconComponent className={className} size={size} />
}

export {
  Trophy,
  Flame,
  Zap,
  Bot,
  Rocket,
  Wrench,
  Layers,
  ArrowUpRight,
  Search,
  Globe,
}
