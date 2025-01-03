import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';
import ChatRoom from './components/ChatRoom';
// import Login from './components/Login';
// import Register from './components/Register';

const store = createStore(rootReducer);

const App = () => {
	return (
		<Provider store={store}>
			<Router>
				<Routes>
					<Route path="/" element={<ChatRoom />} />
				</Routes>
			</Router>
		</Provider>
	);
};

export default App;
