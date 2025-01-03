import axios from 'axios';

const tokenUrl = process.env.REACT_APP_TOKEN_URL;
const callRecordUrl = process.env.REACT_APP_CALL_RECORD_URL;

/**
 * Lấy token từ API.
 */
export const getAuthToken = async (clientId, orgId) => {
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: 'CRM',
                password: '1',
                parameters: {
                    languageName: 'Việt Nam',
                    languageCode: 'vi_VN',
                    clientId,
                    orgId
                }
            })
        });

        if (!response.ok) throw new Error('Failed to fetch token');
        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error fetching token:', error);
        return null;
    }
};

/**
 * Gọi API Call Record.
 */
export const getCallRecord = async (token) => {
    try {
        const response = await axios.post(callRecordUrl, {
            callID: "20241010094039-LFYQGLOW-1593",
            callStatus: "hangup",
            direction: "outbound",
            callerNumber: "0903235622",
            destinationNumber: "9352",
            startTime: "2024-09-01T00:00:00Z",
            answerTime: "2024-09-01T00:00:00Z",
            endTime: "2024-09-01T00:00:00Z",
            hangupBy: "0",
            totalDuration: "31",
            holdingDuration: "0",
            recordingUrl: "20241010094039-LFYQGLOW-1593-103.5.210.80.82800039_0903235622_CSK_MBF_1286.mp3",
            objectId: "1",
            transactionID: "None",
            AD_User_ID: 1050147,
            eventType: "call",
            userName: "9352"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Call Record:", response.data);
    } catch (error) {
        console.error("Lỗi khi lấy Call Record:", error);
    }
};

/**
 * Thực thi quy trình lấy token và gửi Call Record.
 */
export const fetchData = async () => {
    const token = await getAuthToken();
    if (token) await getCallRecord(token);
};
