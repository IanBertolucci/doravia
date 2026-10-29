package com.doravia.dto;

public class ContactDTO {
    private Long id;
    private String name;
    private String phone;
    private String relation;
    private int displayOrder;

    public ContactDTO() {}

    public ContactDTO(Long id, String name, String phone, String relation, int displayOrder) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.relation = relation;
        this.displayOrder = displayOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRelation() { return relation; }
    public void setRelation(String relation) { this.relation = relation; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
