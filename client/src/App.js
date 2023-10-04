import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// pages
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import EmailVerify from './pages/Auth/EmailVerify';

function App() {
  return (
      <Router>
        <Routes>
          {/* <Route path="/" exact element={} /> */} {/* Index page... later */}
          <Route path="/register" element={<Register /> } />
          <Route path="/login" element={<Login /> } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:id/:token" element={<EmailVerify />} />
          {/* <Route path='*' element={} />  */}  {/* Not found page... later */}
           
        </Routes>
      </Router>
  );
}

export default App;
