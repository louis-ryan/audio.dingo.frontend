import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

const Navbar = ({ credits, pic }) => {

    const { user } = useUser();

    return (
        <nav className="navbar">
            <Link href="/">
                <img src={'Audiomax_logo.png'} alt={'platform logo'} style={{ height: '32px' }} />
            </Link>
            <div className="logincontainer">
                {user && pic ? (
                    <>
                        <div>
                            <h2>Credits = {credits}</h2>
                        </div>
                        <div className='gaphor' />
                        <div className='profilepicture'>
                            <img height={40} width={40} src={pic} alt="profile picture" />
                        </div>
                        <div className='gaphor' />
                        <Link href="/api/auth/logout">
                            <h2>Logout</h2>
                        </Link>
                    </>
                ) : (
                    <Link href="/api/auth/login">
                        <h2>Login</h2>
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Navbar;