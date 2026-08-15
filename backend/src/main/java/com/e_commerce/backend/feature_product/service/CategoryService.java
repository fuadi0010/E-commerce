package com.e_commerce.backend.feature_product.service;

import com.e_commerce.backend.feature_product.model.CategoryEntity;
import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryEntity createCategory(String name);
    List<CategoryEntity> getAllCategories();
    CategoryEntity getCategoryById(UUID id);
}
