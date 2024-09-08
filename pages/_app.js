import { useState } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Navbar from '../components/Navbar';

import '../css/navbar.css';
import '../css/utils.css';

function MyApp({ Component, pageProps }) {

    const [credits, setCredits] = useState(null)

    return (
        <UserProvider>
            <Navbar
                credits={credits}
                setCredits={setCredits}
            />
            <Component
                credits={credits}
                setCredits={setCredits}
                {...pageProps}
            />
        </UserProvider>
    )
}

export default MyApp