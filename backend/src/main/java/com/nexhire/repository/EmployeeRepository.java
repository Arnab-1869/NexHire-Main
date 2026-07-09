package com.nexhire.repository;

import com.nexhire.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByUserId(Long userId);
    Optional<Employee> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByApplicationId(Long applicationId);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(e.employeeId, 4) AS int)), 10000) FROM Employee e")
    Integer findMaxEmployeeIdNumeric();
}
