package com.doravia.controller;

import com.doravia.model.Activity;
import com.doravia.model.City;
import com.doravia.model.Day;
import com.doravia.repository.CityRepository;
import com.doravia.repository.DayRepository;
import com.doravia.repository.ActivityRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final CityRepository cityRepository;
    private final DayRepository dayRepository;
    private final ActivityRepository activityRepository;

    public ImportController(CityRepository cityRepository,
                            DayRepository dayRepository,
                            ActivityRepository activityRepository) {
        this.cityRepository = cityRepository;
        this.dayRepository = dayRepository;
        this.activityRepository = activityRepository;
    }

    @PostMapping("/csv")
    public ResponseEntity<Map<String, Integer>> importCsv(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder raw = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                raw.append(line).append("\n");
            }

            List<String> records = splitCsvRecords(raw.toString());

            Map<String, City> cityMap = new LinkedHashMap<>();
            Map<String, Day> dayMap = new LinkedHashMap<>();
            List<Activity> activities = new ArrayList<>();

            String currentCityName = "";
            String currentDayLabel = "";

            for (String record : records) {
                String[] cols = parseCsvLine(record);
                if (cols.length < 13) continue;

                String cityName = cols[1].trim();
                String dayLabel = cols[2].trim();
                if (cityName.equals("Local") && dayLabel.equals("Dia")) continue;

                if (!cityName.isEmpty()) currentCityName = cityName;
                if (!dayLabel.isEmpty()) currentDayLabel = dayLabel;

                if (currentCityName.isEmpty() || currentDayLabel.isEmpty()) continue;

                String timeSlot = cols[3].trim();
                String title = cols[4].trim();
                String description = cols[5].trim();
                String price = cols[6].trim();
                String purchasedStr = cols[7].trim();
                String openingHours = cols[8].trim();
                String transport = cols[9].trim();
                String mapLink = cols[10].trim();
                String photoUrl = cols[11].trim();
                String curiosity = cols[12].trim();

                if (title.isEmpty()) continue;

                City existingCity = cityMap.get(currentCityName);
                if (existingCity == null) {
                    existingCity = cityRepository.save(new City(currentCityName, cityMap.size()));
                    cityMap.put(currentCityName, existingCity);
                }
                final City finalCity = existingCity;

                String dayKey = currentCityName + "::" + currentDayLabel;
                Day day = dayMap.get(dayKey);
                if (day == null) {
                    long dayCount = dayMap.values().stream()
                            .filter(d -> d.getCity().getId().equals(finalCity.getId()))
                            .count();
                    day = dayRepository.save(new Day(finalCity, currentDayLabel, (int) dayCount));
                    dayMap.put(dayKey, day);
                }

                Activity activity = new Activity();
                activity.setDay(day);
                activity.setTimeSlot(timeSlot);
                activity.setTitle(title);
                activity.setDescription(description);
                activity.setPrice(price);
                activity.setPurchased("TRUE".equalsIgnoreCase(purchasedStr));
                activity.setOpeningHours(openingHours);
                activity.setTransport(transport);
                activity.setMapLink(mapLink);
                activity.setPhotoUrl(photoUrl);
                activity.setCuriosity(curiosity);
                activity.setDisplayOrder(activities.size());
                activities.add(activity);
            }

            activityRepository.saveAll(activities);

            Map<String, Integer> result = new HashMap<>();
            result.put("cities", cityMap.size());
            result.put("days", dayMap.size());
            result.put("activities", activities.size());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private List<String> splitCsvRecords(String content) {
        List<String> records = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
                current.append(c);
            } else if ((c == '\n' || c == '\r') && !inQuotes) {
                if (current.length() > 0) {
                    String record = current.toString().trim();
                    if (c == '\r' && i + 1 < content.length() && content.charAt(i + 1) == '\n') {
                        i++;
                    }
                    if (!record.isEmpty()) {
                        records.add(record);
                    }
                    current = new StringBuilder();
                }
            } else {
                current.append(c);
            }
        }

        if (current.length() > 0) {
            records.add(current.toString().trim());
        }

        return records;
    }

    private String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                fields.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        fields.add(current.toString());

        String[] result = new String[13];
        for (int i = 0; i < 13; i++) {
            result[i] = i < fields.size() ? fields.get(i) : "";
        }
        return result;
    }
}
