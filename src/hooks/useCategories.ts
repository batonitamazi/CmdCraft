// src/hooks/useCategories.ts
import { useState, useEffect } from 'react';
import { Category } from '../types';
import { storageService } from '../services/storageService';

export const useCategories = (initialCategories: { [key: string]: Category }) => {
  const [categories, setCategories] = useState<{ [key: string]: Category }>(initialCategories);
  const [editingCategory, setEditingCategory] = useState<
    { name: string; data: Category } | undefined
  >();

  useEffect(() => {
    const loadCategories = async () => {
      const customCats = await storageService.loadCustomCategories();
      if (customCats && Object.keys(customCats).length > 0) {
        setCategories(prev => ({ ...prev, ...customCats }));
      }
    };
    loadCategories();
  }, []);

  const saveCategory = async (categoryName: string, category: Category) => {
    setCategories(prev => ({
      ...prev,
      [categoryName]: category
    }));

    // Save only custom categories
    const customCats = Object.fromEntries(
      Object.entries({ ...categories, [categoryName]: category })
        .filter(([_, cat]) => cat.isCustom)
    );
    await storageService.saveCustomCategories(customCats);
    setEditingCategory(undefined);
  };

  const deleteCategory = async (categoryName: string) => {
    setCategories(prev => {
      const updated = { ...prev };
      delete updated[categoryName];
      return updated;
    });

    const customCats = Object.fromEntries(
      Object.entries(categories)
        .filter(([name, cat]) => cat.isCustom && name !== categoryName)
    );
    await storageService.saveCustomCategories(customCats);
  };

  return {
    categories,
    editingCategory,
    setEditingCategory,
    saveCategory,
    deleteCategory
  };
};