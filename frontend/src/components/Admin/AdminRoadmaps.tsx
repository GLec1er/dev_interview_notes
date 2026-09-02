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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Grid,
  Divider,
  Menu,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Visibility as ViewIcon,
  FolderOpen as ItemsIcon,
  Category as CategoryIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  Work as ProfessionIcon,
  Link as LinkIcon,
  Sort as SortIcon,
  Numbers as NumbersIcon,
} from '@mui/icons-material';
import { roadmapService } from '../../services/roadmapService';
import { categoryService } from '../../services/categoryService';
import type { RoadmapListResponse, RoadmapResponse } from '../../types';
import type { Category } from '../../types';

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

export const AdminRoadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<RoadmapListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<RoadmapListResponse | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    profession: '',
    description: '',
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [professions, setProfessions] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapListResponse | null>(null);

  const loadRoadmaps = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await roadmapService.getAllRoadmaps();
      setRoadmaps(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
      setError('Failed to load roadmaps. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  }, []);

  const loadProfessions = useCallback(async () => {
    try {
      const data = await roadmapService.getProfessions();
      setProfessions(data);
    } catch (err) {
      console.error('Failed to load professions:', err);
    }
  }, []);

  useEffect(() => {
    loadRoadmaps();
    loadCategories();
    loadProfessions();
  }, [loadRoadmaps, loadCategories, loadProfessions]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const generateSlug = (title: string, profession: string) => {
    const baseSlug = `${profession.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/\s+/g, '-')}`;
    return baseSlug.replace(/[^a-z0-9-]/g, '');
  };

  const handleOpenDialog = (roadmap?: RoadmapListResponse) => {
    if (roadmap) {
      setEditingRoadmap(roadmap);
      setFormData({
        title: roadmap.title,
        profession: roadmap.profession,
        description: roadmap.description || '',
        is_active: roadmap.is_active,
      });
    } else {
      setEditingRoadmap(null);
      setFormData({
        title: '',
        profession: '',
        description: '',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoadmap(null);
    setError(null);
  };

  // В handleSave замените комментарии на реальные вызовы:
  const handleSave = async () => {
    try {
      setError(null);

      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      if (!formData.profession.trim()) {
        setError('Profession is required');
        return;
      }

      const slug = editingRoadmap?.slug || generateSlug(formData.title, formData.profession);

      const roadmapData = {
        title: formData.title.trim(),
        profession: formData.profession.trim(),
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      };

      if (editingRoadmap) {
        await roadmapService.updateRoadmap(editingRoadmap.id, roadmapData);
      } else {
        await roadmapService.createRoadmap(roadmapData);
      }
      
      handleCloseDialog();
      loadRoadmaps();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save roadmap');
    }
  };

  // В handleDelete:
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      try {
        setError(null);
        await roadmapService.deleteRoadmap(id);
        loadRoadmaps();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete roadmap');
      }
    }
  };

  // В handleToggleActive:
  const handleToggleActive = async (roadmap: RoadmapListResponse) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(roadmap.id));
      setError(null);

      await roadmapService.updateRoadmap(roadmap.id, {
        is_active: !roadmap.is_active
      });

      // Обновляем локальное состояние
      setRoadmaps(prev =>
        prev.map(r =>
          r.id === roadmap.id
            ? { ...r, is_active: !r.is_active }
            : r
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update roadmap status');
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(roadmap.id);
        return newSet;
      });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, roadmap: RoadmapListResponse) => {
    setAnchorEl(event.currentTarget);
    setSelectedRoadmap(roadmap);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRoadmap(null);
  };

  const handleViewDetails = () => {
    if (selectedRoadmap) {
      // Переход на страницу деталей роадмапа
      window.open(`/roadmaps/${selectedRoadmap.slug}`, '_blank');
    }
    handleMenuClose();
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
            Roadmaps Management
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: NEUTRAL_COLORS.textSecondary }}
          >
            Total: {roadmaps.length} roadmaps
          </Typography>
        </Box>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Roadmap
        </StyledButton>
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

      {/* Roadmaps Table */}
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
                  py: 2,
                  width: '35%'
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TitleIcon fontSize="small" />
                    <span>Title & Description</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ProfessionIcon fontSize="small" />
                    <span>Profession</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <LinkIcon fontSize="small" />
                    <span>Slug</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <NumbersIcon fontSize="small" />
                    <span>Items</span>
                  </Stack>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SortIcon fontSize="small" />
                    <span>Created</span>
                  </Stack>
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
              {roadmaps.map((roadmap) => (
                <StyledTableRow key={roadmap.id}>
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="column" spacing={1}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          color: NEUTRAL_COLORS.textPrimary
                        }}
                      >
                        {roadmap.title}
                      </Typography>
                      {roadmap.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: NEUTRAL_COLORS.textSecondary,
                            fontSize: '0.875rem',
                            lineHeight: 1.4
                          }}
                        >
                          {roadmap.description.length > 100
                            ? `${roadmap.description.substring(0, 100)}...`
                            : roadmap.description}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={<ProfessionIcon />}
                      label={roadmap.profession}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        backgroundColor: alpha(NEUTRAL_COLORS.purple, 0.1),
                        color: NEUTRAL_COLORS.purple,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: NEUTRAL_COLORS.textSecondary,
                        fontFamily: '"Roboto Mono", monospace',
                        fontSize: '0.875rem'
                      }}
                    >
                      {roadmap.slug}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={<ItemsIcon />}
                      label={roadmap.items_count}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alpha(NEUTRAL_COLORS.info, 0.1),
                        color: NEUTRAL_COLORS.info,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: NEUTRAL_COLORS.textSecondary,
                        fontSize: '0.875rem'
                      }}
                    >
                      {formatDate(roadmap.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={roadmap.is_active ? <ActiveIcon /> : <InactiveIcon />}
                      label={roadmap.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: roadmap.is_active 
                          ? alpha(NEUTRAL_COLORS.success, 0.1) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.1),
                        color: roadmap.is_active 
                          ? NEUTRAL_COLORS.success 
                          : NEUTRAL_COLORS.secondary,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                    <Tooltip 
                      title={`Click to ${roadmap.is_active ? 'deactivate' : 'activate'}`}
                      placement="top"
                    >
                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        {updatingIds.has(roadmap.id) ? (
                          <CircularProgress 
                            size={24} 
                            sx={{ 
                              color: NEUTRAL_COLORS.accent,
                              mx: 1
                            }} 
                          />
                        ) : (
                          <Switch
                            checked={roadmap.is_active}
                            onChange={() => handleToggleActive(roadmap)}
                            color="success"
                            size="medium"
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
                          onClick={() => handleOpenDialog(roadmap)}
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
                      <Tooltip title="More options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, roadmap)}
                          sx={{
                            color: NEUTRAL_COLORS.textSecondary,
                            backgroundColor: alpha(NEUTRAL_COLORS.border, 0.5),
                            '&:hover': {
                              backgroundColor: alpha(NEUTRAL_COLORS.border, 0.8),
                            }
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {roadmaps.length === 0 && !isLoading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                mb: 2
              }}
            >
              No roadmaps found. Create your first roadmap!
            </Typography>
            <StyledButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create First Roadmap
            </StyledButton>
          </Box>
        )}
      </Paper>

      {/* Menu for More Options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
            minWidth: 200,
          }
        }}
      >
        <MuiMenuItem onClick={handleViewDetails}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <ViewIcon fontSize="small" />
            <Typography variant="body2">View Details</Typography>
          </Stack>
        </MuiMenuItem>
        <Divider />
        <MuiMenuItem 
          onClick={() => {
            if (selectedRoadmap) handleDelete(selectedRoadmap.id);
            handleMenuClose();
          }}
          sx={{ color: NEUTRAL_COLORS.error }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <DeleteIcon fontSize="small" />
            <Typography variant="body2">Delete</Typography>
          </Stack>
        </MuiMenuItem>
      </Menu>

      {/* Dialog for Create/Edit */}
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
          {editingRoadmap ? 'Edit Roadmap' : 'Create New Roadmap'}
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <FormControl fullWidth>
                    <InputLabel>Profession *</InputLabel>
                    <Select
                      value={formData.profession}
                      label="Profession *"
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    >
                      {professions.map((profession) => (
                        <MenuItem key={profession} value={profession}>
                          {profession}
                        </MenuItem>
                      ))}
                      <MenuItem value="">Custom profession...</MenuItem>
                    </Select>
                  </FormControl>
                  {!professions.includes(formData.profession) && formData.profession && (
                    <Alert 
                      severity="info" 
                      sx={{ mt: 1, borderRadius: 1 }}
                    >
                      Adding new profession: "{formData.profession}"
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={4}
                    size="medium"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: NEUTRAL_COLORS.accent,
                        }
                      }
                    }}
                    helperText="Optional description for the roadmap"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: NEUTRAL_COLORS.textPrimary,
                mb: 2
              }}>
                Status & Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />
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
                      Active Roadmap
                    </Typography>
                  }
                />
              </Stack>
            </Grid>

            {/* Preview */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 600, 
                color: NEUTRAL_COLORS.textPrimary,
                mb: 2
              }}>
                Preview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${NEUTRAL_COLORS.border}`,
                  backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {formData.title || 'Roadmap Title'}
                  </Typography>
                  {formData.profession && (
                    <Chip
                      label={formData.profession}
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  )}
                  {formData.description && (
                    <Typography variant="body2" color="textSecondary">
                      {formData.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="textSecondary">
                    Slug: {generateSlug(formData.title || 'title', formData.profession || 'profession')}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>

            {/* Admin Notes */}
            {editingRoadmap && (
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
                  }}
                >
                  <Typography variant="body2">
                    Roadmap ID: {editingRoadmap.id}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Created: {formatDate(editingRoadmap.created_at)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Last Updated: {formatDate(editingRoadmap.updated_at)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Current Slug: {editingRoadmap.slug}
                  </Typography>
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
            disabled={!formData.title.trim() || !formData.profession.trim()}
          >
            {editingRoadmap ? 'Update Roadmap' : 'Create Roadmap'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};