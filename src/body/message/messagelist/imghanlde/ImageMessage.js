import React, { useState, useEffect } from 'react';

const ImageMessage = ({ src, alt }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.width,
        height: img.height
      });
    };
    img.src = src;
  }, [src]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getImageStyle = () => {
    const maxWidth = 300; // Độ rộng tối đa của ảnh
    const maxHeight = 200; // Chiều cao tối đa của ảnh
    let { width, height } = imageDimensions;

    // Kiểm tra kích thước thực tế của ảnh trước khi áp dụng
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height *= ratio;
    }

    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width *= ratio;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
      transition: 'all 0.3s ease' // Thêm hiệu ứng chuyển đổi mượt mà
    };
  };

  return (
    <div 
      className={`image-message ${isExpanded ? 'expanded' : ''}`} 
      onClick={toggleExpand} 
      role="button" 
      aria-label="Expand image" 
      tabIndex={0}
      style={styles.imageMessage}
    >
      <img 
        src={src} 
        alt={alt || 'Image message'} // Đảm bảo alt không bị rỗng
        className="message-image" 
        style={isExpanded ? { ...styles.expandedImage, ...styles.transition } : { ...getImageStyle(), ...styles.transition }}
      />
    </div>
  );
};

const styles = {
  imageMessage: {
    display: 'inline-block',
    maxWidth: '300px',
    maxHeight: '200px',
    overflow: 'hidden',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  expanded: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageImage: {
    display: 'block',
    objectFit: 'contain',
    transition: 'all 0.3s ease',
  },
  expandedImage: {
    maxWidth: '90%',
    maxHeight: '90%',
    objectFit: 'contain',
  },
  transition: {
    transition: 'all 0.3s ease',
  },
};

export default ImageMessage;
