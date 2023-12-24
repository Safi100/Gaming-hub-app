import Axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { stringAvatar } from '../../components/avatar';
import Avatar from '@mui/material/Avatar';
import './home.css'
import PageLoading from '../../components/loading/PageLoading';

const Home = () => {
    const authContext = useContext(AuthContext)
    const [games, setGames] = useState([])
    const [favoriteGames, setFavoriteGames] = useState([])
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Axios.get('http://localhost:8000/api/')
        .then(res => {
            setGames(res.data.games)
            setAdmins(res.data.admins)
            setFavoriteGames(res.data.favorite_games)
            setLoading(false)
        })
        .catch(err => {
            setLoading(false)
            console.log(err)
        })
    }, [])

    return (
        loading ? <PageLoading /> :
        <div className='wrapper home py-4'>
            { authContext.currentUser && favoriteGames?.length > 0 && 
            <div className='mb-5'>
                <h2 className='fs-1 mb-3'>Favorite Games</h2>
                <div className="games">
                    {favoriteGames.map(game => (
                        <a href={`game/${game._id}`} className="game" key={game._id}>
                            <img className='w-100' src={game.main_photo.url} alt={`${game.title} main`} />
                        </a>
                    ))}
                </div>
            </div>
            }
            {games?.length > 0 &&
            <div className='mb-4'>
                <h2 className='fs-1 mb-3'>Games</h2>
                <div className="games">
                    {games.map(game => (
                        <a href={`game/${game._id}`} className="game" key={game._id}>
                            <img className='w-100' src={game.main_photo.url} alt={`${game.title} main`} />
                        </a>
                    ))}
                </div>
            </div>
            }
            {admins?.length > 0 &&
            <div className='mb-4'>
                <h2 className='fs-1 mb-0'>Admins</h2>
                <p className='mb-3'>Note: Send your suggested game for admins.</p>
                <div className='admins'>
                    {admins.map(admin => (
                        <a href={`/profile/${admin._id}`} className='participant' key={admin._id}>
                            <div>{admin.avatar ? <img src={admin.avatar.url} alt="avatar url" /> : 
                            <Avatar {...stringAvatar(`${admin.first_name} ${admin.last_name}`)} />                                    
                            }</div>
                            <div>
                                <p>{admin.first_name} {admin.last_name} {authContext.currentUser?._id === admin._id && <span className='me bg-primary admin_sign'>me</span>}</p>
                                <p>{admin.email}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            }
        </div>
    );
}

export default Home;
