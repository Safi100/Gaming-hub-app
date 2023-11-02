import React from 'react';
import {Link} from 'react-router-dom'

const GameSearch = ({game}) => {
    return (
        <Link className='gameResult' to={`/game/${game._id}`} >
            <div className="image">
                <img src={game.main_photo.url} alt={"user avatar"} />
            </div>
            <div>
                <p className='title' >{game.title}</p>
                <p>{game.genres}</p>
            </div>
        </Link>
    );
}

export default GameSearch;
