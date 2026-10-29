package com.doravia.service;

import com.doravia.model.City;
import com.doravia.model.Day;
import com.doravia.repository.DayRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DayService {

    private final DayRepository dayRepository;
    private final CityService cityService;

    public DayService(DayRepository dayRepository, CityService cityService) {
        this.dayRepository = dayRepository;
        this.cityService = cityService;
    }

    public List<Day> findByCityId(Long cityId) {
        return dayRepository.findByCityIdOrderByDisplayOrder(cityId);
    }

    public Day findById(Long id) {
        return dayRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    @Transactional(readOnly = true)
    public Day findByIdWithCity(Long id) {
        Day day = findById(id);
        day.getCity().getName();
        return day;
    }

    public Day create(Long cityId, String label, LocalDate date, String sunset) {
        City city = cityService.findById(cityId);
        int maxOrder = dayRepository.findByCityIdOrderByDisplayOrder(cityId).size();
        Day day = new Day(city, label, maxOrder);
        day.setDate(date);
        day.setSunset(sunset);
        return dayRepository.save(day);
    }

    public Day update(Long id, String label, LocalDate date, String sunset) {
        Day day = findById(id);
        day.setLabel(label);
        day.setDate(date);
        day.setSunset(sunset);
        return dayRepository.save(day);
    }

    public void delete(Long id) {
        dayRepository.deleteById(id);
    }

    public void reorder(Long cityId, List<Long> dayIds) {
        for (int i = 0; i < dayIds.size(); i++) {
            Day day = findById(dayIds.get(i));
            day.setDisplayOrder(i);
            dayRepository.save(day);
        }
    }
}
