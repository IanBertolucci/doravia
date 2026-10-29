package com.doravia.controller;

import com.doravia.dto.ActivityDTO;
import com.doravia.dto.CityDTO;
import com.doravia.dto.DayDTO;
import com.doravia.model.Activity;
import com.doravia.model.City;
import com.doravia.model.Day;
import com.doravia.service.CityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    private final CityService cityService;

    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    @GetMapping
    public ResponseEntity<List<CityDTO>> list() {
        List<CityDTO> cities = cityService.findAll().stream()
                .map(c -> new CityDTO(c.getId(), c.getName(), c.getDisplayOrder()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(cities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CityDTO> get(@PathVariable Long id) {
        City city = cityService.findByIdWithDetails(id);

        CityDTO dto = new CityDTO(city.getId(), city.getName(), city.getDisplayOrder());

        List<DayDTO> dayDTOs = city.getDays().stream().map(day -> {
            DayDTO dayDTO = new DayDTO(day.getId(), day.getCity().getId(), day.getLabel(), day.getDisplayOrder());
            dayDTO.setDate(day.getDate() != null ? day.getDate().toString() : null);

            List<ActivityDTO> activityDTOs = day.getActivities().stream().map(act -> {
                ActivityDTO a = new ActivityDTO();
                a.setId(act.getId());
                a.setDayId(act.getDay().getId());
                a.setTimeSlot(act.getTimeSlot());
                a.setTitle(act.getTitle());
                a.setDescription(act.getDescription());
                a.setPrice(act.getPrice());
                a.setPurchased(act.getPurchased());
                a.setOpeningHours(act.getOpeningHours());
                a.setTransport(act.getTransport());
                a.setMapLink(act.getMapLink());
                a.setPhotoUrl(act.getPhotoUrl());
                a.setCuriosity(act.getCuriosity());
                a.setDisplayOrder(act.getDisplayOrder());
                return a;
            }).collect(Collectors.toList());

            dayDTO.setActivities(activityDTOs);
            return dayDTO;
        }).collect(Collectors.toList());

        dto.setDays(dayDTOs);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<CityDTO> create(@RequestBody Map<String, String> body) {
        City city = cityService.create(body.get("name"));
        return ResponseEntity.ok(new CityDTO(city.getId(), city.getName(), city.getDisplayOrder()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CityDTO> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        City city = cityService.update(id, body.get("name"));
        return ResponseEntity.ok(new CityDTO(city.getId(), city.getName(), city.getDisplayOrder()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody Map<String, List<Long>> body) {
        cityService.reorder(body.get("cityIds"));
        return ResponseEntity.ok().build();
    }
}
