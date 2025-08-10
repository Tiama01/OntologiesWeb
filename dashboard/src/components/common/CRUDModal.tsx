import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Plus, Edit, Trash2, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'delete';
  entityType: string;
  entityName?: string;
  initialData?: any;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'textarea' | 'select';
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
  }>;
  onSubmit: (data: any) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function CRUDModal({
  isOpen,
  onClose,
  mode,
  entityType,
  entityName,
  initialData,
  fields,
  onSubmit,
  onDelete
}: CRUDModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(initialData);
    } else {
      // Réinitialiser le formulaire pour la création
      const newData: any = {};
      fields.forEach(field => {
        newData[field.name] = '';
      });
      setFormData(newData);
    }
    setErrors({});
  }, [initialData, mode, fields]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        newErrors[field.name] = `${field.label} est requis`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onSubmit(formData);
      toast.success(
        mode === 'create' 
          ? `${entityType} créé(e) avec succès` 
          : `${entityType} mis(e) à jour avec succès`
      );
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsLoading(true);
    try {
      await onDelete();
      toast.success(`${entityType} supprimé(e) avec succès`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return `Créer une nouvelle ${entityType}`;
      case 'edit':
        return `Modifier ${entityType}`;
      case 'delete':
        return `Supprimer ${entityType}`;
      default:
        return entityType;
    }
  };

  const getIcon = () => {
    switch (mode) {
      case 'create':
        return <Plus className="w-6 h-6 text-green-600" />;
      case 'edit':
        return <Edit className="w-6 h-6 text-blue-600" />;
      case 'delete':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const renderField = (field: any) => {
    const { name, label, type, required, options, placeholder } = field;
    const value = formData[name] || '';
    const error = errors[name];

    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
          />
        );

      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner...</option>
            {options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            name={name}
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      default:
        return (
          <input
            type="text"
            name={name}
            value={value}
            onChange={(e) => handleInputChange(name, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
    }
  };

  if (mode === 'delete') {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {getTitle()}
              </Dialog.Title>
            </div>
            
            <Dialog.Description className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer <strong>{entityName}</strong> ? 
              Cette action est irréversible.
            </Dialog.Description>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {getTitle()}
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {fields.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isLoading 
                    ? (mode === 'create' ? 'Création...' : 'Mise à jour...') 
                    : (mode === 'create' ? 'Créer' : 'Mettre à jour')
                  }
                </span>
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 