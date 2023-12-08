import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import PageLoading from '../../components/loading/PageLoading';
import Pagination from '@mui/material/Pagination';
import Giveaway_Card from './GiveawayCard';
import Axios from 'axios';
import './giveaway.css'

const Giveaways = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search)
    const initialPage = new URLSearchParams(location.search).get('page')

    const initialGameCategory = searchParams.get('gameCategory') || ''
    const [gameCategory, setGameCategory] = useState(initialGameCategory);
    const [page, setPage] = useState(initialPage ? parseInt(initialPage) : 1)
    const [giveaways, setGiveaways] = useState([])    
    const [games, setGames] = useState([])
    const [pagesCount, setPagesCount] = useState(0)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)

    // toast
    const notify = () => {
        toast("Joined giveaway successfully!", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
    }
    // Fetch games
    useEffect(() => {
        Axios.get('http://localhost:8000/api/giveaway/availabe-giveaway-games')
        .then(res => {
            setGames(res.data)
        })
        .catch(err => {
            console.log(err);
        })
    }, [])

    // Fetch giveaways
    useEffect(() => {
        Axios.get(`http://localhost:8000/api/giveaway?page=${page}&gameCategory=${gameCategory}`)
        .then((res) => {
            setGiveaways(res.data.giveaways)
            setPagesCount(res.data.Counts_of_Pages)
            setLoading(false)
        })
        .catch(err => {
            setError(err.response.data)
            console.log(err)
            setLoading(false)
        })
        
    }, [page, gameCategory])
    
    // page change
    const handlePageChange = (e, value) => {
        if(page === value) return;
        setPage(value);
        // Update the URL with the new 'page' query parameter.
        navigate(`?page=${value}&gameCategory=${gameCategory}`);
    };

    // Game category change
    const handleCategoryInput = (e) => {
        const selectedOption = e.target.value;
        // Reset page number to 1
        setGameCategory(selectedOption)
        setPage(1)
        // set game category
        navigate(`?page=${1}&gameCategory=${selectedOption}`);
    }

    return (
        loading ? <PageLoading /> :
        <>
        <ToastContainer />
        <div className='wrapper py-3'>
            <div className='d-flex gap-3 flex-wrap'>
            <h2>Giveaways for</h2>
            <select onChange={handleCategoryInput} value={gameCategory}>
                <option value="" key={"all"}>All</option>
                {games.map(game => (
                <option value={game._id} key={game._id}>{game.title}</option>
                ))}
            </select>
            </div>
            <div className='giveaway_row mt-4'>
                {giveaways.length === 0 ? <h2>No giveaways availabe yet...</h2> : 
                    giveaways.map(giveaway => (
                        <Giveaway_Card  key={giveaway._id} giveaway={giveaway} notify={notify} />
                    ))                
                }
            </div>
            { pagesCount > 1 && /* if pages count more than one: render Pagination */
                <div className='pagination mt-5'>
                    <Pagination count={pagesCount} page={page} onChange={handlePageChange} shape="rounded" color='standard' className="whiteTextPagination" />
                </div>
                }
        </div>
        </>
    );
}

export default Giveaways;
