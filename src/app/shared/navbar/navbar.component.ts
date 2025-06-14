import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionService } from '../../service/section/section.service';
import { HamburgerMenuComponent } from '../hamburger-menu/hamburger-menu.component';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, HamburgerMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent {
  showBackButton = false;

  constructor(private sectionService: SectionService) {
    this.sectionService.currentSection$.subscribe(section => {
      this.showBackButton = section !== 'home';
    });
  }

  navigateAndClose(section: string, event: Event) {
    event.preventDefault();
    this.sectionService.setSection(section);
  }

}
