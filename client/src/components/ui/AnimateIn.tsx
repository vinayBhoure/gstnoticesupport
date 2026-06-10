'use client';

import { useInView } from '@/hooks/useInView';

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  distance?: number;
  as?: React.ElementType;
}

export function AnimateIn({
  children,
  className,
  style,
  delay = 0,
  distance = 24,
  as: Tag = 'div',
}: AnimateInProps) {
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
