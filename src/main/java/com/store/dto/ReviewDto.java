package com.store.dto;

import lombok.Data;

@Data
public class ReviewDto {
    
    private int rating;
    private String comment;
    private Long userId;
    private Long storeId;




}
