import { Course } from "./../model/course";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject, timer } from "rxjs";
import { createHttpObservable } from "./util";
import {
  delayWhen,
  filter,
  map,
  retryWhen,
  shareReplay,
  tap,
} from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";

@Injectable({ providedIn: "root" })
export class Store {
  private subject = new BehaviorSubject<Course[]>([]);

  courses$: Observable<Course[]> = this.subject.asObservable();

  public _init() {
    const http$ = createHttpObservable("/api/courses");

    // const courses$: Observable<Course[]> =
    http$
      .pipe(
        tap(() => console.log("HTTP request executed")),
        map((res) => Object.values(res["payload"]))
        //   shareReplay(),
        //   retryWhen((errors) => errors.pipe(delayWhen(() => timer(2000))))
        // );
      )
      .subscribe((courses) => this.subject.next(courses));
  }

  selectByCourseId(courseId: number) {
    return this.courses$.pipe(
      map((courses) => courses.find((course) => course.id == courseId))
    );
  }

  filterByCategory(category: string) {
    return this.courses$.pipe(
      map((courses) => courses.filter((course) => course.category == category)),
      filter((course) => !!course)
    );
  }

  public saveCourse(courseId: number, change) {
    // 1) Optimistically modified the data in the Store
    const courses = this.subject.getValue();

    const courseIndex = courses.findIndex((course) => course.id === courseId);

    const newCourses = courses.slice(0); // make a full copy of the courses array

    newCourses[courseIndex] = {
      ...courses[courseIndex],
      ...change,
    };

    // 2) Passing to update the streams and the Data in the backend
    // and returning the promise
    this.subject.next(newCourses);

    return fromPromise(
      fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(change),
        headers: {
          "content-type": "aplication-json",
        },
      })
    );
  }

  public selectBeginnerCourses(): Observable<Course[]> {
    return this.filterByCategory("BEGINNER");
  }

  selectAdvancedCourses(): Observable<Course[]> {
    return this.filterByCategory("ADVANCED");
  }
}
