package kajdanka.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "song_requests")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "song_title", nullable = false)
    private String songTitle;

    private String artist;

    @Builder.Default
    private int votes = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public enum RequestStatus {
        PENDING, FULFILLED, REJECTED
    }
}
