import cn from 'classnames';

type Props = {
    className?: string;
    children: React.ReactNode;
    variant?: 'neutral' | 'active' | 'good' | 'warning' | 'pending' | 'danger';
}

export type CardVariant = 'neutral' | 'active' | 'good' | 'warning' | 'pending' | 'danger';

export default function Card({ className, children, variant = 'neutral' }: Props) {
    return (
        <div
            className={cn(className, 'rounded-sm shadow-sm p-2 text-xs border', {
                'bg-card': variant === 'neutral',
                'bg-green-100 dark:bg-green-900 border-green-500': variant === 'good' || variant === 'active',
                'bg-orange-100 dark:bg-orange-900 border-orange-500': variant === 'warning' || variant === 'pending',
                'bg-red-100 dark:bg-red-900 border-red-500': variant === 'danger',
            })}
        >
            {children}
        </div>
    )
}
