import localFont from "next/font/local";
import styles from "../styles/IntroSectionStyles.module.css";
import Button from "./Button";

const light = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Light.otf",
});

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

export function IntroSection() {
  return (
    <div id="intro-section" className={styles.container}>
      <div id="title-text" className={styles.titleTextContainer}>
        <h1 className={bold.className}>
          Track your monthly
          <br /> listening with <br />
          Monthify
        </h1>
      </div>
      <div id="intro-text" className={styles.introTextContainer}>
        <p className={light.className}>
          Monthify is a free, no-download service that runs in the background to
          automatically create Spotify playlists each month based on your
          listening activity.
        </p>
      </div>
      <Button
        target="_self"
        className="signUpButton"
        text="Get Started With Monthify"
        link="/login"
      />
    </div>
  );
}
