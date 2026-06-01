package kajdanka.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateSetlistRequest(
        @NotBlank String name,
        String description
) {}