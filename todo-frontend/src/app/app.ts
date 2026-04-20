import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
 title = 'LalyaTasker';

 isLoggedIn = signal(false);
  isDarkMode: boolean | undefined;
sidenav: any;
toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark');
    } else {
      body.classList.remove('dark');
    }
  }
}

