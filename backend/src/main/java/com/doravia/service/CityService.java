package com.doravia.service;

import com.doravia.model.City;
import com.doravia.repository.CityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CityService {

    private final CityRepository cityRepository;

    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    public List<City> findAll() {
        return cityRepository.findAllByOrderByDisplayOrder();
    }

    public City findById(Long id) {
        return cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    @Transactional(readOnly = true)
    public City findByIdWithDetails(Long id) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        city.getDays().size();
        city.getDays().forEach(day -> day.getActivities().size());
        return city;
    }

    public City create(String name) {
        int maxOrder = cityRepository.findAll().size();
        City city = new City(name, maxOrder);
        return cityRepository.save(city);
    }

    public City update(Long id, String name) {
        City city = findById(id);
        city.setName(name);
        return cityRepository.save(city);
    }

    public void delete(Long id) {
        cityRepository.deleteById(id);
    }

    public void reorder(List<Long> cityIds) {
        for (int i = 0; i < cityIds.size(); i++) {
            City city = findById(cityIds.get(i));
            city.setDisplayOrder(i);
            cityRepository.save(city);
        }
    }
}
