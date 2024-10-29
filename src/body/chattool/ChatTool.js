import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import { CloseOutlined, PaperClipOutlined } from '@ant-design/icons';
import SendMessage from '../message/sendmessage/SendMessage';
import './ChatTool.css';

const ChatTool = ({ isJoined, userName }) => { // Nhận thêm props userName
  const [notes, setNotes] = useState([]); // Trạng thái để quản lý các ghi chú
  const [noteInput, setNoteInput] = useState(""); // Trạng thái để quản lý giá trị nhập vào của ghi chú
  const notesEndRef = useRef(null); // Tham chiếu đến phần cuối của danh sách ghi chú

  const handleNoteInputChange = (e) => {
    setNoteInput(e.target.value);
  };

  const handleDeleteNote = (index) => {
    setNotes(prevNotes => prevNotes.filter((_, i) => i !== index));
  };

  const handleSend = async (message, files) => {
    if (isJoined) { // Kiểm tra nếu đã tham gia
      console.log("Sending message:", message);
      console.log("Selected files:", files);

      if (message.trim() !== '' || files.length > 0) {
        const newNote = {
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          content: message.trim(),
          fileName: files.length > 0 ? files[0].name : null, // Lấy tên file đầu tiên
          filePreview: files.length > 0 ? URL.createObjectURL(files[0]) : null, // Tạo URL preview cho file
          fileType: files.length > 0 ? files[0].type : null, // Lấy loại file
        };
        setNotes(prevNotes => [...prevNotes, newNote]);
        setNoteInput("");
      }
    }
  };

  const handleFileClick = (filePreview, fileType, fileName) => {
    if (fileType.startsWith('image/')) {
      window.open(filePreview, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = filePreview;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // useEffect để cuộn xuống cuối khi danh sách ghi chú thay đổi
  useEffect(() => {
    if (notesEndRef.current) {
      notesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [notes]);

  return (
    <div className="chat-tool-container">
      <div className="notes-title">Ghi chú</div> {/* Thay đổi từ thẻ <h2> thành <div> */}
      <div className="tool-wrapper">
        <div className="notes-container">
          {notes.map((note, index) => (
            <div key={index} className="note-item">
              <div className="note-header">
                <div>
                  <span className="note-date">{userName}</span> {/* Sử dụng userName */}
                  <span> Ngày {note.date}</span>
                </div>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => handleDeleteNote(index)}
                  className="note-delete-button"
                />
              </div>
              <div className="note-content">
                {note.content}
                {note.fileName && (
                  <div className="note-attachment">
                    <PaperClipOutlined />
                    <Button type="link" onClick={() => handleFileClick(note.filePreview, note.fileType, note.fileName)}>
                      {note.fileName}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={notesEndRef} /> {/* Thêm phần tử để cuộn đến */}
        </div>
        {isJoined && ( // Chỉ hiển thị SendMessage nếu đã tham gia
          <SendMessage
            userData={{ message: noteInput }}
            handleMessage={handleNoteInputChange}
            handleKeyPress={(e) => { if (e.key === 'Enter') handleSend(noteInput, []); }}
            sendValue={handleSend} // Truyền hàm handleSend
            sendPrivateValue={handleSend} // Truyền hàm handleSend
            tab="NOTES"
          />
        )}
      </div>
    </div>
  );
};

export default ChatTool;