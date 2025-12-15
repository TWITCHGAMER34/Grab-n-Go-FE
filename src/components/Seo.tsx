// File: `src/components/Seo.tsx`
/**
 * Seo
 *
 * Small helper component that sets the document title and optional meta
 * description using `react-helmet-async`.
 *
 * - Appends the site name to a provided `title` (e.g. `Page | Grab 'n' Go`).
 * - Omits the description meta tag when `description` is not provided.
 */

import { Helmet } from 'react-helmet-async';

type SeoProps = {
    title?: string;
    description?: string;
};

/**
 * Render head tags for a page.
 *
 * @param props.title - optional page title fragment
 * @param props.description - optional meta description content
 */
export default function Seo({ title, description }: SeoProps) {
    // Build full title: either "Provided Title \| Site Name" or the site name alone.
    const fullTitle = title ? `${title} | Grab 'n' Go` : "Grab 'n' Go";

    return (
        <Helmet>
            {/* Set the document title */}
            <title>{fullTitle}</title>

            {/* Only render meta description when provided to avoid empty tags */}
            {description && <meta name="description" content={description} />}
        </Helmet>
    );
}
