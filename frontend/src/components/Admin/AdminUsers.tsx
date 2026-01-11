import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Stack,
  IconButton,
  Paper,
  alpha,
  Switch,
  Tooltip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Grid,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import type { User } from '../../types';

// Нейтральная цветовая палитра
const NEUTRAL_COLORS = {
  primary: '#2D3748',
  secondary: '#4A5568',
  accent: '#3182CE',
  background: '#F7FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  border: '#E2E8F0',
  success: '#38A169',
  warning: '#DD6B20',
  error: '#E53E3E',
  info: '#3182CE',
  purple: '#805AD5',
};

const ITEMS_PER_PAGE = 10;

const StyledButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  startIcon, 
  onClick,
  size = 'medium',
  disabled = false
}: any) => (
  <Button
    variant={variant}
    color={color}
    startIcon={startIcon}
    onClick={onClick}
    size={size}
    disabled={disabled}
    sx={{
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 2,
      px: variant === 'contained' ? 3 : 2,
      transition: 'all 0.2s ease',
      ...(variant === 'contained' && {
        background: `linear-gradient(135deg, ${NEUTRAL_COLORS.accent} 0%, ${alpha(NEUTRAL_COLORS.accent, 0.9)} 100%)`,
        boxShadow: '0 2px 8px rgba(49, 130, 206, 0.2)',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(49, 130, 206, 0.3)',
          transform: 'translateY(-1px)',
        }
      }),
      ...(variant === 'outlined' && {
        borderWidth: 1.5,
        borderColor: NEUTRAL_COLORS.border,
        color: NEUTRAL_COLORS.textPrimary,
        '&:hover': {
          borderColor: NEUTRAL_COLORS.accent,
          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
        }
      })
    }}
  >
    {children}
  </Button>
);

const StyledTableRow = ({ children, hover = true }: any) => (
  <TableRow
    sx={{
      '&:nth-of-type(even)': {
        backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
      },
      '&:hover': hover ? {
        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.04),
      } : {},
      transition: 'background-color 0.2s ease',
    }}
  >
    {children}
  </TableRow>
);

// Роли пользователя
const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: '',
    is_active: true,
    is_admin: false,
    last_login: '',
    role: 'user' as 'user' | 'admin',
    email_verified: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers(1, ITEMS_PER_PAGE, 'created_at', 'desc');
      setUsers(data.items);
      setError(null);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const formatDateTimeForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Формат для datetime-local input: YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
  };

  const parseDateTimeFromInput = (value: string): string | null => {
    if (!value) return null;
    return new Date(value).toISOString();
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.avatar_url || '',
        is_active: user.is_active,
        is_admin: user.is_admin,
        last_login: formatDateTimeForInput(user.last_login),
        role: user.role,
        email_verified: user.email_verified,
      });
    } else {
      setEditingUser(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        avatar_url: '',
        is_active: true,
        is_admin: false,
        last_login: '',
        role: 'user',
        email_verified: false,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.first_name.trim()) {
        setError('First name is required');
        return;
      }

      if (!formData.last_name.trim()) {
        setError('Last name is required');
        return;
      }

      if (!formData.email.trim()) {
        setError('Email is required');
        return;
      }

      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        avatar_url: formData.avatar_url || undefined,
        is_active: formData.is_active,
        is_admin: formData.is_admin,
        role: formData.role,
        email_verified: formData.email_verified,
      };

      // Добавляем last_login только если он указан
      if (formData.last_login) {
        updateData.last_login = parseDateTimeFromInput(formData.last_login);
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, updateData);
      }
      
      handleCloseDialog();
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setError(null);
        await userService.deleteUser(id);
        loadUsers();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete user');
      }
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(user.id));
      setError(null);

      await userService.toggleUserActive(user.id, !user.is_active);

      // Обновляем локальное состояние
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? { ...u, is_active: !u.is_active }
            : u
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user status');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 8 }}>
        <CircularProgress 
          size={48}
          sx={{ color: NEUTRAL_COLORS.accent }}
        />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: NEUTRAL_COLORS.textPrimary,
              mb: 0.5
            }}
          >
            Users Management
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: NEUTRAL_COLORS.textSecondary }}
          >
            Total: {users.length} users
          </Typography>
        </Box>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(NEUTRAL_COLORS.error, 0.2)}`,
            '& .MuiAlert-icon': {
              fontSize: 24
            }
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: `1px solid ${NEUTRAL_COLORS.border}`,
          overflow: 'hidden',
          backgroundColor: NEUTRAL_COLORS.surface,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <StyledTableRow hover={false}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  User
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Email & Verification
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Last Login
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Role
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Active
                </TableCell>
                <TableCell align="right" sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Actions
                </TableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <StyledTableRow key={user.id}>
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={user.avatar_url}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                          color: NEUTRAL_COLORS.accent,
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(user.first_name, user.last_name)}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 500,
                            color: NEUTRAL_COLORS.textPrimary
                          }}
                        >
                          {user.first_name} {user.last_name}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon sx={{ fontSize: 16, color: NEUTRAL_COLORS.textSecondary }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: NEUTRAL_COLORS.textSecondary,
                            fontFamily: '"Roboto Mono", monospace',
                            fontSize: '0.875rem'
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <VerifiedIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: user.email_verified 
                              ? NEUTRAL_COLORS.success 
                              : NEUTRAL_COLORS.textSecondary 
                          }} 
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: user.email_verified 
                              ? NEUTRAL_COLORS.success 
                              : NEUTRAL_COLORS.textSecondary,
                            fontWeight: user.email_verified ? 600 : 400,
                          }}
                        >
                          {user.email_verified ? 'Email Verified' : 'Email Not Verified'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarIcon sx={{ fontSize: 16, color: NEUTRAL_COLORS.textSecondary }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: NEUTRAL_COLORS.textSecondary,
                          fontSize: '0.875rem'
                        }}
                      >
                        {formatDate(user.last_login)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={user.is_admin ? <AdminIcon /> : <PersonIcon />}
                      label={user.role === 'admin' ? 'Admin' : 'User'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: user.role === 'admin' 
                          ? alpha(NEUTRAL_COLORS.warning, 0.1) 
                          : alpha(NEUTRAL_COLORS.info, 0.1),
                        color: user.role === 'admin' 
                          ? NEUTRAL_COLORS.warning 
                          : NEUTRAL_COLORS.info,
                        border: `1px solid ${user.role === 'admin' 
                          ? alpha(NEUTRAL_COLORS.warning, 0.3) 
                          : alpha(NEUTRAL_COLORS.info, 0.3)}`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={user.is_active ? <ActiveIcon /> : <InactiveIcon />}
                      label={user.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: user.is_active 
                          ? alpha(NEUTRAL_COLORS.success, 0.1) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.1),
                        color: user.is_active 
                          ? NEUTRAL_COLORS.success 
                          : NEUTRAL_COLORS.secondary,
                        border: `1px solid ${user.is_active 
                          ? alpha(NEUTRAL_COLORS.success, 0.3) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.3)}`,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Tooltip 
                      title={`Click to ${user.is_active ? 'deactivate' : 'activate'}`}
                      placement="top"
                    >
                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        {updatingIds.has(user.id) ? (
                          <CircularProgress 
                            size={24} 
                            sx={{ 
                              color: NEUTRAL_COLORS.accent,
                              mx: 1
                            }} 
                          />
                        ) : (
                          <Switch
                            checked={user.is_active}
                            onChange={() => handleToggleActive(user)}
                            color="success"
                            size="medium"
                            sx={{
                              '& .MuiSwitch-switchBase': {
                                color: NEUTRAL_COLORS.secondary,
                                '&.Mui-checked': {
                                  color: NEUTRAL_COLORS.success,
                                },
                                '&.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: NEUTRAL_COLORS.success,
                                },
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: NEUTRAL_COLORS.secondary,
                              },
                            }}
                          />
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(user)}
                          sx={{
                            color: NEUTRAL_COLORS.accent,
                            backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.2),
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(user.id)}
                          sx={{
                            color: NEUTRAL_COLORS.error,
                            backgroundColor: alpha(NEUTRAL_COLORS.error, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.error, 0.2),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {users.length === 0 && !isLoading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                mb: 2
              }}
            >
              No users found
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.textPrimary
        }}>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        
        <DialogContent dividers sx={{ py: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: NEUTRAL_COLORS.textPrimary,
                mb: 2
              }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: NEUTRAL_COLORS.accent,
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: NEUTRAL_COLORS.accent,
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: NEUTRAL_COLORS.accent,
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Avatar URL"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: NEUTRAL_COLORS.accent,
                        }
                      }
                    }}
                    helperText="URL to user's avatar image"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Status & Role */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: NEUTRAL_COLORS.textPrimary,
                mb: 2
              }}>
                Status & Permissions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={formData.role}
                      label="Role"
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        role: e.target.value as 'user' | 'admin',
                        is_admin: e.target.value === 'admin'
                      })}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      {USER_ROLES.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          color="success"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Active User
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.email_verified}
                          onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Email Verified
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_admin}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            is_admin: e.target.checked,
                            role: e.target.checked ? 'admin' : 'user'
                          })}
                          color="warning"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Is Administrator
                        </Typography>
                      }
                    />
                  </Stack>
                </Grid>
              </Grid>
            </Grid>

            {/* Last Login */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: NEUTRAL_COLORS.textPrimary,
                mb: 2
              }}>
                Last Login
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Last Login"
                type="datetime-local"
                value={formData.last_login}
                onChange={(e) => setFormData({ ...formData, last_login: e.target.value })}
                size="medium"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: NEUTRAL_COLORS.accent,
                    }
                  }
                }}
                helperText="Leave empty if user never logged in"
              />
            </Grid>

            {/* Admin Notes */}
            {editingUser && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  mb: 2
                }}>
                  Admin Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                    '& .MuiAlert-icon': {
                      color: NEUTRAL_COLORS.info,
                    }
                  }}
                >
                  <Typography variant="body2">
                    User ID: {editingUser.id}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Created: {formatDate(editingUser.created_at)}
                  </Typography>
                  {editingUser.updated_at && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Last Updated: {formatDate(editingUser.updated_at)}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${NEUTRAL_COLORS.border}`,
          pt: 2,
          px: 3,
          pb: 3
        }}>
          <StyledButton
            variant="outlined"
            onClick={handleCloseDialog}
          >
            Cancel
          </StyledButton>
          <StyledButton
            variant="contained"
            onClick={handleSave}
            disabled={!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};