package com.e_commerce.backend.feature_product.mapper;

import com.e_commerce.backend.feature_product.dto.response.CategoryResponse;
import com.e_commerce.backend.feature_product.dto.response.ProductResponse;
import com.e_commerce.backend.feature_product.model.CategoryEntity;
import com.e_commerce.backend.feature_product.model.ProductEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper untuk entitas Product dan Category.
 * Rule 29: Mapping dilakukan di layer mapper, bukan di Controller.
 */
@Component
public class ProductMapper {

    public ProductResponse toResponse(ProductEntity entity) {
        if (entity == null) return null;
        return ProductResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .stock(entity.getStock())
                .imageUrl(entity.getImageUrl())
                .category(toCategoryResponse(entity.getCategory()))
                .build();
    }

    public CategoryResponse toCategoryResponse(CategoryEntity entity) {
        if (entity == null) return null;
        return CategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .isActive(entity.getIsActive())
                .build();
    }
}
