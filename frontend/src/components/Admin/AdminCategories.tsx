import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  CheckCircle as ActiveIcon,
  RemoveCircle as InactiveIcon,
} from '@mui/icons-material';
import { categoryService } from '../../services/categoryService';
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
};

const ITEMS_PER_PAGE = 10;

const StyledButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  startIcon, 
  onClick,
  size = 'medium'
}: any) => (
  <Button
    variant={variant}
    color={color}
    startIcon={startIcon}
    onClick={onClick}
    size={size}
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

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await categoryService.getCategories(1, ITEMS_PER_PAGE);
      setCategories(data.items);
      setError(null);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        });
      } else {
        await categoryService.createCategory({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
        });
      }
      handleCloseDialog();
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        setError(null);
        await categoryService.deleteCategory(id);
        loadCategories();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to delete category');
      }
    }
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
            Categories Management
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ color: NEUTRAL_COLORS.textSecondary }}
          >
            Total: {categories.length} categories
          </Typography>
        </Box>
        <StyledButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
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

      {/* Categories Table */}
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
                  Name
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Slug
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Description
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: NEUTRAL_COLORS.textPrimary,
                  borderBottom: `2px solid ${NEUTRAL_COLORS.border}`,
                  py: 2
                }}>
                  Status
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
              {categories.map((category) => (
                <StyledTableRow key={category.id}>
                  <TableCell sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ 
                        p: 1,
                        borderRadius: '50%',
                        backgroundColor: alpha(NEUTRAL_COLORS.accent, 0.1),
                        color: NEUTRAL_COLORS.accent,
                      }}>
                        <CategoryIcon fontSize="small" />
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          color: NEUTRAL_COLORS.textPrimary
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Stack>
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
                      {category.slug}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: NEUTRAL_COLORS.textSecondary,
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {category.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      icon={category.is_active ? <ActiveIcon /> : <InactiveIcon />}
                      label={category.is_active ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: category.is_active 
                          ? alpha(NEUTRAL_COLORS.success, 0.1) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.1),
                        color: category.is_active 
                          ? NEUTRAL_COLORS.success 
                          : NEUTRAL_COLORS.secondary,
                        border: `1px solid ${category.is_active 
                          ? alpha(NEUTRAL_COLORS.success, 0.3) 
                          : alpha(NEUTRAL_COLORS.secondary, 0.3)}`,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(category)}
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
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category.id)}
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
                    </Stack>
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {categories.length === 0 && !isLoading && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box sx={{ 
              p: 2,
              borderRadius: '50%',
              backgroundColor: alpha(NEUTRAL_COLORS.background, 0.5),
              display: 'inline-flex',
              mb: 2
            }}>
              <CategoryIcon sx={{ fontSize: 48, color: NEUTRAL_COLORS.textSecondary }} />
            </Box>
            <Typography 
              variant="body1" 
              sx={{ 
                color: NEUTRAL_COLORS.textSecondary,
                mb: 2
              }}
            >
              No categories found
            </Typography>
            <StyledButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Create Your First Category
            </StyledButton>
          </Box>
        )}
      </Paper>

      {/* Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `1px solid ${NEUTRAL_COLORS.border}`,
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${NEUTRAL_COLORS.border}`,
          pb: 2,
          fontWeight: 700,
          color: NEUTRAL_COLORS.surface
        }}>
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: NEUTRAL_COLORS.accent,
                  },
                }
              }}
            />
            <TextField
              fullWidth
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              size="medium"
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: NEUTRAL_COLORS.accent,
                  }
                }
              }}
            />
          </Stack>
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
          >
            {editingCategory ? 'Update' : 'Create'}
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};