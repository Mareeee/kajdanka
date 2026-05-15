package kajdanka.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import kajdanka.repository.UserRepository;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        log.info("Base initialized.");
    }
}