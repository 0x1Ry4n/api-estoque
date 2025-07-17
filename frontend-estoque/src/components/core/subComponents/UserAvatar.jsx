import { useEffect, useState, useRef } from 'react';
import { Avatar, Box, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Add as AddIcon, Remove as RemoveIcon, PhotoCamera } from '@mui/icons-material';
import api from './../../../api';
import { useAuth } from '../../../context/AuthContext';

const UserAvatar = ({ userId, showable = true, editable = true, sx = {} }) => {
  const { user } = useAuth();

  const [imageUrl, setImageUrl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [zoom, setZoom] = useState(1);

  const [dragging, setDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const imgRef = useRef(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await api.get(`/auth/users/${userId}/image`, {
          responseType: 'blob'
        });

        const imageBlob = response.data;
        const imageObjectUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageObjectUrl);
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
        setImageUrl(null);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [userId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.patch(`/auth/users/${userId}/image`, formData);
      const response = await api.get(`/auth/users/${userId}/image`, { responseType: 'blob' });
      const imageObjectUrl = URL.createObjectURL(response.data);
      setImageUrl(imageObjectUrl);
    } catch (err) {
      console.error('Erro ao atualizar imagem', err);
    }
  };

  const handleAvatarClick = () => {
    if (imageUrl) {
      setZoom(1);
      setTranslate({ x: 0, y: 0 });
      setOpenDialog(true);
    }
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const zoomOut = () => {
    setZoom((z) => {
      const newZoom = Math.max(z - 0.2, 1);
      if (newZoom === 1) setTranslate({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const limitTranslate = (newX, newY) => {
    if (!imgRef.current) return { x: 0, y: 0 };

    const container = imgRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const imgRect = imgRef.current.getBoundingClientRect();

    const cw = containerRect.width;
    const ch = containerRect.height;

    const iw = imgRect.width;
    const ih = imgRect.height;

    const maxX = (iw - cw) / 2;
    const maxY = (ih - ch) / 2;

    let x = newX;
    let y = newY;

    if (iw <= cw) {
      x = 0;
    } else {
      if (x > maxX) x = maxX;
      if (x < -maxX) x = -maxX;
    }

    if (ih <= ch) {
      y = 0;
    } else {
      if (y > maxY) y = maxY;
      if (y < -maxY) y = -maxY;
    }

    return { x, y };
  };

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY || e.detail || e.wheelDelta;

    if (delta < 0) {
      setZoom((z) => Math.min(z + 0.2, 3));
    } else {
      setZoom((z) => {
        const newZoom = Math.max(z - 0.2, 1);
        if (newZoom === 1) setTranslate({ x: 0, y: 0 });
        return newZoom;
      });
    }
  }

  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setDragging(true);
    setOrigin({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const limited = limitTranslate(e.clientX - origin.x, e.clientY - origin.y);
    setTranslate(limited);
  };

  const onMouseUp = () => {
    if (dragging) setDragging(false);
  };

  const onTouchStart = (e) => {
    if (zoom <= 1) return;
    const touch = e.touches[0];
    setDragging(true);
    setOrigin({ x: touch.clientX - translate.x, y: touch.clientY - translate.y });
  };

  const onTouchMove = (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const limited = limitTranslate(touch.clientX - origin.x, touch.clientY - origin.y);
    setTranslate(limited);
  };

  const onTouchEnd = () => {
    if (dragging) setDragging(false);
  };

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
        <Avatar
          src={imageUrl}
          sx={{
            width: 110, 
            height: 110, 
            boxShadow: 3,
            border: '2px solid #ccc',
            color: '#808080',
            backgroundColor: '#f0f0f0', 
            ...sx
          }}
          onClick={handleAvatarClick}
        >
            {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
        </Avatar>

        {editable && (
          <>
            <input
              type="file"
              id="upload-avatar"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <label htmlFor="upload-avatar">
              <Button
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  minWidth: 'auto',
                  padding: '6px',
                  borderRadius: '50%',
                  bgcolor: '#00796b',
                  color: 'white',
                  boxShadow: 2,
                  '&:hover': { bgcolor: '#004d40' },
                }}
              >
                <PhotoCamera fontSize="medium" />
              </Button>
            </label>
          </>
        )}
      </Box>

      {showable && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogContent
            sx={{
              position: 'relative',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflow: 'hidden',
            }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            onWheel={onWheel}
          >
            <IconButton
              onClick={() => setOpenDialog(false)}
              sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.600' }}
            >
              <CloseIcon />
            </IconButton>

            <Box
              component="img"
              ref={imgRef}
              src={imageUrl}
              alt="Visualização"
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                borderRadius: 2,
                transform: `scale(${zoom}) translate(${translate.x}px, ${translate.y}px)`,
                transition: dragging ? 'none' : 'transform 0.3s ease',
                userSelect: 'none',
                cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
              }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              draggable={false}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" size="small" onClick={zoomOut} disabled={zoom <= 1}>
                <RemoveIcon />
              </Button>
              <Button variant="contained" size="small" onClick={zoomIn} disabled={zoom >= 3}>
                <AddIcon />
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UserAvatar;
