package com.doravia.controller;

import com.doravia.dto.ActivityDTO;
import com.doravia.model.Activity;
import com.doravia.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/api/days/{dayId}/activities")
    public ResponseEntity<List<ActivityDTO>> listByDay(@PathVariable Long dayId) {
        List<ActivityDTO> activities = activityService.findByDayId(dayId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/api/activities/{id}")
    public ResponseEntity<ActivityDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(toDTO(activityService.findById(id)));
    }

    @PostMapping("/api/days/{dayId}/activities")
    public ResponseEntity<ActivityDTO> create(@PathVariable Long dayId, @RequestBody Activity activity) {
        return ResponseEntity.ok(toDTO(activityService.create(dayId, activity)));
    }

    @PutMapping("/api/activities/{id}")
    public ResponseEntity<ActivityDTO> update(@PathVariable Long id, @RequestBody Activity activity) {
        return ResponseEntity.ok(toDTO(activityService.update(id, activity)));
    }

    @DeleteMapping("/api/activities/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/days/{dayId}/activities/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long dayId, @RequestBody Map<String, List<Long>> body) {
        activityService.reorder(dayId, body.get("activityIds"));
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/api/activities/{id}/purchased")
    public ResponseEntity<Void> togglePurchased(@PathVariable Long id) {
        activityService.togglePurchased(id);
        return ResponseEntity.ok().build();
    }

    private ActivityDTO toDTO(Activity a) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(a.getId());
        dto.setDayId(a.getDay().getId());
        dto.setTimeSlot(a.getTimeSlot());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setPrice(a.getPrice());
        dto.setPurchased(a.getPurchased());
        dto.setOpeningHours(a.getOpeningHours());
        dto.setTransport(a.getTransport());
        dto.setMapLink(a.getMapLink());
        dto.setPhotoUrl(a.getPhotoUrl());
        dto.setCuriosity(a.getCuriosity());
        dto.setDisplayOrder(a.getDisplayOrder());
        return dto;
    }
}
