package com.store.service;

import java.util.List;

import com.store.entity.User;

public interface UserService {
    
    User register(User user);
    User login(String email,String password);
    List<User> getAllUsers();
}
