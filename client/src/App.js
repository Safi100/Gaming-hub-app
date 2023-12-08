import React, {lazy, Suspense, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/navbar/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

// pages
const Home = lazy(() => import('./pages/Home/Home'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Login = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const EmailVerify = lazy(() => import('./pages/Auth/EmailVerify'));
const Chat = lazy(() => import('./pages/Chat/Chat'));
const NewGame = lazy(() => import('./pages/Admin/NewGame/NewGame'));
const NewGiveAway = lazy(() => import('./pages/Admin/NewGiveAway/NewGiveAway'));
const EditGame = lazy(() => import('./pages/Admin/EditGame/EditGame'));
const UserProfile = lazy(() => import('./pages/userProfile/UserProfile'));
const GamesControl = lazy(() => import('./pages/Admin/Games/Games'));
const GameProfile = lazy(() => import('./pages/gameProfile/GameProfile'));
const Giveaways = lazy(() => import('./pages/giveaways/Giveaways'));

axios.defaults.withCredentials = true;

function App() {
  return (
  <>
    <Navbar />
    <Suspense>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/register" element={<Register /> } />
          <Route path="/login" element={<Login /> } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/giveaway" element={<Giveaways />} />
          <Route path="/chat" element={<Chat />} /> {/* protected route...*/}
          <Route path="/admin/add-new-giveaway" element={<NewGiveAway />} />
          <Route path="/admin/add-new-game" element={<NewGame />} />
          <Route path="/admin/games-control" element={<GamesControl />} />
          <Route path="/admin/edit-game/:id" element={<EditGame />} />
          <Route path="/chat/:id" element={<Chat />} /> {/* protected route... */}
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/game/:id" element={<GameProfile />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} /> 
          <Route path="/verify-email/:id/:token" element={<EmailVerify />} />
          <Route path='*' element={<p>There's nothing here: 404!</p>} />  {/* Not found page... */}
        </Routes>
    </Suspense>
  </>
  );
}

export default App;