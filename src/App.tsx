import classes from "./data/classes.json";

export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <p className="app__eyebrow">Daggerheart</p>
        <h1 className="app__title">Character Creator</h1>
      </header>
      <section className="app__status">
        <p>
          Loaded <strong>{classes.length}</strong> {classes.length === 1 ? "class" : "classes"} from
          the rules data.
        </p>
        <p className="app__hint">
          This is the scaffolding stage. The character model, generator, and guided creation flow
          land in upcoming Threads.
        </p>
      </section>
    </main>
  );
}
