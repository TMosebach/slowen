import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kontorahmen',
  templateUrl: './kontorahmen.component.html',
  styleUrls: ['./kontorahmen.component.scss']
})
export class KontorahmenComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onNeu(): void {
    this.router.navigate(['verwaltung', 'kontorahmen', 'neu']);
  }
}
