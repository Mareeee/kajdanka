package kajdanka.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "event_logs",
        indexes = {
                @Index(name = "idx_event_logs_song_type_time", columnList = "song_id,event_type,created_at"),
                @Index(name = "idx_event_logs_user_time", columnList = "user_id,created_at"),
                @Index(name = "idx_event_logs_anon_time", columnList = "anon_token,created_at")
        }
)
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "anon_token", length = 64)
    private String anonToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 20)
    private EventType eventType;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}