const initialState = {
    data: {
        token: null, // Hoặc một giá trị mặc định khác
    },
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_AUTH_DATA':
            return {
                ...state,
                data: action.payload,
            };
        default:
            return state;
    }
};

export default authReducer; 