package com.doravia.service;

import com.doravia.model.Activity;
import com.doravia.model.Day;
import com.doravia.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final DayService dayService;

    public ActivityService(ActivityRepository activityRepository, DayService dayService) {
        this.activityRepository = activityRepository;
        this.dayService = dayService;
    }

    public List<Activity> findByDayId(Long dayId) {
        return activityRepository.findByDayIdOrderByDisplayOrder(dayId);
    }

    public Activity findById(Long id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public Activity create(Long dayId, Activity activity) {
        Day day = dayService.findById(dayId);
        activity.setDay(day);
        activity.setDisplayOrder(activityRepository.findByDayIdOrderByDisplayOrder(dayId).size());
        return activityRepository.save(activity);
    }

    public Activity update(Long id, Activity updated) {
        Activity activity = findById(id);
        activity.setTimeSlot(updated.getTimeSlot());
        activity.setTitle(updated.getTitle());
        activity.setDescription(updated.getDescription());
        activity.setPrice(updated.getPrice());
        activity.setPurchased(updated.getPurchased());
        activity.setOpeningHours(updated.getOpeningHours());
        activity.setTransport(updated.getTransport());
        activity.setMapLink(updated.getMapLink());
        activity.setPhotoUrl(updated.getPhotoUrl());
        activity.setCuriosity(updated.getCuriosity());
        return activityRepository.save(activity);
    }

    public void delete(Long id) {
        activityRepository.deleteById(id);
    }

    public void reorder(Long dayId, List<Long> activityIds) {
        for (int i = 0; i < activityIds.size(); i++) {
            Activity activity = findById(activityIds.get(i));
            activity.setDisplayOrder(i);
            activityRepository.save(activity);
        }
    }

    public void togglePurchased(Long id) {
        Activity activity = findById(id);
        activity.setPurchased(!Boolean.TRUE.equals(activity.getPurchased()));
        activityRepository.save(activity);
    }
}
