package com.store.service.Impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.store.entity.User;
import com.store.repository.UserRepository;
import com.store.service.UserService;

@Service
public class UserServiceImpl implements UserService{
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public User register(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    

    @Override
    public User login(String email,String password){

       User user=userRepository.findByEmail(email)
       .orElseThrow(()->new RuntimeException("User not found"));
     
      if(!passwordEncoder.matches(password, user.getPassword())){
        throw new RuntimeException("Invalid password");
      }

       return user;
    }

    @Override
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

}
