import React from 'react';
import {
  Briefcase,
  Building,
  CreditCard,
  FolderKanban,
  GraduationCap,
  Heart,
  Home,
  Palmtree,
  PiggyBank,
  ShoppingBag,
  Sparkles,
  Users,
  Utensils,
  Wallet,
} from 'lucide-react';

interface SpaceIconProps {
  name: string;
  className?: string;
}

export const SPACE_ICONS: { id: string; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'Wallet', label: 'Dompet Pribadi', icon: Wallet },
  { id: 'Home', label: 'Rumah Tangga', icon: Home },
  { id: 'Users', label: 'Grup / Bersama', icon: Users },
  { id: 'Briefcase', label: 'Bisnis & Usaha', icon: Briefcase },
  { id: 'Palmtree', label: 'Liburan & Trip', icon: Palmtree },
  { id: 'FolderKanban', label: 'Proyek Khusus', icon: FolderKanban },
  { id: 'PiggyBank', label: 'Tabungan Khusus', icon: PiggyBank },
  { id: 'ShoppingBag', label: 'Belanja & Retail', icon: ShoppingBag },
  { id: 'Building', label: 'Kantor / Operasional', icon: Building },
  { id: 'GraduationCap', label: 'Pendidikan', icon: GraduationCap },
];

export const SpaceIcon: React.FC<SpaceIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Home':
      return <Home className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Palmtree':
      return <Palmtree className={className} />;
    case 'FolderKanban':
      return <FolderKanban className={className} />;
    case 'PiggyBank':
      return <PiggyBank className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Building':
      return <Building className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'CreditCard':
      return <CreditCard className={className} />;
    case 'Wallet':
    default:
      return <Wallet className={className} />;
  }
};
