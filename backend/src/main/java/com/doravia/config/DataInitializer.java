package com.doravia.config;

import com.doravia.model.Contact;
import com.doravia.model.User;
import com.doravia.repository.ContactRepository;
import com.doravia.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ContactRepository contactRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String seedUsername = System.getenv("SEED_USERNAME");
        String seedPassword = System.getenv("SEED_PASSWORD");

        if (userRepository.count() == 0
                && seedUsername != null && !seedUsername.isBlank()
                && seedPassword != null && !seedPassword.isBlank()) {
            userRepository.save(new User(seedUsername, passwordEncoder.encode(seedPassword), "Viajante", "2024-01-01T00:00:00"));
        }

        if (contactRepository.count() == 0) {
            contactRepository.save(new Contact("Emergência", "112", "Polícia / Ambulância / Bombeiros", 0));
            contactRepository.save(new Contact("Polícia", "113", "Polícia", 1));
            contactRepository.save(new Contact("Ambulância", "118", "Emergência médica", 2));
            contactRepository.save(new Contact("Bombeiros", "115", "Corpo de bombeiros", 3));
            contactRepository.save(new Contact("Pronto-Socorro", "116117", "Atendimento médico não emergencial", 4));
            contactRepository.save(new Contact("Emb. Brasil Roma", "+39 063 225 410", "Embaixada do Brasil em Roma", 5));
            contactRepository.save(new Contact("Consulado SP/ RJ", "+39 023 052 6000", "Consulado em Milão", 6));
        }
    }
}
