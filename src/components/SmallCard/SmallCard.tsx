import './smallcard.scss'
import type {ReactNode} from 'react';

type SmallCardProps = {
    icon?: ReactNode;
    title?: string;
    text?: string;
};

export default function SmallCard({ icon, title, text }: SmallCardProps) {
    return (
        <div className="small-card">
            {icon && <div className="small-card__icon">{icon}</div>}
            {title && <h4 className="small-card__title">{title}</h4>}
            {text && <p className="small-card__text">{text}</p>}
        </div>
    );
}