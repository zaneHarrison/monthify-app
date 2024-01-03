import localFont from "next/font/local";
import styles from "../styles/LearnMoreSectionStyles.module.css";
import Button from "./Button";

const light = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Light.otf",
});

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

export function LearnMoreSection() {
  return (
    <div id="learn-more-section" className={styles.container}>
      <div id="title-text" className={styles.titleTextContainer}>
        <h1 className={bold.className}>How It Works</h1>
      </div>
      <div id="learn-more-text" className={styles.learnMoreTextContainer}>
        <p className={light.className}>
          After signing up with the button above, Monthify will access your
          Spotify playlist data to identify any songs you’ve added to any of
          your playlists during the current month. It will then add these songs
          to a new playlist titled “current month, current year”. For example,
          “December, 2023”. This monthly playlist will be updated every hour to
          reflect any changes in your playlist data (new songs added, old songs
          removed, etc.), and a new playlist will be created each month.
        </p>
        <p className={light.className}>
          The result is an automatically generated listening history neatly
          captured in monthly playlists.
        </p>
      </div>
      <Button
        target="_blank"
        className="learnMoreButton"
        text="View Code On GitHub"
        link="https://github.com/zaneHarrison/monthify-app/tree/main"
      />
      <Button
        target="_self"
        className="learnMoreButton"
        text="Opt-Out of Monthify"
        link="/opt_out"
      />
      <div id="created-by-text" className={styles.createdByTextContainer}>
        <p className={light.className}>
          Monthify and this website were created by{" "}
          <a href="https://www.linkedin.com/in/zane-harrison/" target="_blank">
            Zane Harrison
          </a>
          . <br />
          You can view his personal website{" "}
          <a href="https://zlh-personal-site.vercel.app/" target="_blank">
            here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
