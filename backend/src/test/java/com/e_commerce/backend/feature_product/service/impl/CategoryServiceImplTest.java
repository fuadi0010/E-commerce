package com.e_commerce.backend.feature_product.service.impl;

import com.e_commerce.backend.exception.custom.ResourceNotFoundException;
import com.e_commerce.backend.feature_product.model.CategoryEntity;
import com.e_commerce.backend.feature_product.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryServiceImpl Tests")
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private UUID categoryId;
    private CategoryEntity activeCategory;
    private CategoryEntity hiddenCategory;

    @BeforeEach
    void setUp() {
        categoryId = UUID.randomUUID();
        activeCategory = CategoryEntity.builder()
                .id(categoryId)
                .name("Elektronik")
                .isActive(true)
                .build();

        hiddenCategory = CategoryEntity.builder()
                .id(UUID.randomUUID())
                .name("Arsip Kuno")
                .isActive(false)
                .build();
    }

    @Test
    @DisplayName("createCategory: sukses jika nama kategori unik")
    void createCategory_Success() {
        when(categoryRepository.findByName("Fashion")).thenReturn(Optional.empty());
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryEntity result = categoryService.createCategory("Fashion");

        assertNotNull(result);
        assertEquals("Fashion", result.getName());
        assertTrue(result.getIsActive());
        verify(categoryRepository).save(any(CategoryEntity.class));
    }

    @Test
    @DisplayName("createCategory: melempar IllegalArgumentException jika nama kategori sudah ada")
    void createCategory_ThrowsException_WhenNameExists() {
        when(categoryRepository.findByName("Elektronik")).thenReturn(Optional.of(activeCategory));

        assertThrows(IllegalArgumentException.class, () -> categoryService.createCategory("Elektronik"));
        verify(categoryRepository, never()).save(any(CategoryEntity.class));
    }

    @Test
    @DisplayName("getActiveCategories: mengembalikan hanya kategori yang aktif")
    void getActiveCategories_ReturnsOnlyActive() {
        when(categoryRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(activeCategory));

        List<CategoryEntity> results = categoryService.getActiveCategories();

        assertEquals(1, results.size());
        assertTrue(results.get(0).getIsActive());
        assertEquals("Elektronik", results.get(0).getName());
        verify(categoryRepository).findByIsActiveTrueOrderByNameAsc();
    }

    @Test
    @DisplayName("getAllCategories: mengembalikan semua kategori (aktif & hidden)")
    void getAllCategories_ReturnsAll() {
        when(categoryRepository.findAll()).thenReturn(List.of(activeCategory, hiddenCategory));

        List<CategoryEntity> results = categoryService.getAllCategories();

        assertEquals(2, results.size());
        verify(categoryRepository).findAll();
    }

    @Test
    @DisplayName("getAllCategories with Pageable: mengembalikan paged categories")
    void getAllCategories_Pageable_ReturnsPaged() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<CategoryEntity> page = new PageImpl<>(List.of(activeCategory, hiddenCategory), pageable, 2);
        when(categoryRepository.findAll(pageable)).thenReturn(page);

        Page<CategoryEntity> result = categoryService.getAllCategories(pageable);

        assertEquals(2, result.getTotalElements());
        verify(categoryRepository).findAll(pageable);
    }

    @Test
    @DisplayName("hideCategory: mengubah isActive menjadi false")
    void hideCategory_SetsIsActiveToFalse() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(activeCategory));
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryEntity result = categoryService.hideCategory(categoryId);

        assertFalse(result.getIsActive());
        verify(categoryRepository).save(activeCategory);
    }

    @Test
    @DisplayName("unhideCategory: mengubah isActive menjadi true")
    void unhideCategory_SetsIsActiveToTrue() {
        UUID hiddenId = hiddenCategory.getId();
        when(categoryRepository.findById(hiddenId)).thenReturn(Optional.of(hiddenCategory));
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryEntity result = categoryService.unhideCategory(hiddenId);

        assertTrue(result.getIsActive());
        verify(categoryRepository).save(hiddenCategory);
    }

    @Test
    @DisplayName("deleteCategory: mendelegasikan ke hideCategory secara soft")
    void deleteCategory_DelegatesToHideCategory() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(activeCategory));
        when(categoryRepository.save(any(CategoryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        categoryService.deleteCategory(categoryId);

        assertFalse(activeCategory.getIsActive());
        verify(categoryRepository, never()).delete(any());
        verify(categoryRepository).save(activeCategory);
    }

    @Test
    @DisplayName("getCategoryById: melempar ResourceNotFoundException jika ID tidak ditemukan")
    void getCategoryById_ThrowsNotFound_WhenIdNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(categoryRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategoryById(nonExistentId));
    }
}
