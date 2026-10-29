package com.doravia.controller;

import com.doravia.dto.DayDTO;
import com.doravia.model.Day;
import com.doravia.service.DayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class DayController {

    private final DayService dayService;

    public DayController(DayService dayService) {
        this.dayService = dayService;
    }

    private DayDTO toDTO(Day day) {
        DayDTO dto = new DayDTO(day.getId(), day.getCity().getId(), day.getLabel(), day.getDisplayOrder());
        dto.setDate(day.getDate() != null ? day.getDate().toString() : null);
        dto.setSunset(day.getSunset());
        return dto;
    }

    @GetMapping("/api/days/{id}")
    public ResponseEntity<DayDTO> get(@PathVariable Long id) {
        Day day = dayService.findByIdWithCity(id);
        DayDTO dto = toDTO(day);
        dto.setCityName(day.getCity().getName());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/api/cities/{cityId}/days")
    public ResponseEntity<List<DayDTO>> listByCity(@PathVariable Long cityId) {
        List<DayDTO> days = dayService.findByCityId(cityId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(days);
    }

    @PostMapping("/api/cities/{cityId}/days")
    public ResponseEntity<DayDTO> create(@PathVariable Long cityId, @RequestBody Map<String, String> body) {
        LocalDate date = body.containsKey("date") && body.get("date") != null && !body.get("date").isEmpty()
                ? LocalDate.parse(body.get("date")) : null;
        String sunset = body.get("sunset");
        Day day = dayService.create(cityId, body.get("label"), date, sunset);
        return ResponseEntity.ok(toDTO(day));
    }

    @PutMapping("/api/days/{id}")
    public ResponseEntity<DayDTO> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LocalDate date = body.containsKey("date") && body.get("date") != null && !body.get("date").isEmpty()
                ? LocalDate.parse(body.get("date")) : null;
        String sunset = body.get("sunset");
        Day day = dayService.update(id, body.get("label"), date, sunset);
        return ResponseEntity.ok(toDTO(day));
    }

    @DeleteMapping("/api/days/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dayService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/cities/{cityId}/days/reorder")
    public ResponseEntity<Void> reorder(@PathVariable Long cityId, @RequestBody Map<String, List<Long>> body) {
        dayService.reorder(cityId, body.get("dayIds"));
        return ResponseEntity.ok().build();
    }
}
