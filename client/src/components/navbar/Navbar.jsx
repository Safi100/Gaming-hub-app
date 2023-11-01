import React, { useState, useContext, useEffect } from 'react'; // Import useState
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import { stringAvatar } from '../avatar';
import Badge from '@mui/material/Badge';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Logout from '@mui/icons-material/Logout';
import { AuthContext } from '../../context/AuthContext'; 
import { ChatContext } from '../../context/ChatContext'; 
import Logo from '../../assets/logo.png';
import './navbar.css'

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
  
  const chatContext = useContext(ChatContext);


  return (
    <div className="navbar_container">
      <div className="wrapper">
        <div className='top'>
          <div className='left'>
            <div className="logo">
              <Link to='/' className='logo_a'><img src={Logo} alt="keeplay logo" /></Link>
              <span className='menu_btn'>
                <IconButton onClick={handleClickNavMenu}    >
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
                <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={'/'}>Live Player Listings</Link>
                </MenuItem>
                { currentUser?.isAdmin && <>
                  <MenuItem onClick={handleCloseNavMenu}>
                  <Link to={'/admin/add-new-game'}>Add New Game</Link>
                </MenuItem>
                </>
                }
              </Menu>
              </span>
            </div>
          </div>
          <div className="search">
            <SearchIcon color='inherit' />
            <input type="text" />
          </div>
          <div className="right">
          {currentUser &&
          <>
            <Link to='/chat'>
            <Badge badgeContent={chatContext.unreadCount} max={99} color='success' sx={{cursor:'pointer'}}>
              <ChatBubbleIcon sx={{color:'#fff'}}/>
            </Badge>
            </Link>
            
              <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleClickUserMenu} size="small" >
                  <Avatar {...stringAvatar(`${currentUser.first_name} ${currentUser.last_name}`)} sx={{bgcolor:'#2e7d32'}}/>
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
                  <Avatar /> Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    <Logout fontSize="small" sx={{color:'#fff'}} />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
            }
          </div>
        </div>
        <div className="search mobile_search">
            <SearchIcon color='inherit' />
            <input type="text" />
        </div>
      </div>
    </div>
  );
}
export default Navbar;
