import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  return (
      <Router>
        <Switch>
        <Route path="/Register" exact component={Home} />
          {/* Add other routes here */}
        </Switch>
      </Router>
  );
}

export default App;
