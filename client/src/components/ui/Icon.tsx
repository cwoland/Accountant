import {
  ArrowLeftRight, Baby, Banknote, Beer, BookOpen, Briefcase, Bus, Car, Circle,
  Coffee, Coins, CreditCard, Crown, Dog, Dumbbell, Film, Flower2, Fuel, Gamepad2,
  Gem, Gift, GraduationCap, Hammer, Handshake, Heart, House, Landmark, Laptop,
  Lightbulb, Monitor, Music, Package, PawPrint, PiggyBank, Pill, Plane, Receipt,
  Rocket, Scale, Scissors, Shield, Shirt, ShoppingCart, Star, Stethoscope,
  Target, Train, TrendingUp, Trophy, Tv, Undo2, User, Users, Utensils, Wallet,
  Wifi, Wrench,
  type LucideIcon,
} from 'lucide-react';
import { toIconName, type IconName } from '@accountant/shared';

/**
 * Имя из реестра → компонент Lucide. Единственное место в приложении,
 * где делается это сопоставление: если иконка появилась в ICON_NAMES,
 * но не здесь — TypeScript не пропустит (Record требует все ключи).
 */
const ICON_COMPONENTS: Record<IconName, LucideIcon> = {
  'house': House,
  'lightbulb': Lightbulb,
  'wifi': Wifi,
  'landmark': Landmark,
  'shield': Shield,
  'scale': Scale,
  'shopping-cart': ShoppingCart,
  'utensils': Utensils,
  'coffee': Coffee,
  'shirt': Shirt,
  'monitor': Monitor,
  'pill': Pill,
  'stethoscope': Stethoscope,
  'scissors': Scissors,
  'paw-print': PawPrint,
  'baby': Baby,
  'dog': Dog,
  'car': Car,
  'fuel': Fuel,
  'bus': Bus,
  'train': Train,
  'plane': Plane,
  'tv': Tv,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'dumbbell': Dumbbell,
  'gamepad-2': Gamepad2,
  'music': Music,
  'film': Film,
  'beer': Beer,
  'gift': Gift,
  'flower-2': Flower2,
  'briefcase': Briefcase,
  'laptop': Laptop,
  'trending-up': TrendingUp,
  'handshake': Handshake,
  'undo-2': Undo2,
  'wallet': Wallet,
  'coins': Coins,
  'banknote': Banknote,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  'package': Package,
  'hammer': Hammer,
  'wrench': Wrench,
  'receipt': Receipt,
  'users': Users,
  'user': User,
  'target': Target,
  'trophy': Trophy,
  'gem': Gem,
  'rocket': Rocket,
  'crown': Crown,
  'star': Star,
  'heart': Heart,
  'arrow-left-right': ArrowLeftRight,
  'circle': Circle,
};

interface IconProps {
  /** Имя из реестра. Неизвестное значение (старая запись в БД) → circle. */
  name: string | null | undefined;
  size?: number;
  strokeWidth?: number;
  className?: string;
  /**
   * Иконка категории — всегда украшение рядом с её названием, поэтому
   * по умолчанию скрыта от скринридера. Передай label, если иконка
   * остаётся единственным носителем смысла.
   */
  label?: string;
}

export default function Icon({ name, size = 16, strokeWidth = 2, className, label }: IconProps) {
  const Component = ICON_COMPONENTS[toIconName(name)];
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}

/** Список для пикера иконок в форме категории. */
export const ICON_PICKER_ORDER: IconName[] = Object.keys(ICON_COMPONENTS) as IconName[];
