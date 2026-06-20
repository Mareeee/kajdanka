import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef,
  Inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { SongService } from '../../core/services/song.service';
import { Song } from '../../core/models/song.model';
import { SongCardComponent } from '../../shared/components/song-card/song-card';
import { FooterComponent } from '../../shared/footer/footer';

const SLIDE_WIDTH = 300;
const SPEED = 0.6;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatIconModule, SongCardComponent, FooterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('contentSection') contentSection!: ElementRef;
  @ViewChild('marqueeInner') marqueeInner!: ElementRef;

  recommended: Song[] = [];
  displaySongs: Song[] = [];
  loading = true;

  private isBrowser: boolean;
  private animId: number | null = null;
  private offset = 0;
  private singleWidth = 0;
  private scrollStarted = false;

  constructor(
    private songService: SongService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.songService.getRecommended().subscribe({
      next: (results) => {
        console.log("preporučene: ", results)
        this.recommended = results;
        const copies = Math.max(4, Math.ceil((window?.innerWidth * 3 || 4000) / (results.length * SLIDE_WIDTH)));
        this.displaySongs = Array.from({ length: copies }, () => results).flat();
        this.singleWidth = results.length * SLIDE_WIDTH;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewChecked(): void {
    if (!this.isBrowser || this.scrollStarted || !this.marqueeInner?.nativeElement) return;
    if (this.displaySongs.length === 0) return;
    this.scrollStarted = true;
    this.startScroll();
  }

  private startScroll(): void {
    const el: HTMLElement = this.marqueeInner.nativeElement;

    const tick = () => {
      this.offset += SPEED;
      if (this.offset >= this.singleWidth) {
        this.offset -= this.singleWidth;
      }
      el.style.transform = `translateX(${-this.offset}px)`;
      this.animId = requestAnimationFrame(tick);
    };

    this.animId = requestAnimationFrame(tick);

    el.parentElement?.addEventListener('mouseenter', () => {
      if (this.animId !== null) { cancelAnimationFrame(this.animId); this.animId = null; }
    });
    el.parentElement?.addEventListener('mouseleave', () => {
      if (this.animId === null) this.animId = requestAnimationFrame(tick);
    });
  }

  scrollToCarousel(): void {
    if (this.isBrowser) {
      this.contentSection?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    if (this.animId !== null) cancelAnimationFrame(this.animId);
  }
}