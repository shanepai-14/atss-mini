import React, { useState } from 'react'
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  Alert,
  Container,
  IconButton,
  InputAdornment,
  Button
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material'
import { authenticateUser } from '../api/auth'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      Username: '',
      Password: ''
    }
  })

  const onSubmit = async (credentials) => {
    setLoading(true)
    setError('')
   
    try {
      await authenticateUser(credentials)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}
            >
              <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box> */}
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Vehicle Queue For Drivers
            </Typography>
            {/* <Typography variant="body1" color="textSecondary">
              Sign in to access Vehicle Queue For Drivers
            </Typography> */}
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="Username"
                control={control}
                rules={{
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    fullWidth
                    variant="outlined"
                    error={!!errors.Username}
                    helperText={errors.Username?.message}
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                )}
              />

              <Controller
                name="Password"
                control={control}
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    error={!!errors.Password}
                    helperText={errors.Password?.message}
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            disabled={loading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                loading={loading}
                size="large"
                startIcon={!loading ? <LoginIcon /> : null}
                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Stack>
          </form>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
             Vehicle Queue For Drivers
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login