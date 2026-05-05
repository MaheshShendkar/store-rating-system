package com.store.service;

import java.util.List;

import com.store.entity.Review;

public interface ReviewService {
    Review addReview(Review review);
    List<Review> getReviewsByStore(Long storeId);
    List<Review> getAllReviews();
}
