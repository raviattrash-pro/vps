package com.visionpublicschool.controller;

import com.visionpublicschool.entity.Asset;
import com.visionpublicschool.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class AssetController {

    @Autowired
    private AssetRepository assetRepository;

    @GetMapping
    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    @PostMapping
    public Asset addAsset(@RequestBody Asset asset) {
        return assetRepository.save(asset);
    }

    @PutMapping("/{id}")
    public Asset updateAsset(@PathVariable Long id, @RequestBody Asset assetDetails) {
        Asset asset = assetRepository.findById(id).orElseThrow();
        asset.setItemName(assetDetails.getItemName());
        asset.setCategory(assetDetails.getCategory());
        asset.setQuantity(assetDetails.getQuantity());
        asset.setPurchaseDate(assetDetails.getPurchaseDate());
        asset.setStatus(assetDetails.getStatus());
        return assetRepository.save(asset);
    }

    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable Long id) {
        assetRepository.deleteById(id);
    }
}
