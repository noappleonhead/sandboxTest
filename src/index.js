import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Subject } from "rxjs";
import { filter, map, switchMap, scan, startWith } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import "./styles.css";

function fetchNames(numOfResults) {
  const api = `https://randomuser.me/api/?results=${numOfResults}&seed=rx-react&nat=us&inc=name&noinfo`;
  return ajax
    .getJSON(api)
    .pipe(
      map(({ results: users }) =>
        users.map(user => `${user.name.first} ${user.name.last}`)
      )
    );
}

function namesObservable(actions$) {
  return actions$.pipe(
    filter(action => action === "showmore"),
    startWith(null),
    scan(acc => 15 + acc, 0),
    switchMap(fetchNames)
  );
}

const useObservable = fn => {
  const [state, setState] = useState();
  const actions$ = useRef(new Subject()).current;
  const dispatch = useRef(v => actions$.next(v)).current;

  useEffect(() => {
    const newState$ = fn(actions$);
    const sub = newState$.subscribe(setState);
    return () => sub.unsubscribe();
  }, [fn, actions$]);

  return [state, dispatch];
};

function App({ namesPerPage = 10 }) {
  const [names, dispatch] = useObservable(namesObservable);

  return (
    <div className="App">
      <h1>RxJS with React</h1>
      <List items={names} />
      <button onClick={() => dispatch("showmore")}>Show More</button>
    </div>
  );
}

const List = ({ items = [], loading = false }) => (
  <ol className={loading ? "loading" : null}>
    {items.map(item => (
      <li key={item}>{item}</li>
    ))}
  </ol>
);

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
