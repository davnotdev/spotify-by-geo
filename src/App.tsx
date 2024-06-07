import { type Component } from "solid-js";
import Welcome from "./Welcome";
import Content from "./Content";

import styles from "./App.module.css";

const App: Component = () => {
  let maybeAccessToken: string | null = getQueryByName(
    window.location.href,
    "access_token",
  );
  let content = maybeAccessToken ? (
    <Content token={maybeAccessToken} />
  ) : (
    <Welcome />
  );

  return <div class={styles.App}>{content}</div>;
};

function getQueryByName(url: string, query: string): string | null {
  const urlObj = new URL(url);
  const fragmentParams = new URLSearchParams(urlObj.hash.substring(1));
  const queryValue = fragmentParams.get(query);
  return queryValue;
}

export default App;
