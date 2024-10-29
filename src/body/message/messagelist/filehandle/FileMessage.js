import { FaFileWord, FaFileExcel, FaFilePdf, FaFileAlt } from 'react-icons/fa';

const getFileIcon = (fileType) => {
    switch (fileType) {
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <FaFileWord className="file-icon" style={{ color: '#2b579a' }} />; // Màu xanh cho file Word
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return <FaFileExcel className="file-icon" style={{ color: '#217346' }} />; // Màu xanh lá cho file Excel
        case 'application/pdf':
            return <FaFilePdf className="file-icon" style={{ color: '#d04437' }} />; // Màu đỏ cho file PDF
        default:
            return <FaFileAlt className="file-icon" style={{ color: '#757575' }} />; // Màu xám cho các loại file khác
    }
};

const FileMessage = ({ fileUrl, fileType, fileName }) => {
    // Kiểm tra nếu fileUrl hoặc fileName bị rỗng
    if (!fileUrl || !fileName) {
        console.warn('File URL hoặc tên file bị rỗng');
        return null; // Không hiển thị gì nếu thiếu thông tin
    }

    return (
        <div style={styles.fileMessage}>
            {getFileIcon(fileType)}
            <div style={styles.fileInfo}>
                <a href={fileUrl} download={fileName} style={styles.fileName}>
                    {fileName || 'Tải xuống file'}
                </a>
            </div>
        </div>
    );
};

const styles = {
    fileMessage: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '8px',
        margin: '4px 0',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    fileIcon: {
        fontSize: '24px',
        marginRight: '8px',
    },
    fileInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    fileName: {
        fontWeight: 'bold',
        color: '#007bff',
        textDecoration: 'none',
    },
    fileNameHover: {
        textDecoration: 'underline',
    },
};

export default FileMessage;
