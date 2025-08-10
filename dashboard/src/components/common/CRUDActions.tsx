import React from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

interface CRUDActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showAdd?: boolean;
  entityName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CRUDActions({
  onView,
  onEdit,
  onDelete,
  onAdd,
  showView = false,
  showEdit = true,
  showDelete = true,
  showAdd = false,
  entityName,
  size = 'md'
}: CRUDActionsProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-7 h-7';
      case 'lg':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 20;
      default:
        return 18;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {showAdd && onAdd && (
        <button
          onClick={onAdd}
          className={`${getSizeClasses()} bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center`}
          title={`Ajouter ${entityName || 'un élément'}`}
        >
          <Plus size={getIconSize()} />
        </button>
      )}
      
      {showView && onView && (
        <button
          onClick={onView}
          className={`${getSizeClasses()} bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center`}
          title={`Voir ${entityName || 'cet élément'}`}
        >
          <Eye size={getIconSize()} />
        </button>
      )}
      
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className={`${getSizeClasses()} bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center`}
          title={`Modifier ${entityName || 'cet élément'}`}
        >
          <Edit size={getIconSize()} />
        </button>
      )}
      
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className={`${getSizeClasses()} bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center`}
          title={`Supprimer ${entityName || 'cet élément'}`}
        >
          <Trash2 size={getIconSize()} />
        </button>
      )}
    </div>
  );
} 