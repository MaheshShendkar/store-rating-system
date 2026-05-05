package com.store.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.store.dto.ApiResponse;
import com.store.entity.User;
import com.store.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
   @Autowired
    private UserService userService;

    
    // ADMIN only
   @GetMapping
   public ResponseEntity<ApiResponse<List<User>>> getAllUsers(){

    List<User> users= userService.getAllUsers();

    return ResponseEntity.ok(
        new  ApiResponse<>("Users fetch successfully",users)
    );
   }
}
