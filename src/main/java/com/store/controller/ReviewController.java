package com.store.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.store.dto.ApiResponse;
import com.store.dto.ReviewDto;
import com.store.entity.Review;
import com.store.entity.Store;
import com.store.entity.User;
import com.store.repository.StoreRepository;
import com.store.repository.UserRepository;
import com.store.service.ReviewService;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
   private UserRepository userRepository;
    
   @Autowired
   private StoreRepository storeRepository;

    // @PostMapping
    // public ResponseEntity<Review> addReview(@RequestBody Review review){
    //    Review savedReview =reviewService.addReview(review);
    //    return new ResponseEntity<Review>(savedReview,HttpStatus.CREATED);
    // }

 @PostMapping
   public ResponseEntity<ApiResponse<Review>> addReview(@RequestBody ReviewDto dto){

      User user=userRepository.findById(dto.getUserId())
          .orElseThrow(()-> new RuntimeException("User not found"));
      
      Store store=storeRepository.findById(dto.getStoreId())
      .orElseThrow(()-> new RuntimeException("Store not found"));


    Review review = new Review();
    review.setRating(dto.getRating());
    review.setComment(dto.getComment());
    review.setUser(user);
    review.setStore(store);

    Review saved=reviewService.addReview(review);

    return ResponseEntity.status(HttpStatus.CREATED)
    .body(new ApiResponse<>("Review added",saved));

   }



   @GetMapping
   public ResponseEntity<ApiResponse<List<Review>>>getAllReviews(){
   
    List<Review> reviews=reviewService.getAllReviews();

    return ResponseEntity.ok(
        new ApiResponse<>("All reviews fetched", reviews)
    );

   }










   @GetMapping("/store/{storeId}")
public ResponseEntity<ApiResponse<List<Review>>> getReviews(@PathVariable Long storeId) {

    List<Review> reviews = reviewService.getReviewsByStore(storeId);

    if (reviews.isEmpty()) {
        return ResponseEntity.ok(
                new ApiResponse<>("No reviews found for this store", reviews)
        );
    }

    return ResponseEntity.ok(
            new ApiResponse<>("Reviews fetched successfully", reviews)
    );
}


    
}
