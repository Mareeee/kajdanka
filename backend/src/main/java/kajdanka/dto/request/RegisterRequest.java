package kajdanka.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Username required")
        @Size(min = 3, max = 50, message = "Username must have 3-50 characters")
        String username,

        @NotBlank(message = "Email required")
        @Email(message = "Email not valid")
        String email,

        @NotBlank(message = "Password required")
        @Size(min = 6, message = "Password must have at least 6 characters")
        String password
) {}