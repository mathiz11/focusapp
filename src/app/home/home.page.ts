import { Component, OnInit, DoCheck } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, DoCheck {

  quotes: Array<string> = [
    `Le temps c’est de l’argent`,
    `L'homme qui travaille perd un temps précieux.`,
    `Ce n’est pas l’homme qui arrête le temps, c’est le temps qui arrête l’homme.`,
    `Le temps se fout du prix d'ma Rolex et mes souliers Fendi.`,
    `Je suis inarrêtable comme le temps qui défile.`,
  ];

  range: number;
  timeLeft: number;
  format: string;
  inProgress: boolean;
  imagePath: string;
  isBoy: boolean;
  alert: boolean;
  totalTime: number;

  constructor(
    private alertController: AlertController,
    public platform: Platform,
    private storage: Storage
  ) {
    this.platform.pause.subscribe(async () => {
      if(this.inProgress === true) {
        this.stop();
        this.alert = true;
      }
    });
    this.platform.resume.subscribe(async () => {
      if(this.alert === true) {
        this.alert = false;
        this.presentEchec();
      }
    });
  }

  ngOnInit() {
    this.range = 0;
    this.timeLeft = -1;
    this.inProgress = false;
    this.changeFormat(this.range);
    this.imagePath = 'assets/images/fetus.png';
    this.isBoy = false;
    this.alert = false;
    this.storage.get('totalTime').then((val) => {
      this.totalTime = val ? val : 0; 
    });
  }

  ngDoCheck() {
    if (this.timeLeft === 0) {
      this.presentAlert();
      this.setTotalTime(this.range);
      this.stop();
    }
    const deltaTime = this.range * 60 - this.timeLeft;
    if (deltaTime >= 0 && deltaTime <= 900) {
      this.imagePath = 'assets/images/fetus.png';
    } else if (deltaTime > 900 && deltaTime <= 1800) {
      this.imagePath = 'assets/images/baby.png';
    } else if (deltaTime > 1800 && deltaTime <= 2700) {
      this.imagePath = this.isBoy === true ? 'assets/images/boy.png' : 'assets/images/girl.png';
    } else if (deltaTime > 2700 && deltaTime <= 3600) {
      this.imagePath = this.isBoy === true ? 'assets/images/men.png' : 'assets/images/woman.png';
    } else if (deltaTime > 3600 && deltaTime <= 4500) {
      this.imagePath = this.isBoy === true ? 'assets/images/grandfa.png' : 'assets/images/grandma.png';
    } else {
      this.imagePath = 'assets/images/tombstone.png';
    }
  }

  async presentEchec() {
    const alert = await this.alertController.create({
      header: 'Échec',
      message: 'Vous avez tué ce que vous avez créé ...',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Bravo',
      message: this.quotes[Math.trunc(Math.random() * this.quotes.length)],
      buttons: ['OK']
    });
    await alert.present();
  }

  setTotalTime(val: number) {
    this.totalTime += val;
    this.storage.set('totalTime', this.totalTime);
  }

  start() {
    this.timeLeft = this.range * 60;
    this.inProgress = true;
    const timer = interval(1000).pipe(takeWhile(() => this.timeLeft >= 0 && this.inProgress));
    timer.subscribe(i => {
      this.changeFormat(--this.timeLeft);
    });
  }

  stop() {
    this.inProgress = false;
    this.changeFormat(this.range * 60);
    this.timeLeft = -1;
  }

  changeRange(event: CustomEvent) {
    this.range = event.detail.value;
    this.changeFormat(this.range * 60);
  }

  changeState() {
    if (this.inProgress) {
      this.stop();
    } else {
      this.start();
    }
  }

  changeFormat(time: number) {
    const seconds = time % 60;
    const minutes = Math.trunc(time / 60);
    this.format = minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
  }

}
