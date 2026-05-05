package com.store.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.store.security.JwtFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;


   @Bean
   public BCryptPasswordEncoder passwordEncoder(){
    return new BCryptPasswordEncoder();
   }




    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    http
        .cors(cors->cors.configure(http))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/stores/**").hasAnyRole("ADMIN","OWNER","USER")
            .requestMatchers(HttpMethod.GET, "/api/reviews/store/**").hasAnyRole("USER","ADMIN","OWNER")
            .requestMatchers(HttpMethod.GET, "/api/reviews").hasAnyRole("USER","ADMIN","OWNER")
            .requestMatchers("/api/reviews/**").hasAnyRole("USER","ADMIN")
            .requestMatchers("/api/users/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);


    return http.build();
}
}
