import {useState, useEffect, useContext} from 'react';
import { useParams } from 'react-router-dom';
import Axios from 'axios'
import { AuthContext } from '../../context/AuthContext';
import PageLoading from '../../components/loading/PageLoading';
import './gameProfile.css'
import GameInformation from './GameInformation';
import TopicForm from '../../components/topicForm/TopicForm';

const GameProfile = () => {
    const {id} = useParams()
    const [game, setGame] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentUser, setCurrentUser] = useState(null)
    const [openGameInfo, setOpenGameInfo] = useState(false)
    // currentUser
    const authContext = useContext(AuthContext)
    useEffect(() => {
        setCurrentUser(authContext.currentUser)
    }, [authContext.currentUser])
    // fetch game
    useEffect(() => {
        Axios.get(`http://localhost:8000/api/game/${id}`)
        .then(res => {
            setGame(res.data)
            console.log(res.data)
            setLoading(false)
        })
        .catch(err => {
            setError(err.response.data)
            console.log(err)
            setLoading(false)
        })
    }, [id])

    // Favorite status
    const isFavorite = currentUser?.favorite_games.some(gameID => gameID === id)
    
    const toggle_favorite = () => {
        Axios.post(`http://localhost:8000/api/game/add-to-favorite/${id}`)
        .then(res => {
            setCurrentUser((prevCurrentUser) => ({
                ...prevCurrentUser,
                favorite_games: res.data,
              }));
        })
        .catch(err => console.log(err))
    }
    return (
        loading ? <PageLoading /> :
        <div className='wrapper'>
            {error ? <h2 className='text-danger my-5 fs-1'>{error}</h2> :
            <>
            <div className="gameProfile">
                <div className="cover_photo" style={{backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${game.cover_photo.url}')`}}></div>
                <div className="game_info">
                    <div className='main_photo'>
                        <img src={game.main_photo.url} alt={`${game.title}-main`} />
                    </div>
                    <div className='game'>
                        <div className='game_details'>
                            <h2>{game.title}</h2>
                            <div className="game_properties">
                                <p><span>GENRES:</span> {game.genres}</p>
                                <p><span>PLATFORMS:</span> {game.platforms}</p>
                                <p><span>RELEASE DATE:</span> {game.release_date}</p>
                            </div>
                        </div>
                        <div className="buttons">
                            {currentUser && (
                                isFavorite ? 
                                <button className='remove_fav' onClick={toggle_favorite}>Remove from favorite</button>
                                :
                                <button className='add_fav' onClick={toggle_favorite}>Add to favorite</button>
                            )}
                            <button onClick={() => setOpenGameInfo(true)}>Game information</button>
                        </div>
                    </div>
                </div>
                {currentUser && < TopicForm /> }
            </div>
            </>
            }
            { openGameInfo && <GameInformation game={game} setOpenGameInfo={setOpenGameInfo} /> }
        </div>
    );
}

export default GameProfile;
