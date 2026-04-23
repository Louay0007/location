import { Component } from '@angular/core';
import { HeroComponent } from '../features/landing/sections/hero.component';
import { FeaturesSectionComponent } from '../features/landing/sections/features-section.component';
import { CategoriesSectionComponent } from '../features/landing/sections/categories-section.component';
import { HowItWorksSectionComponent } from '../features/landing/sections/how-it-works-section.component';
import { FleetPreviewComponent } from '../features/landing/sections/fleet-preview.component';
import { TestimonialsComponent } from '../features/landing/sections/testimonials.component';
import { CtaSectionComponent } from '../features/landing/sections/cta-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesSectionComponent,
    CategoriesSectionComponent,
    FleetPreviewComponent,
    HowItWorksSectionComponent,
    TestimonialsComponent,
    CtaSectionComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {}
