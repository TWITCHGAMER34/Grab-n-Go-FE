import {Link} from "react-router-dom";
import Seo from "../../components/Seo.tsx";


export default function NotFound() {
    return (
        <>
            <Seo title="404" description="Page Not Found"/>
            <div style={{textAlign: 'center', marginTop: '50px'}}>
                <h1>404 - Page Not Found</h1>
                <p>The page you are looking for does not exist.</p>
                <Link to={'/'}>Back to Home</Link>
            </div>
        </>
    );
}