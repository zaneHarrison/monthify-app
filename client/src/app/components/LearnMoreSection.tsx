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
          Liked Songs data to automatically create monthly playlists within your
          Spotify account. Monthify creates two types of playlists: monthly
          playlists, and a "Monthify 30" playlist.<br></br>
          <br></br>
          Monthly playlists are titled "[current month] [current year]" and are
          created at the start of each month. As a user adds tracks to their
          Liked Songs during a particular month, the corresponding monthly
          playlist will be automatically updated to reflect these additions. If
          a user removes tracks from their Liked Songs, these changes will also
          be reflected in the monthly playlist. At the start of a new month, the
          previous monthly playlist will stop being updated and a new monthly
          playlist representing the new month will be created.
          <br></br>
          <br></br>
          The "Monthify 30" playlist operates similarly to the monthly
          playlists, although this is a single playlist that will continue to be
          updated as long as a user is signed up with Monthify. Instead of
          including the tracks that a user has added to their Liked Songs during
          a particular month, it will do this for any tracks that a user had
          added within the past 30 days. Thus, it is meant to provide a snapshot
          of a user's newly liked songs for the past month at any given point in
          time.
          <br></br>
          <br></br>
          Both the monthly playlists and the "Monthify 30" playlist will update
          multiple times per day in order to accurately reflect a user's
          listening activity.
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
        link="/login?optOut=true"
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
