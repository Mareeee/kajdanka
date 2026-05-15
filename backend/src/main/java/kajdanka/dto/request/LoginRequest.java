package kajdanka.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        @NotBlank(message = "Email required")
        @Email(message = "Email not valid")
        String email,

        @NotBlank(message = "Password required")
        String password
) {}