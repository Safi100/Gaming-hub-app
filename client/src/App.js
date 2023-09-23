import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// pages
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';

function App() {
  return (
      <Router>
        <Switch>
        <Route path="/register" exact component={<Register /> } />
        <Route path="/login" exact component={<Login /> } />
          {/* Add other routes here */}
        </Switch>
      </Router>
  );
}

export default App;
