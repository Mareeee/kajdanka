import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef,
  Inject, PLATFORM_ID, NgZone
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { SongService } from '../../core/services/song.service';
import { Song } from '../../core/models/song.model';
import { SongCardComponent } from '../../shared/components/song-card/song-card';
import { FooterComponent } from '../../shared/footer/footer';
import { forkJoin } from 'rxjs';

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
  @ViewChild('marqueeInnerRec') marqueeInnerRec!: ElementRef;
  @ViewChild('marqueeInnerTrend') marqueeInnerTrend!: ElementRef;
  @ViewChild('marqueeInnerAllTime') marqueeInnerAllTime!: ElementRef;

  recommended: Song[] = [];
  trending: Song[] = [];
  allTimeTop: Song[] = [];

  displaySongs: Song[] = [];
  displayTrending: Song[] = [];
  displayAllTimeTop: Song[] = [];

  loading = true;

  private isBrowser: boolean;
  private animId: number | null = null;

  private offsetRec = 0;
  private offsetTrend = 0;
  private offsetAllTime = 0;

  private singleWidthRec = 0;
  private singleWidthTrend = 0;
  private singleWidthAllTime = 0;

  private scrollStarted = false;

  constructor(
    private songService: SongService,
    @Inject(PLATFORM_ID) platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    forkJoin({
      recommended: this.songService.getRecommended(),
      trending: this.songService.getTrending(),
      allTimeTop: this.songService.getAllTimeTop(),
    }).subscribe({
      next: (results) => {
        this.recommended = results.recommended;
        this.trending = results.trending;
        this.allTimeTop = results.allTimeTop;


        let windowWidth = 4000;
        if (this.isBrowser) {
          windowWidth = window?.innerWidth * 3 || 4000;
        }

        if (this.recommended.length > 0) {
          const copies = Math.max(4, Math.ceil(windowWidth / (this.recommended.length * SLIDE_WIDTH)));
          this.displaySongs = Array.from({ length: copies }, () => this.recommended).flat();
          this.singleWidthRec = this.recommended.length * SLIDE_WIDTH;
        }

        if (this.trending.length > 0) {
          const copies = Math.max(4, Math.ceil(windowWidth / (this.trending.length * SLIDE_WIDTH)));
          this.displayTrending = Array.from({ length: copies }, () => this.trending).flat();
          this.singleWidthTrend = this.trending.length * SLIDE_WIDTH;
        }

        if (this.allTimeTop.length > 0) {
          const copies = Math.max(4, Math.ceil(windowWidth / (this.allTimeTop.length * SLIDE_WIDTH)));
          this.displayAllTimeTop = Array.from({ length: copies }, () => this.allTimeTop).flat();
          this.singleWidthAllTime = this.allTimeTop.length * SLIDE_WIDTH;
        }

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  ngAfterViewChecked(): void {
    if (!this.isBrowser || this.scrollStarted) return;

    if (this.marqueeInnerRec?.nativeElement || this.marqueeInnerTrend?.nativeElement || this.marqueeInnerAllTime?.nativeElement) {
      this.scrollStarted = true;
      this.startScroll();
    }
  }

  private tick = () => {
    this.offsetRec += SPEED;
    const elRec = this.marqueeInnerRec?.nativeElement;
    if (elRec && this.singleWidthRec > 0) {
      elRec.style.transform = `translateX(${-(this.offsetRec % this.singleWidthRec)}px)`;
    }

    this.offsetTrend += SPEED;
    const elTrend = this.marqueeInnerTrend?.nativeElement;
    if (elTrend && this.singleWidthTrend > 0) {
      elTrend.style.transform = `translateX(${-this.singleWidthTrend + (this.offsetTrend % this.singleWidthTrend)}px)`;
    }

    this.offsetAllTime += SPEED;
    const elAllTime = this.marqueeInnerAllTime?.nativeElement;
    if (elAllTime && this.singleWidthAllTime > 0) {
      elAllTime.style.transform = `translateX(${-(this.offsetAllTime % this.singleWidthAllTime)}px)`;
    }

    this.animId = requestAnimationFrame(this.tick);
  };

  private startScroll(): void {
    this.ngZone.runOutsideAngular(() => {
      this.animId = requestAnimationFrame(this.tick);
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