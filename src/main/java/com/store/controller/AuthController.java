package com.store.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.store.dto.ApiResponse;
import com.store.dto.UserDto;
import com.store.entity.Role;
import com.store.entity.User;
import com.store.security.JwtUtil;
import com.store.service.UserService;

@RestController
@RequestMapping("/api/auth")    // based url 
public class AuthController {

    @Autowired
    private UserService userService;

   @Autowired
   private JwtUtil jwtUtil;


    // register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody UserDto dto){

    // User savedUser=userService.register(user);

    // return new ResponseEntity<User>(savedUser,HttpStatus.CREATED);

    User user=new User();
    user.setName(dto.getName());
    user.setEmail(dto.getEmail());
    user.setPassword(dto.getPassword());
    user.setRole(Role.valueOf(dto.getRole()));

    User savedUser=userService.register(user);

    return ResponseEntity.status(HttpStatus.CREATED)
    .body(new ApiResponse<>("User registered successfully",savedUser));



    }

    // login
//    @PostMapping("/login")
// public ResponseEntity<?> login(@RequestParam String email,
//                                @RequestParam String password) {
//     try {
//         User user = userService.login(email, password);
//         String token = jwtUtil.generateToken(user.getEmail());

//         return ResponseEntity.ok(token);
//     } catch (Exception e) {
//         return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                 .body(e.getMessage());
//     }
// }
    
  @PostMapping("/login")
public ResponseEntity<ApiResponse<String>> login(@RequestParam String email,
                                                 @RequestParam String password) {

    User user = userService.login(email, password);
    String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

    return ResponseEntity.ok(new ApiResponse<>("Login successful", token));
}

}
