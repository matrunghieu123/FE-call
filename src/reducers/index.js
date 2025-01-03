import { combineReducers } from 'redux';
import authReducer from './authReducer'; // Giả sử bạn có một reducer tên là authReducer

const rootReducer = combineReducers({
    authReducer,
    // Thêm các reducer khác của bạn ở đây
});

export default rootReducer; 