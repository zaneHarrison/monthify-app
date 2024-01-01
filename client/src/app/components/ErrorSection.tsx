import localFont from "next/font/local";
import styles from "../styles/ErrorSection.module.css";
import Button from "./Button";

const light = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Light.otf",
});

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

export default function ErrorSection() {
  return (
    <div id="error-section" className={styles.container}>
      <div id="title-text" className={styles.titleTextContainer}>
        <h1 className={bold.className}>Oops, something went wrong.</h1>
      </div>
      <div id="error-text" className={styles.errorTextContainer}>
        <p className={light.className}>
          It looks like something went wrong and we were unable to complete your
          request. Sorry about that, this is the first time that's ever
          happened! Not really. But still, sorry.
          <br />
          You can use the button below to return to the homepage.
        </p>
      </div>
      <Button
        target="_self"
        className="signUpButton"
        text="Back to Home"
        link="/"
      />
    </div>
  );
}
