package com.doravia.repository;

import com.doravia.model.Day;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DayRepository extends JpaRepository<Day, Long> {
    List<Day> findByCityIdOrderByDisplayOrder(Long cityId);
}
