import { Component } from '@angular/core';
import { RevealOnScroll } from '../shared/reveal-on-scroll.directive';

interface MapShape {
  id: string;
  path: string;
}

interface MapRoute extends MapShape {
  secondary?: boolean;
}

interface MapCity {
  id: string;
  index: string;
  name: string;
  displayName?: string;
  country: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  labelAlign?: 'end';
  home?: boolean;
  secondary?: boolean;
}

@Component({
  imports: [RevealOnScroll],
  selector: 'app-world-journey',
  styleUrl: './world-journey.scss',
  templateUrl: './world-journey.html',
})
export class WorldJourney {
  protected readonly continents: MapShape[] = [
    {
      id: 'eurasia',
      path: 'M520 180C550 135 610 105 675 112C720 118 745 98 790 105C835 88 900 95 940 112C990 105 1055 125 1090 155C1125 184 1134 218 1105 242C1080 264 1065 291 1045 322C1018 347 980 342 950 315C918 298 890 325 858 314C825 300 805 272 770 276C730 283 705 252 670 250C630 250 610 222 580 218C548 214 520 207 520 180Z',
    },
    {
      id: 'africa',
      path: 'M680 252C725 248 785 267 814 304C837 343 817 405 785 456C760 493 735 520 708 486C682 454 690 405 668 370C644 332 642 284 680 252Z',
    },
    {
      id: 'north-america',
      path: 'M1128 164C1160 118 1214 84 1285 80C1340 78 1402 107 1430 151C1450 188 1420 225 1378 236C1342 248 1329 286 1280 297C1235 306 1198 276 1174 248C1142 232 1100 202 1128 164Z',
    },
    {
      id: 'south-america',
      path: 'M1270 319C1312 302 1360 322 1389 359C1412 397 1390 447 1368 492C1349 530 1323 568 1294 548C1268 526 1264 478 1248 441C1232 400 1235 344 1270 319Z',
    },
    {
      id: 'australia',
      path: 'M1035 420C1072 394 1122 389 1168 410C1202 431 1213 466 1184 492C1154 516 1104 520 1060 498C1028 482 1007 449 1035 420Z',
    },
  ];

  protected readonly routes: MapRoute[] = [
    { id: 'machu-picchu', path: 'M1000 300Q1145 340 1260 410' },
    { id: 'london', path: 'M1000 300Q870 120 720 160' },
    { id: 'san-francisco', path: 'M1000 300Q1090 205 1170 250' },
    { id: 'zhangye', path: 'M1000 300Q980 278 960 260', secondary: true },
    { id: 'toronto', path: 'M1000 300Q1110 125 1270 170' },
    { id: 'paris', path: 'M1000 300Q890 190 780 215' },
    { id: 'melbourne', path: 'M1000 300Q1080 380 1100 475' },
  ];

  protected readonly cities: MapCity[] = [
    {
      id: 'xian',
      index: '00',
      name: "XI'AN",
      displayName: "XI'AN · CHINA",
      country: 'YOU ARE HERE',
      x: 1000,
      y: 300,
      labelX: 1022,
      labelY: 284,
      home: true,
    },
    {
      id: 'machu-picchu',
      index: '01',
      name: 'Machu Picchu',
      displayName: 'MACHU PICCHU',
      country: 'PERU',
      x: 1260,
      y: 410,
      labelX: 1244,
      labelY: 394,
      labelAlign: 'end',
    },
    {
      id: 'london',
      index: '02',
      name: 'London',
      displayName: 'LONDON',
      country: 'UNITED KINGDOM',
      x: 720,
      y: 160,
      labelX: 736,
      labelY: 144,
    },
    {
      id: 'san-francisco',
      index: '03',
      name: 'San Francisco',
      displayName: 'SAN FRANCISCO',
      country: 'UNITED STATES',
      x: 1170,
      y: 250,
      labelX: 1154,
      labelY: 234,
      labelAlign: 'end',
    },
    {
      id: 'zhangye',
      index: '04',
      name: 'Zhangye',
      displayName: 'ZHANGYE',
      country: 'CHINA',
      x: 960,
      y: 260,
      labelX: 944,
      labelY: 243,
      labelAlign: 'end',
      secondary: true,
    },
    {
      id: 'toronto',
      index: '05',
      name: 'Toronto',
      displayName: 'TORONTO',
      country: 'CANADA',
      x: 1270,
      y: 170,
      labelX: 1254,
      labelY: 154,
      labelAlign: 'end',
    },
    {
      id: 'paris',
      index: '06',
      name: 'Paris',
      displayName: 'PARIS',
      country: 'FRANCE',
      x: 780,
      y: 215,
      labelX: 796,
      labelY: 238,
    },
    {
      id: 'melbourne',
      index: '07',
      name: 'Melbourne',
      displayName: 'MELBOURNE',
      country: 'AUSTRALIA',
      x: 1100,
      y: 475,
      labelX: 1084,
      labelY: 498,
      labelAlign: 'end',
    },
  ];

  protected readonly destinations = this.cities.filter((city) => !city.home);

  protected cityClass(city: MapCity): string {
    return [
      'location',
      city.home ? 'location--home' : `location--${city.index.replace(/^0/, '')}`,
      city.secondary ? 'location--secondary' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected cityAriaLabel(city: MapCity): string {
    return city.home
      ? "Xi'an, China. You are here."
      : `${this.titleCase(city.name)}, ${this.titleCase(city.country)}.`;
  }

  private titleCase(value: string): string {
    return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
