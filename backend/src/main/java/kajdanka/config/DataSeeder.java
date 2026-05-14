package kajdanka.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import kajdanka.entity.*;
import kajdanka.repository.SongRepository;
import kajdanka.repository.UserRepository;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SongRepository songRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Base populated.");
            return;
        }

        User pera = userRepository.save(User.builder()
                .username("pera123")
                .email("pera@example.com")
                .passwordHash("$2a$10$placeholder")
                .role(Role.USER)
                .build());

        User mika = userRepository.save(User.builder()
                .username("mika_gitarista")
                .email("mika@example.com")
                .passwordHash("$2a$10$placeholder")
                .role(Role.PREMIUM)
                .isPremium(true)
                .build());

        songRepository.saveAll(List.of(

                Song.builder()
                        .title("Večernja pesma")
                        .artist("Demo Bend")
                        .genre("Rock")
                        .keySignature("Am")
                        .capo(0)
                        .user(pera)
                        .lyrics("""
                    [Am]Pada kiša [F]sa neba
                    [C]Večeras sam [G]sam
                    [Am]Misli moje [F]lete
                    [C]Daleko [G]od dom[Am]a

                    [Am]Ali znam da [F]sutra
                    [C]Sunce će [G]svanuti
                    [Am]I sve će biti [F]bolje
                    [C]Samo moram [G]da izdržim [Am]noć
                    """)
                        .build(),

                Song.builder()
                        .title("Plava reka")
                        .artist("Acoustic Duo")
                        .genre("Folk")
                        .keySignature("G")
                        .capo(2)
                        .user(mika)
                        .lyrics("""
                    [G]Kraj te reke plave [D]stajali smo mi
                    [Em]Tvoje oči sjajne [C]svetlele su mi
                    [G]Voda tekla mirno [D]vetar je šumio
                    [C]I svet bio lep [D]kada si mi ti [G]bila

                    [G]Plava reka teče [D]odnosi me sad
                    [Em]U nepoznate [C]daljine
                    [G]Ali uspomene [D]ostaju sa mnom
                    [C]Uvek i zauvek [D]moje [G]su
                    """)
                        .build(),

                Song.builder()
                        .title("Gradski bluz")
                        .artist("Noćni Ekspres")
                        .genre("Blues")
                        .keySignature("E")
                        .capo(0)
                        .user(pera)
                        .lyrics("""
                    [E7]Ujutru ustanem [A7]pogledam kroz prozor
                    [E7]Grad se budi polako [B7]ista priča opet
                    [A7]Trudim se svaki dan [E7]da nađem put
                    [B7]Ali bluz mi peva [E7]u grudima

                    [E7]Gradski bluz [A7]nije lak
                    [E7]Gradski bluz [B7]ali tak
                    [A7]Idem dalje [E7]kroz ovaj grad
                    [B7]Muzika je [E7]moj drug
                    """)
                        .build(),

                Song.builder()
                        .title("Prolećna melodija")
                        .artist("Tihi Akord")
                        .genre("Pop")
                        .keySignature("C")
                        .capo(0)
                        .user(mika)
                        .lyrics("""
                    [C]Proleće je stiglo [Am]u naš grad
                    [F]Cveće se probudi [G]posle zime hlad
                    [C]Ti si tu kraj mene [Am]sve je OK
                    [F]Ovaj dan je lep [G]baš kao i ti uvek

                    [C]La la la [Am]la la la
                    [F]Pevam ti pesmu [G]moju
                    [C]La la la [Am]la la la
                    [F]Sve je lepo [G]kada si [C]tu
                    """)
                        .build(),

                Song.builder()
                        .title("Jesenja tuga")
                        .artist("Solo Gitara")
                        .genre("Rock")
                        .keySignature("Dm")
                        .capo(0)
                        .user(pera)
                        .lyrics("""
                    [Dm]Lišće opada [Bb]po ulicama
                    [F]Jesen je stigla [C]bez najave
                    [Dm]Hodaš sama [Bb]kroz maglu
                    [F]I znaš da nema [C]povratka

                    [Gm]A ja gledam [Dm]za tobom
                    [Bb]Svaki korak [F]udaljava
                    [Gm]I srce mi [C]ćuti
                    [Dm]Ništa više [C]ne pita [Dm]
                    """)
                        .build(),

                Song.builder()
                        .title("Sunčani dan")
                        .artist("Veseli Akord")
                        .genre("Pop")
                        .keySignature("D")
                        .capo(2)
                        .user(mika)
                        .lyrics("""
                    [D]Probudih se jutros [A]rano
                    [Bm]Sunce greje [G]lepo
                    [D]Sve mi izgleda [A]sjajno
                    [G]Danas ću biti [A]srećan

                    [D]Sunčani dan [G]sunčani dan
                    [A]Sve mi se smeje [D]today
                    [D]Sunčani dan [G]sunčani dan
                    [A]Nema brige [D]sve je OK
                    """)
                        .build(),

                Song.builder()
                        .title("Zimska noć")
                        .artist("Acoustic Dreams")
                        .genre("Folk")
                        .keySignature("Em")
                        .capo(3)
                        .user(pera)
                        .lyrics("""
                    [Em]Sneg pada tiho [C]po prozoru mom
                    [G]Oganj gori [D]u kaminu
                    [Em]Sedim sam [C]i mislim
                    [G]Na tebe [D]večeras

                    [Am]Zimska noć je duga [Em]i hladna
                    [C]Ali topla misao [G]o tebi
                    [Am]Greje me [D]iznutra
                    [G]Sve dok [D]ne svaneš [Em]ti
                    """)
                        .build(),

                Song.builder()
                        .title("Rok pesma")
                        .artist("Električni Bend")
                        .genre("Rock")
                        .keySignature("A")
                        .capo(0)
                        .user(mika)
                        .lyrics("""
                    [A]Uzmi gitaru [E]udari akorde
                    [D]Neka muzika [A]puni prostoriju
                    [A]Vrisni malo [E]pusti sve iz sebe
                    [D]Rok muzika [E]leči dušu

                    [A]Rok n' rol [D]zauvek živi
                    [E]Rok n' rol [A]u našim srcima
                    [D]Nema kraja [A]nema mira
                    [E]Samo muzika [A]i mi
                    """)
                        .build()
        ));

        log.info("Demo podaci uspešno dodati: {} korisnika, {} pesama",
                userRepository.count(), songRepository.count());
    }
}
