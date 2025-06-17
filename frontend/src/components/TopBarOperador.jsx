import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ title }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/', { replace: true });
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton color="inherit" onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
