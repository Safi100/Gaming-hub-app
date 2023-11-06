import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const GameInformation = ({game, setOpenGameInfo}) => {
    return (
        <div className='blur'>
            <div className="gameInformation">
                <div className="header">
                    <span className='header_title'>{game.title}</span>
                    <span className='close' onClick={()=> setOpenGameInfo(false)}><CloseIcon /></span>
                </div>
                <p>{game.description}</p>
                <div className='requirements'>
                    <h2>SYSTEM REQUIREMENTS</h2>
                    <div className="line" />
                    <div className='requirements_row'>
                        {game.systemRequirements.map((req => 
                            <div key={req.type}>
                                <h3>{req.type}</h3>
                                <ul>
                                    <li><span>OS:</span> {req.os}</li>
                                    <li><span>Processor:</span> {req.processor}</li>
                                    <li><span>Memory:</span> {req.memory}</li>
                                    <li><span>Graphics:</span> {req.graphics}</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameInformation;
