package com.store.service.Impl;

import com.store.controller.AuthController;
import com.store.service.CustomUserDetailsService;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.store.entity.Store;
import com.store.entity.User;
import com.store.repository.StoreRepository;
import com.store.repository.UserRepository;
import com.store.service.StoreService;

@Service
public class StoreServiceImpl implements StoreService {

    private final CustomUserDetailsService customUserDetailsService;

    private final AuthController authController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    StoreRepository storeRepository;

    StoreServiceImpl(AuthController authController, CustomUserDetailsService customUserDetailsService) {
        this.authController = authController;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    public Store addStore(Store store) {

    Long ownerId = store.getOwner().getId();

    User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    store.setOwner(owner);

    return storeRepository.save(store);
}

    @Override
    public List<Store> getAllStores(){
        return storeRepository.findAll();
    }

    @Override
    public List<Store> getStoresByOwner(Long ownerId) {
    return storeRepository.findByOwnerId(ownerId);
}


    @Override
   public Store getStoreById(Long id){
         return storeRepository.findById(id)
         .orElseThrow(()-> new RuntimeException("Store not found"));
   }

   @Override
public Store updateStore(Long id, Store updatedStore, Long userId) {

    Store existing = getStoreById(id);

    if (!existing.getOwner().getId().equals(userId)) {
        throw new RuntimeException("You are not allowed to update this store");
    }

    existing.setName(updatedStore.getName());
    existing.setDescription(updatedStore.getDescription());
    existing.setLocation(updatedStore.getLocation());

    return storeRepository.save(existing);
}


//     delete store 

@Override
public void deleteStore(Long id, Long userId) {

    Store store = getStoreById(id);

    if (!store.getOwner().getId().equals(userId)) {
        throw new RuntimeException("You are not allowed to delete this store");
    }

    storeRepository.deleteById(id);
}


@Override
 public List<Store> searchStores(String name){
    return storeRepository.findByNameContainingIgnoreCase(name);
 }






    
}
