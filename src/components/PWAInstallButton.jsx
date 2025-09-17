import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
  Paper,
  Slide,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Fab
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  PhoneAndroid as PhoneIcon,
  Computer as ComputerIcon,
  CheckCircle as CheckIcon,
  CloudDownload as DownloadIcon
} from '@mui/icons-material';
import { usePWAInstall } from '../hooks/usePWAInstall';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PWAInstallButton = ({ 
  variant = 'banner', // 'banner', 'button', 'fab', 'both'
  position = 'bottom-right',
  autoPromptDelay = 30000,
  showOnlyOnce = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasBeenPrompted, setHasBeenPrompted] = useState(false);

  useEffect(() => {
    // Check if user has been prompted before
    const prompted = localStorage.getItem('atss-pwa-prompted');
    setHasBeenPrompted(!!prompted);

    // Auto-show banner after delay
    if (isInstallable && !isInstalled && !prompted && (variant === 'banner' || variant === 'both')) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, autoPromptDelay);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, variant, autoPromptDelay]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowDialog(true);
      return;
    }

    const result = await promptInstall();
    
    if (result.outcome === 'accepted') {
      setShowSuccess(true);
      setShowBanner(false);
      localStorage.setItem('atss-pwa-prompted', 'true');
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (result.outcome === 'no-prompt') {
      setShowDialog(true);
    }
    
    if (result.outcome !== 'accepted') {
      localStorage.setItem('atss-pwa-prompted', 'true');
      setHasBeenPrompted(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('atss-pwa-prompted', 'true');
    setHasBeenPrompted(true);
  };

  // Don't render if installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  const getBannerPosition = () => {
    const baseStyle = {
      position: 'fixed',
      zIndex: 1300,
      left: 16,
      right: 16,
    };

    switch (position) {
      case 'top':
        return { ...baseStyle, top: 16 };
      case 'top-right':
        return { ...baseStyle, top: 16, left: 'auto', right: 16, maxWidth: 400 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 16, left: 'auto', right: 16, maxWidth: 400 };
      case 'bottom':
      default:
        return { ...baseStyle, bottom: 16 };
    }
  };

  const getFabPosition = () => {
    switch (position) {
      case 'top-right':
        return { position: 'fixed', top: 16, right: 16, zIndex: 1300 };
      case 'bottom-right':
      default:
        return { position: 'fixed', bottom: 80, right: 16, zIndex: 1300 };
    }
  };

  return (
    <>
      {/* Install Banner */}
      {showBanner && (variant === 'banner' || variant === 'both') && (
        <Paper
          elevation={8}
          sx={{
            ...getBannerPosition(),
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
            color: 'white',
            borderRadius: 2,
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              from: {
                opacity: 0,
                transform: position.includes('top') ? 'translateY(-100px)' : 'translateY(100px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              {isMobile ? <PhoneIcon /> : <ComputerIcon />}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Install VQ App
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Quick access to vehicle queue dashboard
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleInstallClick}
                startIcon={<InstallIcon />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                }}
              >
                Install
              </Button>
              <IconButton
                size="small"
                onClick={handleDismissBanner}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Install Button */}
        {(variant === 'button' || variant === 'both') && (
        isMobile ? (
            <Button
            variant="contained"
            color="primary"
            size='small'
            width="10px"
            onClick={handleInstallClick}
            sx={{ textTransform: 'none', fontWeight: 600, marginRight:1 , minWidth:'40px' }}
            >
            <InstallIcon  sx={{ fontSize: 17 }}/>
            </Button>
        ) : (
            <Button
            variant="contained"
            color="primary"
            startIcon={<InstallIcon />}
            onClick={handleInstallClick}
            sx={{ textTransform: 'none', fontWeight: 600 , marginRight:1   }}
            >
            Install App
            </Button>
        )
        
        )}


      {/* Floating Action Button */}
      {variant === 'fab' && (
        <Fab
          color="primary"
          aria-label="install"
          onClick={handleInstallClick}
          sx={getFabPosition()}
        >
          <DownloadIcon />
        </Fab>
      )}

      {/* Install Dialog */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
            <Typography variant="h6">Install ATSS Vehicle Queue</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {isIOS ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" paragraph>
                To install ATSS on your iOS device:
              </Typography>
              <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mb: 2 }}>
                <Typography variant="body2" paragraph>
                  1. Tap the <strong>Share</strong> button ⬆️
                </Typography>
                <Typography variant="body2" paragraph>
                  2. Scroll down and select <strong>"Add to Home Screen"</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  3. Tap <strong>"Add"</strong> to confirm
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                The ATSS app will appear on your home screen for quick access!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" paragraph>
                Install ATSS for a better experience:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Typography variant="body2">✓ Instant access from home screen</Typography>
                <Typography variant="body2">✓ Faster loading times</Typography>
                <Typography variant="body2">✓ Works offline</Typography>
                <Typography variant="body2">✓ Full-screen app experience</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button onClick={() => setShowDialog(false)} color="inherit">
            {isIOS ? 'Got it' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={5000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          icon={<CheckIcon />}
        >
          ATSS app installed successfully! 🎉
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAInstallButton;