package com.nexhire.config;

import com.nexhire.security.CustomAccessDeniedHandler;
import com.nexhire.security.JwtAuthenticationEntryPoint;
import com.nexhire.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CorsConfig corsConfig;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/jobs/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/roles/**").hasRole("ADMIN")
                        .requestMatchers("/api/activity-logs/**").hasRole("ADMIN")
                        // Assets: managed by ADMIN, owning EMPLOYEE views own (method-level refines)
                        .requestMatchers("/api/assets/**").hasAnyRole("ADMIN", "EMPLOYEE")
                        // Projects: ADMIN does CRUD, RMG allocates trainees (method-level refines)
                        .requestMatchers("/api/projects/**").hasAnyRole("ADMIN", "RMG")
                        // Dashboard: computed metrics for management roles
                        .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "HR", "RMG")
                        // Notifications: any authenticated user
                        .requestMatchers("/api/notifications/**").authenticated()
                        // Training: HR manages, EMPLOYEE views own
                        .requestMatchers("/api/training/**").hasAnyRole("HR", "EMPLOYEE")
                        .requestMatchers("/api/locations/**").hasRole("HR")
                        .requestMatchers("/api/applications/**").hasAnyRole("HR", "EMPLOYEE")
                        .requestMatchers("/api/assessments/**").hasRole("HR")
                        .requestMatchers("/api/offers/**").hasAnyRole("HR", "EMPLOYEE")
                        .requestMatchers("/api/joining-letters/**").hasAnyRole("HR", "EMPLOYEE")
                        // BGV: HR manages, EMPLOYEE views own
                        .requestMatchers("/api/bgv/**").hasAnyRole("HR", "EMPLOYEE")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
