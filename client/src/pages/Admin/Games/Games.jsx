import { useNavigate, useLocation } from 'react-router-dom';
import {useState, useEffect, useContext} from 'react';
import Axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import PageLoading from '../../../components/loading/PageLoading';
import NotAuthorize from '../../../components/redirecting/NotAuthorize'
import { AuthContext } from '../../../context/AuthContext';
import Pagination from '@mui/material/Pagination';
import SearchIcon from '@mui/icons-material/Search';
import './games.css'

const Games = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const initialPage = new URLSearchParams(location.search).get('page');
    const [page, setPage] = useState(initialPage ? parseInt(initialPage) : 1);

    const authContext = useContext(AuthContext)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [games, setGames] = useState([])
    const [search, setSearch] = useState('')
    const [pagesCount, setPagesCount] = useState(0)
    // search
    const handleSeachInput = (e) => {
        const text = e.target.value.trimStart()
        // Reset page number to 1
        handlePageChange('', 1)
        // change search value
        setSearch(text)
    }
    // page change
    const handlePageChange = (e, value) => {
        if(page === value) return;
        setPage(value);
        // Update the URL with the new 'page' query parameter.
        if(value === 1) {
            navigate(``);
         }else{
            navigate(`?page=${value}`);
        }
      };

    // fetch games
    useEffect(() => {
        Axios.get(`http://localhost:8000/api/game/fetch-games-to-control?page=${page}&title=${search}`)
        .then((res) => {
            setGames(res.data.games)
            setPagesCount(res.data.Counts_of_Pages)
            setLoading(false)
        })
        .catch(err => {
            setError(err.response.data)
            console.log(err)
            setLoading(false)
        })
        
    }, [authContext.currentUser, page, search])
    // delete game
    // todo : later
    const deleteGame = (gameID) => {

    }
    return (
        loading ? <PageLoading /> :
        <>
            <ToastContainer/>
            {(!authContext.currentUser || !authContext.currentUser.isAdmin) ? <NotAuthorize /> :
            <div className='wrapper'>
            {error ? <h2 className='text-danger my-5 fs-1'>{error}</h2> :
            <>
            <div className='games-control'>
                <div className='search_game'>
                    <SearchIcon />
                    <input type="text" value={search} onChange={handleSeachInput} placeholder='Search for game...' />
                    </div>
                <div className="games">
                    {games.length === 0 && <h2>No Games on page {page} yet...</h2>}
                    {games.map((game) => (
                        <div className="game" key={game._id}>
                            <div className="game_image"><img loading='lazy' src={game.main_photo.url} alt={`${game.title} image`} /></div>
                            <div className="game_info">
                                <h2>{game.title}</h2>
                                <p dangerouslySetInnerHTML={{ __html: game.description.replace(/\n/g, '<br>')}} />
                                <p><span>Release Date:</span> {game.release_date}</p>
                                <p><span>Platforms:</span> {game.platforms}</p>
                                <div className="buttons">
                                    <a href={`/game/${game._id}`}>Go to game group</a>
                                    <a href={`/admin/edit-game/${game._id}`} >Edit Game</a>
                                    <button>Delete Game</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                { pagesCount > 1 && /* if pages count more than one: render Pagination */
                    <div className='pagination'>
                    <Pagination count={pagesCount} page={page} onChange={handlePageChange} shape="rounded" color='standard' className="whiteTextPagination" />
                    </div>
                }
            </div>
            </>
            }
            </div>
            }
        </>
        );
}

export default Games;
