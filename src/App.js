import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
// import Login from './components/Login';
// import Register from './components/Register';

const App = () => {
	return (
		<Router>
			<Routes>
				{/* <Route path="/" element={<Login />} />
				<Route path="/register" element={<Register />} /> */}
				<Route path="/" element={<ChatRoom />} />
			</Routes>
		</Router>
	);
};

export default App;
