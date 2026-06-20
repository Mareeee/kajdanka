import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [CommonModule],
})
export class FooterComponent {
  year = new Date().getFullYear();
}