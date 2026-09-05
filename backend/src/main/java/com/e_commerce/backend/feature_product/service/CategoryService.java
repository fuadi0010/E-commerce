package com.e_commerce.backend.feature_product.service;

import com.e_commerce.backend.feature_product.model.CategoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryEntity createCategory(String name);
    List<CategoryEntity> getAllCategories();
    Page<CategoryEntity> getAllCategories(Pageable pageable);
    CategoryEntity getCategoryById(UUID id);
    CategoryEntity updateCategory(UUID id, String name);
    void deleteCategory(UUID id);
}
