import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

const Navbar = ({ credits }) => {

    const { user } = useUser();

    return (
        <nav className="navbar">
            <Link href="/">
                <h2>Audio Dingo</h2>
            </Link>
            <div className="logincontainer">
                {user ? (
                    <>
                        <div>
                            <h2>Credits = {credits}</h2>
                        </div>
                        <div className='gaphor' />
                        <div className='profilepicture'>
                            <img height={40} width={40} src={user.picture} alt="profile picture" />
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