package com.store.controller;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.store.dto.ApiResponse;
import com.store.dto.StoreDto;
import com.store.entity.Store;
import com.store.entity.User;
import com.store.repository.UserRepository;
import com.store.service.StoreService;

@RestController
@RequestMapping("/api/stores")
public class StoreController {
    
private final AuthController authController;
@Autowired
private StoreService storeService;

@Autowired
private UserRepository userRepository;

StoreController(AuthController authController) {
    this.authController = authController;
}
 
// @PostMapping
// public ResponseEntity<Store> addStore(@RequestBody Store store){
//     Store stores=storeService.addStore(store);
//     return new ResponseEntity<Store>(stores,HttpStatus.CREATED);
// }

@PostMapping
public ResponseEntity<ApiResponse<Store>> addStore(@RequestBody StoreDto dto , Authentication authentication){

     User user=(User) authentication.getPrincipal();


    Store store = new Store();
    store.setName(dto.getName());
    store.setDescription(dto.getDescription());
    store.setLocation(dto.getLocation());
    store.setOwner(user);

    Store saved= storeService.addStore(store);

    return ResponseEntity.status(HttpStatus.CREATED)
          .body(new ApiResponse<>("Store added successfully", saved));


}









// @GetMapping
// public ResponseEntity<List<Store>> getAllStores(){
//    List<Store> stores= storeService.getAllStores();
//    return new ResponseEntity<List<Store>>(stores,HttpStatus.OK);
// } 

@GetMapping
public ResponseEntity<ApiResponse<List<Store>>> getAllStores(){
    List<Store> stores=storeService.getAllStores();

    return ResponseEntity.ok(
        new ApiResponse<>("Stores fetched sucessfully", stores)
    );
}


@GetMapping("/my-stores")
public ResponseEntity<ApiResponse<List<Store>>> getMyStores(Authentication auth){

   User user=(User) auth.getPrincipal();

   List<Store> stores= storeService.getStoresByOwner(user.getId());

   return ResponseEntity.ok(
        new ApiResponse<>("Your stores fetched",stores)
   );
}

@PutMapping("/{id}")
public ResponseEntity<ApiResponse<Store>> updateStore(
        @PathVariable Long id,
        @RequestBody StoreDto dto,
        Authentication auth) {

    User user = (User) auth.getPrincipal();

    Store updatedStore = new Store();
    updatedStore.setName(dto.getName());
    updatedStore.setDescription(dto.getDescription());
    updatedStore.setLocation(dto.getLocation());

    Store result = storeService.updateStore(id, updatedStore, user.getId());

    return ResponseEntity.ok(
            new ApiResponse<>("Store updated successfully", result)
    );
}

@DeleteMapping("/{id}")
public ResponseEntity<ApiResponse<String>> deleteStore(
        @PathVariable Long id,
        Authentication auth) {

    User user = (User) auth.getPrincipal();

    storeService.deleteStore(id, user.getId());

    return ResponseEntity.ok(
            new ApiResponse<>("Store deleted successfully", null)
    );
}


@GetMapping("/search")
public ResponseEntity<ApiResponse<List<Store>>> searchStores(@RequestParam   String name){


    List<Store> stores=storeService.searchStores(name);

    return ResponseEntity.ok(
        new ApiResponse<>("search results",stores)
    );
}







}




