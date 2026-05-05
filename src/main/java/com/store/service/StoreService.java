package com.store.service;

import java.util.List;

import com.store.entity.Store;

public interface StoreService {
    Store addStore(Store store);
    List<Store>getAllStores();
    List<Store>getStoresByOwner(Long ownerId);
    Store getStoreById(Long id);
    Store updateStore(Long id, Store updateStore, Long userId);
    void deleteStore(Long id,Long userId); 
    List<Store> searchStores(String name);
}
