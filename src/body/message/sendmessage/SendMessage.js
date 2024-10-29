import React, { useRef, useState } from 'react';
import './SendMessage.css';
import { FaPaperPlane, FaPaperclip, FaTimes, FaSmile } from 'react-icons/fa';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import EmojiPicker from 'emoji-picker-react';

const SendMessage = ({ userData, handleMessage, handleKeyPress, sendValue, sendPrivateValue, tab }) => {
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Trạng thái hiển thị emoji picker

    const handleSend = async () => {
        if (userData.message.trim() !== '' || selectedFiles.length > 0) {
            const files = selectedFiles.map(fileObj => fileObj.file);
            if (tab === "CHATROOM") {
                await sendValue(userData.message, files);
            } else {
                await sendPrivateValue(userData.message, files);
            }
            handleMessage({ target: { value: '' } });
            setSelectedFiles([]);
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map(file => ({
            file: file,
            preview: URL.createObjectURL(file)
        }));
        setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prevFiles => {
            const newFiles = [...prevFiles];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    // Sửa hàm handleEmojiClick để xử lý đúng emoji
    const handleEmojiClick = (emojiObject) => {
        if (emojiObject && emojiObject.emoji) {
            handleMessage({ target: { value: userData.message + emojiObject.emoji } });
        }
        setShowEmojiPicker(false); // Ẩn picker sau khi chọn emoji
    };

    return (
        <div className="send-message-container">
            <div className="message-input-area">
                {selectedFiles.length > 0 && (
                    <div className="selected-files">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="selected-file">
                                {file.file.type.startsWith('image/') ? (
                                    <img src={file.preview} alt="selected" className="selected-image" />
                                ) : (
                                    <div className="selected-doc">
                                        <span>{file.file.name}</span>
                                        <span>({(file.file.size / 1024).toFixed(2)} KB)</span>
                                    </div>
                                )}
                                <button onClick={() => removeSelectedFile(index)} className="remove-file">
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="send-message">
                    <Avatar size={30} icon={<UserOutlined />} className="send-avatar" />
                    <div className="send-divider"></div>
                    <input
                        ref={inputRef}
                        type="text"
                        className="input-message"
                        placeholder="Nhập tin nhắn"
                        value={userData.message}
                        onChange={handleMessage}
                        onKeyDown={handleKeyPress}
                    />

                    {/* Nút tải lên file */}
                    <button
                        type="button"
                        className="file-button"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <FaPaperclip />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        multiple
                    />

                    {/* Nút emoji */}
                    {tab !== "NOTES" && ( // Thêm điều kiện kiểm tra tab
                        <button
                            type="button"
                            className="emoji-button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <FaSmile />
                        </button>
                    )}
                    {showEmojiPicker && tab !== "NOTES" && ( // Thêm điều kiện kiểm tra tab
                        <div className="emoji-picker">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}

                    {/* Nút gửi */}
                    <button
                        type="button"
                        className="send-button"
                        onClick={handleSend}
                    >
                        <FaPaperPlane />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendMessage;
