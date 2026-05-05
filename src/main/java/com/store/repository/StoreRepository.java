package com.store.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.store.entity.Store;

public interface StoreRepository extends JpaRepository<Store,Long> {
   
    List<Store> findByOwnerId(Long ownerId);
    List<Store> findByNameContainingIgnoreCase(String name);
    
}
