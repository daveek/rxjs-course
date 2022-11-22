import { Store } from "./../common/store.service";
import { Component, OnInit } from "@angular/core";
import { Course } from "../model/course";
import { interval, noop, Observable, of, throwError, timer } from "rxjs";
import {
  catchError,
  delay,
  delayWhen,
  finalize,
  map,
  retryWhen,
  shareReplay,
  tap,
} from "rxjs/operators";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  beginnerCourses$: Observable<Course[]>;

  advancedCourses$: Observable<Course[]>;

  constructor(private store: Store) {}

  ngOnInit() {
    const courses$ = this.store.courses$; // Initialize the http streams

    this.beginnerCourses$ = this.store.selectBeginnerCourses();

    this.advancedCourses$ = this.store.selectAdvancedCourses();
  }
}
