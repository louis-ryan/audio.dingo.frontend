import { useState } from 'react';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Navbar from '../components/Navbar';

import '../css/fonts.css';
import '../css/links.css';
import '../css/navbar.css';
import '../css/processor.css';
import '../css/utils.css';

function MyApp({ Component, pageProps }) {

    const [credits, setCredits] = useState(null)
    const [pic, setPic] = useState('')
    const [videos, setVideos] = useState([])

    return (
        <UserProvider>
            <Navbar
                credits={credits}
                setCredits={setCredits}
                pic={pic}
                setPic={setPic}
                videos={videos}
                setVideos={setVideos}
            />
            <Component
                credits={credits}
                setCredits={setCredits}
                pic={pic}
                setPic={setPic}
                videos={videos}
                setVideos={setVideos}
                {...pageProps}
            />
        </UserProvider>
    )
}

export default MyApp