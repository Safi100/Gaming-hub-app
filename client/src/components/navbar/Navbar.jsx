import React, { useState, useContext, useEffect } from 'react'; // Import useState
import { Link } from 'react-router-dom'
import {Badge, MenuItem, Box, Menu, IconButton, Avatar, Tooltip, ListItemIcon, Divider} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import SearchIcon from '@mui/icons-material/Search';
import Logout from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { stringAvatar } from '../avatar';
import Loading from '../loading/Loading';
import Logo from '../../assets/logo.png';
import Axios from 'axios'
import { AuthContext } from '../../context/AuthContext'; 
import { ChatContext } from '../../context/ChatContext'; 
import { NotificationContext } from '../../context/NotificationContext';
import './navbar.css'
// SEARCH RESULTS DIV
import UserSearch from '../search/UserSearch';
import GameSearch from '../search/GameSearch';

function Navbar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNav, setAnchorElNav] = useState(null);
  
  const openUser = Boolean(anchorElUser);
  const openNav = Boolean(anchorElNav);

  const handleClickUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleClickNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // get current user
  const [currentUser, setCurrentUser] = useState(null);
  const authContext = useContext(AuthContext);
  useEffect(() => {
    setCurrentUser(authContext.currentUser);
  }, [authContext]);
  // logout user
  const handleLogoutAndCloseMenu = () => {
    authContext.logout(); // Call the logout method from authContext
    handleCloseUserMenu(); // Close the user menu
  };

  const chatContext = useContext(ChatContext);
  const notificationContext = useContext(NotificationContext);

  // search
  const handleSearch = (e) => {
    const text = e.target.value.trimStart();
    setSearch(text);
  }
  const [search, setSearch] = useState('');
  const [search_result, setSearch_result] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if(search.length > 0) {
      setLoading(true);
      Axios.post(`http://localhost:8000/api/search?q=${search}`)
      .then(res => {
        setSearch_result(res.data);
        setLoading(false);
      })
      .catch(err => console.log(err))
    }
  }, [search]);

  return (
    <div className="navbar_container">
      <div className="wrapper">
        <div className='top'>
          <div className='left'>
            <div className="logo">
              <Link to='/' className='logo_a'><img src={Logo} alt="keeplay logo" /></Link>
              <span className='menu_btn'>
                <IconButton onClick={handleClickNavMenu} >
                  <MenuIcon sx={{color: '#fff'}}/>
                </IconButton>
                <Menu
                anchorEl={anchorElNav}
                id="nav-menu"
                open={openNav}
                onClose={handleCloseNavMenu}
                onClick={handleCloseNavMenu}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    color:'#fff',
                    bgcolor:'#242526',
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: '#242526',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                      },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={'/'}>Home</Link>
                </MenuItem>
                { currentUser?.isAdmin &&
                  <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={'/admin/add-new-game'}>Add New Game</Link>
                </MenuItem>
                }
                { currentUser?.isAdmin &&
                  <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={'/admin/games-control'}>Games Control</Link>
                </MenuItem>
                }
                { currentUser?.isAdmin &&
                  <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={'/admin/add-new-giveaway'}>Add New Giveaway</Link>
                </MenuItem>
                }
                  <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={`/giveaway?page=${1}&gameCategory=`}>Giveaways</Link>
                </MenuItem>
                { currentUser &&
                  <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={'/giveaway/my-giveaway'}>My giveaways</Link>
                </MenuItem>
                }
              </Menu>
              </span>
            </div>
          </div>
          <div className="search header_search">
            <SearchIcon color='inherit' />
            <input value={search} onChange={(handleSearch)} type="text" placeholder='Search...' />
            {search.length > 0 &&
              <div className="header_search_result">
              {loading ? <Loading /> :
                <>
                {search_result.length > 0 ?
                  search_result.map((result) =>
                    <div className="result" onClick={()=> setSearch('')} key={result._id} >
                      {result.isUser ? <UserSearch user={result} /> : <GameSearch game={result} />}
                    </div>
                  ) 
                  :
                  <h2 className='no_reuslt'>No Result...</h2>
                }
                </>
                }
              </div>
            }
          </div>
          <div className="right">
          {currentUser ?
          <>
            <Link to='/notifications'> 
            <Badge badgeContent={notificationContext.notifications.length} max={99} color='success' sx={{cursor:'pointer'}}>
              <NotificationsIcon sx={{color:'#fff'}}/>
            </Badge>
            </Link>
            <Link to='/chat'>
            <Badge badgeContent={chatContext.unreadCount} max={99} color='success' sx={{cursor:'pointer'}}>
              <ChatBubbleIcon sx={{color:'#fff'}}/>
            </Badge>
            </Link>
            
              <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleClickUserMenu} size="small" >
                {currentUser.avatar ? <img className='avatar_image' src={currentUser.avatar.url} alt="avatar image" /> : <Avatar {...stringAvatar(`${currentUser.first_name} ${currentUser.last_name}`)} sx={{bgcolor:'#2e7d32'}}/>}
                
                </IconButton>
              </Tooltip>
            </Box>
              <Menu
                anchorEl={anchorElUser}
                id="account-menu"
                open={openUser}
                onClose={handleCloseUserMenu}
                onClick={handleCloseUserMenu}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    color:'#fff',
                    bgcolor:'#242526',
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: '#242526',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                      },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                <MenuItem onClick={handleCloseUserMenu}>
                  <Link to={`/profile/${currentUser._id}`} style={{display:"flex", alignItems:'center'}}>
                    <Avatar /> Profile
                    </Link>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogoutAndCloseMenu}>
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{color:'#fff'}} />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
            :
            <>
              <Link to='/login'>Login</Link>
              <Link to='/register'>Register</Link>
            </>
            }
          </div>
        </div>
        <div className="search mobile_search header_search">
            <SearchIcon color='inherit' />
            <input className='header_search' value={search} onChange={(handleSearch)} type="text" placeholder='Search...' />
            {search.length > 0 &&
              <div className="header_search_result">
              {loading ? <Loading /> :
                <>
                {search_result.length > 0 ?
                  search_result.map((result) =>
                    <div className="result" onClick={()=> setSearch('')} key={result._id} >
                      {result.isUser ? <UserSearch user={result} /> : <GameSearch game={result} />}
                    </div>
                  ) 
                  :
                  <h2 className='no_reuslt'>No Result...</h2>
                }
                </>
                }
              </div>
            }
        </div>
      </div>
    </div>
  );
}
export default Navbar;
