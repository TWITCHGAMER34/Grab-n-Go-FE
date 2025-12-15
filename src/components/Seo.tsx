import { Helmet } from 'react-helmet-async';

type SeoProps = {
    title?: string;
    description?: string;
};

export default function Seo({ title, description }: SeoProps) {
    const fullTitle = title ? `${title} | Grab 'n' Go` : 'Grab \'n\' Go';
    return (
        <Helmet>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
        </Helmet>
    );
}