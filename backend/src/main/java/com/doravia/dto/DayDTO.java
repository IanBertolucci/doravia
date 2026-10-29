package com.doravia.dto;

import java.util.List;

public class DayDTO {
    private Long id;
    private Long cityId;
    private String cityName;
    private String label;
    private String date;
    private String sunset;
    private int displayOrder;
    private List<ActivityDTO> activities;

    public DayDTO() {}

    public DayDTO(Long id, Long cityId, String label, int displayOrder) {
        this.id = id;
        this.cityId = cityId;
        this.label = label;
        this.displayOrder = displayOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCityId() { return cityId; }
    public void setCityId(Long cityId) { this.cityId = cityId; }
    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getSunset() { return sunset; }
    public void setSunset(String sunset) { this.sunset = sunset; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    public List<ActivityDTO> getActivities() { return activities; }
    public void setActivities(List<ActivityDTO> activities) { this.activities = activities; }
}
