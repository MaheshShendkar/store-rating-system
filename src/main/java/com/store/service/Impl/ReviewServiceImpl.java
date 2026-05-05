package com.store.service.Impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.store.entity.Review;
import com.store.repository.ReviewRepository;
import com.store.service.ReviewService;

@Service
public class ReviewServiceImpl implements ReviewService {

    
@Autowired
private ReviewRepository reviewRepository;

@Override
public Review addReview(Review review){
   return reviewRepository.save(review); 
}

@Override
public List<Review> getReviewsByStore(Long storeId){
    return reviewRepository.findByStoreId(storeId);
}


public List<Review> getAllReviews(){
    return reviewRepository.findAll();
}



}
