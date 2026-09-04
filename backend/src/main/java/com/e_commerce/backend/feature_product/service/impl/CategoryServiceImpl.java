package com.e_commerce.backend.feature_product.service.impl;

import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_product.model.CategoryEntity;
import com.e_commerce.backend.feature_product.repository.CategoryRepository;
import com.e_commerce.backend.feature_product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryEntity createCategory(String name) {
        if (categoryRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Kategori dengan nama '" + name + "' sudah ada!");
        }
        CategoryEntity category = new CategoryEntity();
        category.setName(name);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryEntity> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryEntity getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategori dengan ID " + id + " tidak ditemukan"));
    }

    @Override
    @Transactional
    public CategoryEntity updateCategory(UUID id, String name) {
        CategoryEntity category = getCategoryById(id);
        // Cek apakah nama baru sudah digunakan kategori lain
        categoryRepository.findByName(name).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Kategori dengan nama '" + name + "' sudah ada!");
            }
        });
        category.setName(name);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        CategoryEntity category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
