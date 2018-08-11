import { Observer } from 'rxjs'

export const completeObserver = (observer: Observer<any>, ...objects: any[]) => {
    for (const obj of objects) {
        observer.next(obj)
    }
    observer.complete()
}
